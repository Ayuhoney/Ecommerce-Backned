const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      ref: "User",
      trim: true,
      required: true,
    },
    products: [
      {
        required: true,
        type: ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("wishlist", wishlistSchema);
