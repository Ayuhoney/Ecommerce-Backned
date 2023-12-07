const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const productCotroller = require("../controller/productController");
const cartController = require("../controller/cartController");
const orderController = require("../controller/orderController");
const midd = require("../middleware/auth");
const stripeController = require("../controller/stripeController")
const wishlistController = require("../controller/wishlistController")

//user route
router.post("/signup", userController.signUp);
router.post("/login", userController.loginUser);
router.post("/forgotPassword", userController.forgetPassword);
router.put("/resetPassword/:emailToken", userController.updatePassword);
router.get("/logout", midd.authentication, userController.logout);
router.post("/refresh-token", userController.refreshToken);

//product route
router.post("/product", productCotroller.createProduct);
router.get("/limited-products", productCotroller.getLimitedProducts);
router.get("/popular-products", productCotroller.getPopularProducts);
router.get("/products", productCotroller.getAllproducts);
router.get("/getProductById/:id", productCotroller.getProductById);
router.get("/products/search", productCotroller.searchProduct)

//cart route
router.post("/cart", midd.authentication, cartController.createCart);
router.get("/cart", midd.authentication, cartController.getCartDetails);
router.put("/cart", midd.authentication, cartController.updateCart);
router.put( "/local-cart", midd.authentication, cartController.addToCartFromLocalStorage);


//order route
router.post("/order",  orderController.createOrder);
router.get("/order", midd.authentication, orderController.getOrder);
router.get("/order/:orderId" ,orderController.getOrderById)
router.get("/track/:orderId", orderController.trackOrderById);
router.put("/order/:orderId", midd.authentication, orderController.cancelProductInOrder);
router.put("/order/cancel/:orderId", midd.authentication, orderController.cancelOrder);


///wishlist 
router.post("/wishlist", midd.authentication, wishlistController.addToWishlist)
router.get("/wishlist", midd.authentication, wishlistController.getWishlist);
router.put("/wishlist", midd.authentication, wishlistController.removeFromWishlist);
router.post("/wishlist/Buy", midd.authentication,wishlistController.addToCartFromWishlist);

//payment 
router.post("/payment", stripeController.payment)
router.post("/paymentStatus", stripeController.paymentStatus);


router.all("/*", (req, res) => {
  return res
    .status(404)
    .send({ status: false, msg: "   provide a correct end point " });
});

module.exports = router;



