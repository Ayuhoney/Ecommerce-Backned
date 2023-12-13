const productModel = require("../model/productModel");
const cartModel = require("../model/cartModel");
const { isValidBody, isValidId } = require("../validators/validator");
const { getUserId } = require("./userController.js");

const findOrCreateCart = async (userId, cartModel) => {
  let userCart = await cartModel.findOne({ userId });
  if (!userCart) {
    const newCart = await cartModel.create({ userId, items: [], totalItems: 0, totalPrice: 0 });
    return newCart;
  }
  return userCart;
};

const updateCartItem = (cart, productId, quantity, productPrice) => {
  let isExist = false;
  cart.items.forEach((item) => {
    if (item.productId === productId) {
      isExist = true;
      item.quantity += quantity;
    }
  });
  if (!isExist) {
    cart.items.push({ productId, quantity });
  }
};

const calculateCartTotal = (cart, productPrice, quantity) => {
  cart.totalItems += quantity;
  cart.totalPrice += productPrice * quantity;
};

const createCart = async (req, res, cartModel, productModel) => {
  try {
    const userId = req.user.userId;
    const data = req.body;

    if (!isValidBody(data)) {
      return res.status(400).send({ status: false, message: "Please provide request body" });
    }

    const { productId } = data;

    if (!isValidId(productId)) {
      return res.status(400).send({ status: false, message: "Please provide a valid product Id" });
    }

    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(400).send({ status: false, message: "This product is not found in the product model" });
    }

    let userCart = await findOrCreateCart(userId, cartModel);

    const quantity = 1;
    updateCartItem(userCart, productId, quantity, product.price);
    calculateCartTotal(userCart, product.price, quantity);

    const updatedCart = await cartModel
      .findByIdAndUpdate(userCart._id, userCart, { new: true })
      .populate("items.productId");

    return res.status(201).send({ status: true, message: "Item added successfully", cart: updatedCart });
  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
};

const getCartDetails = async function (req, res) {
  try {
    let userId = req.user.userId;

    //checking if the cart exist with this userId or not
    let userCart = await cartModel
      .findOne({ userId })
      .populate("items.productId");

    return res
      .status(200)
      .send({ status: true, message: "Success", cart: userCart });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

const updateCart = async (req, res, cartModel, productModel) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;

    if (Object.keys(req.body).length !== 2) {
      return res.status(400).send({ status: false, message: "Invalid request" });
    }

    if (!productId) {
      return res.status(400).send({ status: false, message: "Please provide productId" });
    }

    const product = await productModel.findById(productId._id);

    if (!product) {
      return res.status(404).send({ status: false, message: "Product not found with given Id" });
    }

    if (quantity > product.stock) {
      return res.status(400).send({
        status: false,
        message: `Maximum quantity to buy is ${product.stock} for this product because stock is not available`,
      });
    }

    let userCart = await cartModel.findOne({ userId });
    let itemIndex = userCart.items.findIndex((item) => item.productId.toString() === productId._id.toString());

    if (itemIndex === -1) {
      return res.status(404).send({
        status: false,
        message: "This product is not found in your cart",
      });
    }

    const cartItem = userCart.items[itemIndex];
    let updatedCart = { items: [...userCart.items], totalItems: userCart.totalItems, totalPrice: userCart.totalPrice };

    if (quantity < 1) {
      updatedCart.items.splice(itemIndex, 1);
      updatedCart.totalItems -= cartItem.quantity;
      updatedCart.totalPrice -= cartItem.quantity * product.price;

    } else {
      updatedCart.totalItems += quantity - cartItem.quantity;
      updatedCart.totalPrice += (quantity * product.price - cartItem.quantity * product.price);
      cartItem.quantity = quantity;
    }

    const cart = await cartModel
      .findByIdAndUpdate(userCart._id, updatedCart, { new: true })
      .populate("items.productId");

    return res.status(200).send({ status: true, message: "Cart updated", cart: cart });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

const findCartItemIndex = (cartItems, productId) => {
  return cartItems.findIndex(
    (item) => item.productId._id == productId._id
  );
};

const addToCart = async (userId, items) => {
  return cartModel.create({
    userId,
    items,
    totalPrice: 0,
    totalItems: 0,
  });
};

const updateCarts = (userCart, items) => {
  let totalItems = 0;
  let totalPrice = 0;

  items.forEach((newItem) => {
    const existingIndex = findCartItemIndex(userCart.items, newItem.productId);

    if (existingIndex !== -1) {
      userCart.items[existingIndex].quantity += newItem.quantity;
    } else {
      userCart.items.push(newItem);
    }
  });

  userCart.items.forEach((item) => {
    totalItems += item.quantity;
    totalPrice += item.quantity * item.productId.price;
  });

  userCart.totalItems = totalItems;
  userCart.totalPrice = totalPrice;

  return userCart.save();
};

const addToCartFromLocalStorage = async (req, res) => {
  try {
    const userId = getUserId();
    const items = req.body.cart.items;

    let userCart = await cartModel.findOne({ userId }).populate("items.productId");

    if (!userCart) {
      const newCart = await addToCart(userId, items);
      return res
        .status(201)
        .send({ status: true, message: "Items added to cart", cart: newCart });
    } else {
      await updateCarts(userCart, items);

      return res.status(200).send({ cart: userCart });
    }
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

module.exports = {
  createCart,
  getCartDetails,
  updateCart,
  addToCartFromLocalStorage,
  findOrCreateCart,
  updateCartItem,
  calculateCartTotal,
  findCartItemIndex,
  updateCarts,
  addToCart,
};
