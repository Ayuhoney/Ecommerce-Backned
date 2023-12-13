const { default: mongoose } = require("mongoose");
const cartModel = require("../model/cartModel");
const orderModel = require("../model/orderModel");
const productModel = require("../model/productModel");
const bcrypt = require("bcrypt");
const userModel = require("../model/userModel");
const ObjectId = mongoose.Types.ObjectId;
const isValidObjectId = (id) => Types.ObjectId.isValid(id);
const { Types } = require('mongoose');
const validObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId);
};


const createOrder = async (req, res) => {
  try {
    const { userId, items, totalItems, totalPrice } = req.body.order;
    const { bname, email, password, name, phone, house, city, state, pincode } = req.body.form;

    let guestCheckout = false;

    if (email && email.length) {
      guestCheckout = true;
    }

    if (guestCheckout) {
      let user = await userModel.findOne({ email });

      if (user) {
        return res.status(400).send({ status: false, message: "You have an account,Please login " });
      }

      const orderDetails = {
        name: bname,
        email,
        password,
        items,
        totalItems,
        totalPrice,
        products: items,
        shippingInfo: {
          name,
          phone,
          address: {
            house,
            city,
            state,
            pincode,
          },
        },
      };

      let hash = await bcrypt.hash(password, 10);

      let newUser = await userModel.create({ name: bname, email, password: hash });
      orderDetails.userId = newUser._id;

      let order = await orderModel.create(orderDetails);

      await updateProductStocks(items);

      return res.status(201).send({ status: true, message: "Order placed", order });
    } else {
      let cartDetail = await cartModel.findOne({ userId }).populate("items.productId", "stock");

      if (!cartDetail) {
        return res.status(404).send({ status: false, message: "User cart not found" });
      }

      if (items.length <= 0) {
        return res.status(400).send({ status: false, message: "Please add some items in cart to place an order" });
      }

      const filter = items.filter((x) => x.quantity > x.productId.stock);
      if (filter.length > 0) {
        return res.status(400).send({ status: false, message: "Some products are out of stock", filter, items });
      }

      let order = {
        userId,
        items,
        totalItems,
        totalPrice,
        products: items,
        shippingInfo: {
          name,
          phone,
          address: {
            house,
            city,
            state,
            pincode,
          },
        },
      };

      // Create order and update product stocks
      let createdData = await orderModel.create(order);
      await updateProductStocks(items);

      // Empty the cart after the order is successfully placed
      await cartModel.findByIdAndUpdate(
        cartDetail._id,
        { $set: { items: [], totalItems: 0, totalPrice: 0 } },
        { new: true }
      );

      return res.status(200).send({ status: true, message: "Order placed successfully", data: createdData });
    }
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const updateProductStocks = async (items) => {
  for (const item of items) {
    await productModel.findByIdAndUpdate(
      item.productId._id,
      { $inc: { stock: -item.quantity } },
      { new: true }
    );
  }
};

const getOrder = async function (req, res) {
  try {
    let userId = req.user.userId;
    //checking if the cart exist with this userId or not
    let findOrder = await orderModel
      .find({ userId: userId })
      .populate("items.productId");

    if (!findOrder)
      return res
        .status(404)
        .send({ status: false, message: `No cart found with given userId` });

    return res
      .status(200)
      .send({ status: true, message: "Success", data: findOrder });
  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
};
const getOrderById = async (req, res) => {
  try {
    // let userId = req.user.userId;
    let orderId = req.params.orderId;
    let order = await orderModel
      .findOne({
        _id: orderId,
     
      })
      .populate("items.productId");
    if (!order) {
      return res
        .status(404)
        .send({ status: false, message: "You have not completed any order" });
    }
    return res.status(200).send({ status: true, message: "Order details", order });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    let orderId = req.params.orderId;
    let userId = req.user.userId;
    if (!orderId) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide orderId" });
    }
    if (!ObjectId.isValid(orderId)) {
      return res.status(400).send({ status: false, message: "invlid orderId" });
    }
    let userOrder = await orderModel
      .findById(orderId)
      .populate("items.productId");

    if (userId.valueOf() != userOrder.userId.valueOf()) {
      return res.status(403).send({
        status: false,
        message: "Forbidden you have not access to update this",
      });
    }
    if (userOrder.status !== "completed") {
      return res
        .status(400)
        .send({ status: false, message: "Order cannot be cancel" });
    }
    userOrder.items.forEach(async (product) => {
      await productModel.findByIdAndUpdate(
        product.productId,
        { $inc: { stock: +product.quantity } },
        { new: true }
      );
    });
    const order = await orderModel.findByIdAndUpdate(
      orderId,
      { $set: { status: "canceled", canceledOn: new Date().toLocaleString() } },
      { new: true },
      // { new: true }
    ).populate("items.productId");
    return res
      .status(200)
      .send({ status: true, message: "order cancled", order })
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};
const trackOrderById = async (req, res) => {
  try {
    let orderId = req.params.orderId;
    if (!validObjectId(orderId)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter a valid orderId" });
    }
    let order = await orderModel
      .findOne({ _id: orderId })
      .populate("items.productId");
    //  if order not found with orderId or order doesn't have email in it.
    if (!order) {
      return res
        .status(400)
        .send({ status: false, message: "You have not completed any order" });
    }
    return res
      .status(200)
      .send({ status: true, message: "Order details",order });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const getOrderByIds = async (orderId, orderModel) => {
  return orderModel.findById(orderId);
};
const isUserAuthorized = (userId, userOrder) => {
  return userId.valueOf() === userOrder.userId.valueOf();
};
const cancelProductInOrder = async (req, res, orderModel, productModel, responseBuilder) => {
  try {
    const { productId } = req.body;
    const orderId = req.params.orderId;
    const userId = req.user.userId;

    if (!orderId || !isValidObjectId(orderId)) {
      return responseBuilder.error(400, "Invalid orderId or productId");
    }

    const userOrder = await getOrderByIds(orderId, orderModel);

    if (!userOrder) {
      return responseBuilder.error(404, "Order not found with this id");
    }

    if (!isUserAuthorized(userId, userOrder)) {
      return responseBuilder.error(403, "Forbidden, you do not have access to update this order");
    }

    if (userOrder.status !== "completed") {
      return responseBuilder.error(400, "Order cannot be updated");
    }

    const product = await productModel.findById(productId);

    if (!product) {
      return responseBuilder.error(404, "Invalid productId");
    }

    if (userOrder.items.length === 0) {
      return responseBuilder.error(400, "Your order is already empty");
    }

    let quantity = 0;
    userOrder.items.forEach((x) => {
      if (x.productId.valueOf() === productId) {
        quantity = x.quantity;
        x.canceled = true;
      }
    });

    product.stock += quantity;
    await product.save();

    const updatedData = {
      items: userOrder.items,
      totalItems: userOrder.totalItems - quantity,
      totalPrice: userOrder.totalPrice - product.price * quantity
    };

    const updateFields = {
      items: updatedData.items,
      totalItems: updatedData.totalItems,
      totalPrice: updatedData.totalPrice
    };

    if (updatedData.totalPrice === 0) {
      updateFields.status = "canceled";
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { $set: updateFields },
      { new: true }
    ).populate("items.productId");

    return responseBuilder.responseBuilder(200, "Order updated", updatedOrder);
  } catch (error) {
    return responseBuilder.responseBuilder(500, "fail order");
  }
};



module.exports = {
  createOrder,
  getOrder,
  cancelOrder,
  cancelProductInOrder,
  getOrderById,
  trackOrderById,
  isValidObjectId,
  getOrderByIds,
  isUserAuthorized,
};
