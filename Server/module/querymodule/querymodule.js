// import mongoose from "mongoose";
const e = require("express");
const mongoose = require("mongoose");
const techSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    category: { type: String, enum: ["SEO", "BPO", "Software Developer", "Digital Marketing","Web Development","Other"], required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Query", techSchema);
