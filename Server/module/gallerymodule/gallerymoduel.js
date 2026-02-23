// import mongoose from "mongoose";
const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    images: [{ type: String, required: true }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Gallery", productSchema);
