const techModel = require("../../module/techmodule/techmodule");
const categoryModel = require("../../module/techmodule/categorymodule");
const imageKit = require("imagekit");
const imagekit = require("../../utils/imagekit.js"); // note: consistent naming (lowercase 'i')


// const createTech = async (req, res) => {
//   try {
//     const { title, description, category } = req.body;

//     if (!title || !description || !category) {
//       return res.status(400).json({
//         success: false,
//         message: "Title, description, and category are required",
//       });
//     }

//     const categoryExists = await categoryModel.findById(category);
//     if (!categoryExists) {
//       return res.status(404).json({
//         success: false,
//         message: "Category not found",
//       });
//     }

//     if (!req.files || !req.files.images) {
//       return res.status(400).json({
//         success: false,
//         message: "Image is required",
//       });
//     }

//     const files = Array.isArray(req.files.images)
//       ? req.files.images
//       : [req.files.images];

//     const uploadedImages = [];

//     for (let file of files) {
//       const uploadResponse = await imagekit.upload({
//         file: file.data.toString("base64"), // 🔥 FIXED
//         fileName: file.name,
//       });

//       uploadedImages.push(uploadResponse.url);
//     }
//     console.log("Headers:", req.headers);
//     console.log("Files:", req.files);

//     const newTech = new techModel({
//       title,
//       description,
//       category,
//       images: uploadedImages,
//     });

//     await newTech.save();

//     res.status(201).json({
//       success: true,
//       message: "Tech created successfully",
//       data: newTech,
//     });
//   } catch (error) {
//     console.error("Error creating tech:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message, // 👈 show real error
//     });
//   }
// };

const createTech = async (req, res) => {
  try {
    const { title, description, category, link } = req.body;

    if (!title || !description || !category || !link) {
      return res.status(400).json({
        success: false,
        message: "Title, description, category and link are required",
      });
    }

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

    const newTech = new techModel({
      title,
      description,
      category,
      link, // ✅ link add
      images: uploadedImages,
    });

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


// const updateTech = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, description, category, images } = req.body;
//     const updateFields = {};
//     if (title?.trim()) updateFields.title = title.trim();
//     if (description?.trim()) updateFields.description = description.trim();
//     if (category) {
//       const categoryExists = await categoryModel.findById(category);
//       if (!categoryExists) {
//         return res.status(404).json({
//           success: false,
//           message: "Category not found",
//         });
//       }
//       updateFields.category = category;
//     }
//     if (images && Array.isArray(images) && images.length > 0) {
//       updateFields.images = images;
//     }
//     const updatedTech = await techModel.findByIdAndUpdate(
//       id,
//       { $set: updateFields },
//       { new: true },
//     );
//     if (!updatedTech) {
//       return res.status(404).json({
//         success: false,
//         message: "Tech content not found",
//       });
//     }
//     res.status(200).json({
//       success: true,
//       message: "Tech content updated successfully",
//       data: updatedTech,
//     });
//   } catch (error) {
//     console.error("Error updating tech content:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

const updateTech = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, images, link } = req.body;

    const updateFields = {};

    if (title?.trim()) updateFields.title = title.trim();
    if (description?.trim()) updateFields.description = description.trim();
    if (link?.trim()) updateFields.link = link.trim(); // ✅ add

    if (category) {
      const categoryExists = await categoryModel.findById(category);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
      updateFields.category = category;
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

const getTechData = async (req, res) => {
  try {
    const techData = await techModel
      .find()
      .populate("category", "name") // sirf category ka name lana ho to
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: techData.length,
      message: "Tech data fetched successfully",
      data: techData,
    });
  } catch (error) {
    console.error("Error fetching tech data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

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
