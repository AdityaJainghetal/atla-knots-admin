

const imagekit = require("../../utils/imagekit.js");
const Product = require("../../module/homemodule/homemodule");
const Category = require("../../module/BlogModule/caetgorymodule.js");


// ============================
// CREATE PRODUCT
// ============================
const createContent = async (req, res) => {
  try {
    const { name, description, category,author } = req.body;

    if (!name || !description || !category || !author) {
      return res.status(400).json({
        success: false,
        message: "Name, description, and category are required",
      });
    }

    // ✅ Check Category Exist
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // ✅ Handle Image Upload
    if (!req.files || !req.files.images) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    const uploadedImages = [];

    const files = Array.isArray(req.files.images)
      ? req.files.images
      : [req.files.images];

    for (let file of files) {
      const uploadResponse = await imagekit.upload({
        file: file.data,
        fileName: `product-${Date.now()}-${file.name}`,
        folder: "/productImages",
        useUniqueFileName: true,
      });

      uploadedImages.push(uploadResponse.url);
    }

    const newProduct = new Product({
      name,
      description,
      category,
      author,
      images: uploadedImages,
    });

    await newProduct.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });

  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


// ============================
// GET ALL PRODUCTS
// ============================
const getHomeData = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: products,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};


// ============================
// UPDATE PRODUCT
// ============================
const updateHomeData = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, author, category } = req.body;

    const updateFields = {};

    if (name?.trim()) {
      updateFields.name = name.trim();
    }

    if (description?.trim()) {
      updateFields.description = description.trim();
    }

    if (author?.trim()) {
      updateFields.author = author.trim();
    }

    if (category?.trim()) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
      updateFields.category = category;
    }

    // Handle image replacement (if new images sent → replace all)
    if (req.files && req.files.images) {
      const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      const uploadedImages = [];

      for (const file of files) {
        const uploadRes = await imagekit.upload({
          file: file.data,
          fileName: `product-update-${Date.now()}-${file.name}`,
          folder: "/productImages",
          useUniqueFileName: true,
        });
        uploadedImages.push(uploadRes.url);
      }

      updateFields.images = uploadedImages;
    }

    // Prevent empty update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate("category", "name");

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


// ============================
// DELETE PRODUCT
// ============================
const deletedContent = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: deletedProduct,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

const getSingleContent = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format (optional but good practice)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await Product.findById(id)
      .populate({
        path: "category",
        select: "name description", // bring only needed fields (add more if required)
      })
      .lean(); // faster + plain object (good for API responses)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    console.error("GET SINGLE PRODUCT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product details",
      error: error.message,
    });
  }
};


module.exports = {
  createContent,
  getHomeData,
  getSingleContent,
  deletedContent,
  updateHomeData,
};