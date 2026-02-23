// import mongoose from "mongoose";
const mongoose = require("mongoose");
const techSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    link: {
      type: String,
      required: true, // agar optional rakhna ho to remove kar dena
    },

    images: [{ type: String, required: true }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Tech", techSchema);
