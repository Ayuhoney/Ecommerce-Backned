// const { string, required, boolean } = require("joi");
const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const orderSchema = new mongoose.Schema(
  {
    userId: {
      // required: true,
      type: ObjectId,
      ref: "User",
    }, //userId, refs to User Model
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        canceled: {
          type: Boolean,
          default: false,
        },
      },
    ],    
    totalPrice: {
      type: Number,
      require: [true, "Holds total price of all the items in the cart"],
    },
    totalItems: {
      type: Number,
      require: [true, "Holds total number of items in the cart"],
    },

    totalQuantity: {
      type: Number,
      require: ["Holds total number of quantity in the cart"],
    },
    status: {
      type: String,
      enum: ["delivered", "completed", "canceled"],
      default: "completed",
    },

    shippingInfo: {
      name: {
        type: String,
        // required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        house: {
          type: String,
          required: true,
          trim: true,
        },

        city: {
          type: String,
          required: true,
          trim: true,
        },
        state: {
          type: String,
          required: true,
          trim: true,
        },
        pincode: {
          type: Number,
          required: true,
        },
      },
    },
    email: {
      type: String,
    },
    paymentStatus: {
      type: String,
      default: "payment_pending",
    },
    paymentId: {
      type: String,
      default: "",
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("order", orderSchema);