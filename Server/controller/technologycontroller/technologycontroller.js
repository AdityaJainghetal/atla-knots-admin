

const techModel = require("../../module/technologymodule/technologymodule.js");
const categoryModel = require("../../module/technologymodule/categorymodule.js");
const imagekit = require("../../utils/imagekit.js");

// ================= CREATE TECH =================
const createTech = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and category are required",
      });
    }

    // ✅ Check category exists
    const categoryExists = await categoryModel.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (!req.files || !req.files.images) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const files = Array.isArray(req.files.images)
      ? req.files.images
      : [req.files.images];

    const uploadedImages = [];

    for (let file of files) {
      const uploadResponse = await imagekit.upload({
        file: file.data.toString("base64"),
        fileName: file.name,
      });

      uploadedImages.push(uploadResponse.url);
    }

    // ✅ Only ObjectId stored in category
    const newTech = new techModel({
      title: title.trim(),
      description: description.trim(),
      category: categoryExists._id,
      images: uploadedImages,
    });
    console.log(newTech,"newTechnewTechnewTech")
    await newTech.save();

    res.status(201).json({
      success: true,
      message: "Tech created successfully",
      data: newTech,
    });

  } catch (error) {
    console.error("Error creating tech:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= UPDATE TECH =================
const updateTech = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, images } = req.body;

    const updateFields = {};

    if (title?.trim()) updateFields.title = title.trim();
    if (description?.trim()) updateFields.description = description.trim();

    // ✅ Only ObjectId update
    if (category) {
      const categoryExists = await categoryModel.findById(category);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
      updateFields.category = categoryExists._id;
    }

    if (images && Array.isArray(images) && images.length > 0) {
      updateFields.images = images;
    }

    const updatedTech = await techModel.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedTech) {
      return res.status(404).json({
        success: false,
        message: "Tech content not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tech content updated successfully",
      data: updatedTech,
    });

  } catch (error) {
    console.error("Error updating tech content:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// ================= GET TECH =================
const getTechData = async (req, res) => {
  try {

    const techData = await techModel
      .find()
      .populate("category", "name")
      .sort({ createdAt: -1 });
// console.log(techData,"techDatatechData")
    res.status(200).json({
      success: true,
      count: techData.length,
      message: "Tech data fetched successfully",
      data: techData,
    });

  } catch (error) {
    console.error("Error fetching tech data:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// ================= DELETE TECH =================
const deleteTech = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTech = await techModel.findByIdAndDelete(id);

    if (!deletedTech) {
      return res.status(404).json({
        success: false,
        message: "Tech content not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tech content deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting tech content:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


module.exports = {
  createTech,
  getTechData,
  deleteTech,
  updateTech,
};
