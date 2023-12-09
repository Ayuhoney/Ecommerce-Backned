const { default: mongoose } = require("mongoose");
const cartModel = require("../model/cartModel");
const orderModel = require("../model/orderModel");
const productModel = require("../model/productModel");
const bcrypt = require("bcrypt");
// const { orderSchema } = require("../validators/schemaValidation");
const userModel = require("../model/userModel");
const ObjectId = mongoose.Types.ObjectId;
const validObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId);
};

const createOrder = async (req, res) => {
  try {
    let { userId, items, totalItems, totalPrice } = req.body.order;
    let { bname, email,password,name, phone, house, city, state, pincode } = req.body.form;
    
   //if guest checkout
    if (email && email.length) {
       let user = await userModel.findOne({ email });
       if (user) {
         return res
           .status(400)
           .send({ status: false, message: "You have an account,Please login " });
       }
      const orderDetails = {
        name: bname,
        email,
        password,
        items,
        totalItems: totalItems,
        totalPrice: totalPrice,
        products: items,

        shippingInfo: {
          name ,
          phone ,
          address: {
            house: house,
            city: city,
            state: state,
            pincode: pincode,
          },
        },
      };

      let hash = await bcrypt.hash(password, 10);

      let newUser = await userModel.create({name:bname , email:email, password:hash})
      orderDetails.userId = newUser._id


      let order = await orderModel.create(orderDetails);
      items.forEach(async (item) => {
        await productModel.findByIdAndUpdate(
          item.productId._id,
          { $inc: { stock: -item.quantity } },
          { new: true }
        );
      });
      // console.log(order);
      return res
        .status(201)
        .send({ status: true, message: "Order placed ", order });
    } else {
      let cartDetail = await cartModel
        .findOne({ userId: userId })
        .populate("items.productId", "stock");

      if (!cartDetail) {
        return res
          .status(404)
          .send({ status: false, message: "User cart not found" });
      }
      if (items.length <= 0) {
        return res.status(400).send({
          status: false,
          message: "Please add some items in cart to place order",
        });
      }

      const filter = items.filter((x) => x.quantity > x.productId.stock);
      if (filter.length > 0) {
        return res.status(400).send({
          status: false,
          message: "some product are out of stock",
          filter,
          items,
        });
      }

      let order = {
        userId,
        items: items,
        totalItems: totalItems,
        totalPrice: totalPrice,
        products: items,
        shippingInfo: {
          name: name,
          phone: phone,
          address: {
            house: house,
            city: city,
            state: state,
            pincode: pincode,
          },
        },
      };
      // create order and update product stocks
      let createdata = await orderModel.create(order);
      items.forEach(async (item) => {
        await productModel.findByIdAndUpdate(
          item.productId._id,
          { $inc: { stock: -item.quantity } },
          { new: true }
        );
      });
      //cart empty after order  successfully placed  
      await cartModel.findByIdAndUpdate(
        cartDetail._id,
        { $set: { items: [], totalItems: 0, totalPrice: 0 } },
        { new: true }
      );

      return res.status(200).send({
        status: true,
        message: "order placed successfully",
        data: createdata,
      });
    }
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

///get all orders
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
///get order by orderId
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

// cancel product in order
const cancelProductInOrder = async (req, res) => {
  try {
    let { productId } = req.body;
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
    if (!productId) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide productId" });
    }
    if (!ObjectId.isValid(productId)) {
      return res.status(400).send({ status: false, message: "invlid productId" });
    }
    let userOrder = await orderModel.findById(orderId);
    if (!userOrder) {
      return res
        .status(404)
        .send({ status: false, message: "order not found with this id" });
    }

    if (userId.valueOf() != userOrder.userId.valueOf()) {
      return res.status(403).send({
        status: false,
        message: "Forbidden you have not access to update this",
      });
    }
    if (userOrder.status !== "completed") {
      return res
        .status(400)
        .send({ status: false, message: "Order cannot be updated" });
    }
    let product = await productModel
      .findById(productId)
     
    if (!product) {
      return res
        .status(404)
        .send({ status: false, message: "productId invalid" });
    }
    if (userOrder.items.length === 0) {
      return res
        .status(400)
        .send({ status: false, message: "your order is already empty" });
    }
    // get quantity of removed product
    let quantity = 0;
    userOrder.items.map((x) => {
      if (x.productId.valueOf() === productId) {
        quantity = x.quantity;
      }
    });
    // filtering the product that user want to delete or remove
    userOrder.items.map((x) => {
      if (x.productId.toString() == productId) {
        x.canceled = true;
      }
    });
    // console.log("productId ==>",userOrder.items)

    product.stock += quantity;
    await product.save();
    let updatedData = {};
    updatedData.items = userOrder.items,
      updatedData.totalItems = userOrder.totalItems - quantity,
      updatedData.totalPrice =
        userOrder.totalPrice - product.price * quantity;
// console.log(updatedData);
    if (updatedData.totalPrice === 0) {
    let order = await orderModel
      .findByIdAndUpdate(
        orderId,
        {
          $set: {
            items: updatedData.items,
            totalItems: updatedData.totalItems,
            totalPrice: updatedData.totalPrice,
            status:"canceled"
          },
        },
        { new: true }
      )
      .populate("items.productId");
      return res
        .status(200)
        .send({ status: true, message: "order updated", order });
    } else {
      // console.log(updatedData);
      let order = await orderModel
        .findByIdAndUpdate(
          orderId,
          { $set: {items:updatedData.items,totalItems:updatedData.totalItems,totalPrice:updatedData.totalPrice} },
          { new: true }
        )
        .populate("items.productId");
      return res
        .status(200)
        .send({ status: true, message: "order updated", order });
    }
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

//  cancel user order with orderId in params and userId from auth

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

//track order by guest user only
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

module.exports = {
  createOrder,
  getOrder,
  cancelOrder,
  cancelProductInOrder,
  getOrderById,
  trackOrderById,
};
