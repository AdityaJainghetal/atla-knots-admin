
const mongoose = require("mongoose");
const techSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "techCategory",
      required: true,
    },
    images: [{ type: String, required: true }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Technology", techSchema);
