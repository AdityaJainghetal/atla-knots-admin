const mongoose = require("mongoose");

const techSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true 
    },
    phone: { 
      type: String, 
      required: true,
      trim: true 
    },
    email: { 
      type: String, 
      required: true,
      trim: true,
      lowercase: true 
    },
    message: { 
      type: String, 
      required: true 
    },
    category: { 
      type: String, 
      enum: ["SEO", "BPO", "Software Developer", "Digital Marketing", "Web Development", "Other"], 
      required: true 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Popmodule", techSchema);