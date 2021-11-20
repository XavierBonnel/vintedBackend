const mongoose = require("mongoose");
const User = require("../models/User");

const Offer = mongoose.model("Offer", {
  product_name: {
    required: true,
    type: String,
    maxLength: 50,
  },
  product_description: {
    required: true,
    type: String,
    maxLength: 500,
  },
  product_price: {
    required: true,
    type: Number,
    max: 100000,
  },
  product_details: Object,
  product_image: { type: mongoose.Schema.Types.Mixed, default: {} },
  //problèmes ci-dessous
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  //fin du problème
});

module.exports = Offer;
