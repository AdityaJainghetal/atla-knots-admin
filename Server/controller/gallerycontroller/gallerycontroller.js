const imagekit = require("../../utils/imagekit.js");
const Gallery = require("../../module/gallerymodule/gallerymoduel.js");

// ============================
// CREATE Gallery (Only name + images)
// ============================
const createContent = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!req.files || !req.files.images) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    const files = Array.isArray(req.files.images)
      ? req.files.images
      : [req.files.images];

    const uploadedImages = [];

    for (let file of files) {
      const uploadResponse = await imagekit.upload({
        file: file.data,
        fileName: `Gallery-${Date.now()}-${file.name}`,
        folder: "/GalleryImages",
        useUniqueFileName: true,
      });

      uploadedImages.push(uploadResponse.url);
    }

    const newGallery = new Gallery({
      name,
      images: uploadedImages,
    });

    await newGallery.save();

    return res.status(201).json({
      success: true,
      message: "Gallery created successfully",
      data: newGallery,
    });

  } catch (error) {
    console.error("Create Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


// ============================
// GET ALL Gallery
// ============================
const getHomeData = async (req, res) => {
  try {
    const galleries = await Gallery.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: galleries,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Gallery",
      error: error.message,
    });
  }
};


// ============================
// GET SINGLE Gallery
// ============================
const getSingleContent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Gallery ID format",
      });
    }

    const gallery = await Gallery.findById(id).lean();

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: "Gallery not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: gallery,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Gallery",
      error: error.message,
    });
  }
};


// ============================
// UPDATE Gallery
// ============================
const updateHomeData = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updateFields = {};

    if (name?.trim()) {
      updateFields.name = name.trim();
    }

    if (req.files && req.files.images) {
      const files = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

      const uploadedImages = [];

      for (let file of files) {
        const uploadRes = await imagekit.upload({
          file: file.data,
          fileName: `Gallery-update-${Date.now()}-${file.name}`,
          folder: "/GalleryImages",
          useUniqueFileName: true,
        });

        uploadedImages.push(uploadRes.url);
      }

      updateFields.images = uploadedImages;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    const updatedGallery = await Gallery.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedGallery) {
      return res.status(404).json({
        success: false,
        message: "Gallery not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Gallery updated successfully",
      data: updatedGallery,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


// ============================
// DELETE Gallery
// ============================
const deletedContent = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedGallery = await Gallery.findByIdAndDelete(id);

    if (!deletedGallery) {
      return res.status(404).json({
        success: false,
        message: "Gallery not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Gallery deleted successfully",
      data: deletedGallery,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete Gallery",
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