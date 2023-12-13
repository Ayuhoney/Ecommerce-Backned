const stripe = require("stripe")("sk_test_51OI6mCSHtZOZPQIvYEuqWfugOH7y5petyTLUtZE4WZIf7ZG9B2L3H6pkwoW8YBqfyT0ZUKtHE0m0fZo69FAgzXBk00bGJGyaAT");
const mailTrackId = require("../validators/sendOrderSummaryMail");
const orderModel = require("../model/orderModel");
const productModel = require("../model/productModel");

const allowedCurrencies = ["USD", "EUR", "INR"];

const getExchangeRate = (currency) => {
  const exchangeRate = {
    INR: 1,
    USD: 0.012,
    // Add other currencies and exchange rates as needed
  };

  return exchangeRate[currency] || 1;
};
const createStripeSession = async (items, currency) => {
  return stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.productId.title,
          images: item.productId.images,
        },
        unit_amount: Math.round(item.productId.price * getExchangeRate(currency) * 100),
      },
      quantity: item.quantity,
    })),
    mode: "payment",
    success_url: `${process.env.HOST_URL}/success`,
    cancel_url: `${process.env.HOST_URL}/failed`,
  });
};
const updateOrderPaymentInfo = async (order, session, items, currency) => {
  order.paymentId = session.id;
  order.totalAmount = items.reduce(
    (total, item) => total + item.productId.price * item.quantity * getExchangeRate(currency),
    0
  );
  await order.save();
};

const payment = async (req, res, next) => {
  try {
    const { items, form } = req.body;
    const currency = req.body.currency || "INR";

    if (!allowedCurrencies.includes(currency)) {
      throw new Error("Invalid currency");
    }

    const exchangeRate = getExchangeRate(currency);

    let order;

    if (form.email) {
      order = await orderModel.findOne({
        email: form.email,
        paymentStatus: "payment_pending",
      });
    } else {
      order = await orderModel.findOne({
        userId: items.userId,
        paymentStatus: "payment_pending",
      });
    }
    if (order) {
      const session = await createStripeSession(items, currency);
      await updateOrderPaymentInfo(order, session, items, currency);
      res.status(200).json(session);
    } else {
      res.status(400).json({ error: "Order not found or payment already processed" });
    }
  } catch (error) {
    next(error);
  }
};
const paymentStatus = async (req, res) => {
  try {
    const c_id = req.body.id;

    let session = await stripe.checkout.sessions.retrieve(c_id);
    let paymentIntent = "";

    if (session.payment_intent) {
      paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent
      );
      paymentIntent = paymentIntent.status;
    } else {
      paymentIntent = "payment_failed";
    }

    let order = await orderModel.findOne({ paymentId: c_id }).populate(["items.productId", "userId"]);

    if (order) {
      // If payment failed, update product stocks
      if (paymentIntent === "payment_failed") {
        order.items.forEach(async (item) => {
          await productModel.findByIdAndUpdate(
            item.productId._id,
            { $inc: { stock: +item.quantity } },
            { new: true }
          );
        });
      } else {
        await mailTrackId(order.userId.email, order);
      }

      order.paymentStatus = paymentIntent;
      await order.save();

      return res.status(200).json({ paymentIntent: paymentIntent, orderId: order._id });
    } else {
      return res.status(404).json({ error: 'Order not found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createStripeSession,
  getExchangeRate,
  updateOrderPaymentInfo,
  paymentStatus,
  payment,
};



