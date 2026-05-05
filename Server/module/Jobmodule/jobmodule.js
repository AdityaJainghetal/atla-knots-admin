// import mongoose from "mongoose";
const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCategory",
      required: true,
    },
    description: { type: String, required: true },
    endDate: { type: Date, required: true },
    resumeUrl: { type: String },
    createdTime: { type: Date, default: Date.now },
  },

  { timestamps: true },
);

module.exports = mongoose.model("Applyjob", productSchema);
