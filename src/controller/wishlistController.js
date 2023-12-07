const userModel = require("../model/userModel")
const productModel = require("../model/productModel")
const wishlistModel = require("../model/wishlistModel")

const Cart = require("../../src/model/cartModel");
const Wishlist = require("../../src/model/wishlistModel");
const Product = require("../../src/model/productModel");

const addToWishlist = async function (req, res) {
    try {
        let userId = req.user.userId;
        let productId = req.body.productId
        let product = await productModel.findById(productId);
        if (!product) {
            return res.status(400).send({ status: false, message: " invalid productId " });
        }
        let user = await userModel.findById(userId);
        if (!user) {
            return res.status(400).send({ status: false, message: "invalid userId and token " });
        }

        let userWishlist = await wishlistModel.findOne({ userId });
        if (!userWishlist) {
            let wishlist = await wishlistModel.create({ userId, products: [productId] });
            return res.status(201).send({ status: true, message: "Added to wishlist", wishlist});
        } else {
            let products = userWishlist.products;
            let previouslyAdded = products.findIndex((x) => x == productId);
            if (previouslyAdded !== -1) {
                return res.status(400).send({ status: false, message: "This product is already in your wishlist" });
            }
            products.push(productId);
            let wishlist = await wishlistModel.findByIdAndUpdate(userWishlist._id, { $set: { products: products } },
                { new: true }).populate("products");
            return res.status(201).send({ status: true, message: " Added to wishlist", wishlist });
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    };

}


const getWishlist = async function (req, res) {
  try {
    let userId = req.user.userId;

    //checking if the userWishlist exist with this userId or not
    let userWishlist = await wishlistModel.findOne({ userId }).populate("products");
    return res.status(200).send({status: true, message: "Success", wishlist: userWishlist });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    let userId = req.user.userId;
    let productId = req.body.productId;
    let userWishlist = await wishlistModel.findOne({ userId: userId });
    let filteredList = userWishlist.products.filter(
      (x) => x.toString() !== productId.toString()
    );
  
    let wishlist = await wishlistModel
      .findByIdAndUpdate(
        userWishlist._id,
        { $set: { products: filteredList } },
        { new: true }
      )
      .populate("products");
    return res.status(200).send({ status: true, wishlist });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};


const addToCartFromWishlist = async function (req, res) {
  try {
    let userId = req.user.userId;

    // wishlistId is provided in the request body
    let { wishlistId } = req.body;
    if (!wishlistId) {
      return res.status(400).send({ status: false, message: "Please provide a wishlist Id" });
    }

    let wishlist = await Wishlist.findById(wishlistId);
    if (!wishlist) {
      return res.status(400).send({ status: false, message: "Wishlist not found" });
    }

    let userCart = await Cart.findOne({ userId: userId });
    let cart = {};
    if (!userCart) {
      cart.userId = userId;
      cart.items = [];
      cart.totalItems = 0;
      cart.totalPrice = 0;
    } else {
      cart = {
        items: userCart.items,
        totalItems: userCart.totalItems,
        totalPrice: userCart.totalPrice,
      };
    }

    for (const productId of wishlist.products) {
      let product = await Product.findById(productId);
      if (product) {
        let existingItem = cart.items.find(item => item.productId == productId);

        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cart.items.push({ productId, quantity: 1 });
        }
        cart.totalItems += 1;
        cart.totalPrice += product.price;
      }
    }

    // Update or create the cart in the database
    let update = await Cart.findOneAndUpdate(
      { userId: userId },
      cart,
      { new: true, upsert: true }
    ).populate("items.productId");
    
    //deleted from wishlist
    await Wishlist.findByIdAndDelete(wishlistId);

    return res.status(201).send({ status: true, message: "Items added from wishlist to cart", cart: update });
  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
};

module.exports = { addToWishlist, getWishlist, removeFromWishlist ,addToCartFromWishlist};

























