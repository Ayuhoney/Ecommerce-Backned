
const stripe = require("stripe")("sk_test_51OI6mCSHtZOZPQIvYEuqWfugOH7y5petyTLUtZE4WZIf7ZG9B2L3H6pkwoW8YBqfyT0ZUKtHE0m0fZo69FAgzXBk00bGJGyaAT");
const mailTrackId = require("../validators/sendOrderSummaryMail")
const orderModel = require("../model/orderModel");
const productModel = require("../model/productModel");




const payment = async (req, res, next) => {
  try {

    let items = req.body.items
    let session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: req.body.items.map((item) => ({
        price_data: {
          currency: "INR",
          product_data: {
            name: item.productId.title,
            images: item.productId.images,
          },
          unit_amount: item.productId.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.HOST_URL}/success`,
      cancel_url: `${process.env.HOST_URL}/failed`,
    });

    if (req.body.form.email) {
      let order = await orderModel.findOne({
        email: req.body.form.email,
        paymentStatus: "payment_pending",
      })

      if (order) {
        order.paymentId = session.id;
    
        await order.save();
      }
    } else {
      
      let order = await orderModel.findOne({
        userId: items.userId,
        paymentStatus :"payment_pending"
      });
      if (order) {
        order.paymentId = session.id;
        await order.save();
      }
    }
    res.status(200).json(session);
  } catch (error) {
    next(error);
  }
}

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
        // Send email with tracking ID
        await mailTrackId(order.userId.email, order);
      }

      // Update order payment status
      order.paymentStatus = paymentIntent;
      await order.save();

      // Respond with success
      return res.status(200).json({ paymentIntent: paymentIntent, orderId: order._id });
    } else {
      // Handle the case where no order is found
      return res.status(404).json({ error: 'Order not found' });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  paymentStatus,
  payment,
};



