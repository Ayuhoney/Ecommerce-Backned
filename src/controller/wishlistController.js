const userModel = require("../model/userModel")
const productModel = require("../model/productModel")
const wishlistModel = require("../model/wishlistModel")


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






module.exports = { addToWishlist, getWishlist, removeFromWishlist };

























