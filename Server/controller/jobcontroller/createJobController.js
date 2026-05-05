
const ApplyJob = require("../../module/Jobmodule/jobmodule");
const JobCategory = require("../../module/Jobmodule/jobcaetgorymodule"); // Fixed spelling

// ====================== CREATE ======================
const createApplyJob = async (req, res) => {
  try {
    const { title, category, description, endDate } = req.body;

    // Check if category exists
    const categoryExists = await JobCategory.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid Category ID. Category does not exist.",
      });
    }

    const newJob = new ApplyJob({
      title,
      category,
      description,
      endDate,
    });

    const savedJob = await newJob.save();

    // Populate category while returning
    const populatedJob = await ApplyJob.findById(savedJob._id).populate(
      "category",
      "name title"   // Add more fields if needed
    );

    res.status(201).json({
      success: true,
      message: "Job Application Created Successfully",
      data: populatedJob,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ====================== READ ALL ======================
const getAllApplyJobs = async (req, res) => {
  try {
    const jobs = await ApplyJob.find()
      .populate("category", "name title")   // Fixed & improved
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ====================== READ SINGLE ======================
const getApplyJobById = async (req, res) => {
  try {
    const job = await ApplyJob.findById(req.params.id).populate(
      "category",
      "name title"
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job Application Not Found",
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ====================== UPDATE ======================
const updateApplyJob = async (req, res) => {
  try {
    // If category is being updated, validate it
    if (req.body.category) {
      const categoryExists = await JobCategory.findById(req.body.category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid Category ID.",
        });
      }
    }

    const updatedJob = await ApplyJob.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("category", "name title");

    if (!updatedJob) {
      return res.status(404).json({
        success: false,
        message: "Job Application Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job Application Updated Successfully",
      data: updatedJob,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ====================== DELETE ======================
const deleteApplyJob = async (req, res) => {
  try {
    const deletedJob = await ApplyJob.findByIdAndDelete(req.params.id);

    if (!deletedJob) {
      return res.status(404).json({
        success: false,
        message: "Job Application Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job Application Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createApplyJob,
  getAllApplyJobs,
  getApplyJobById,
  updateApplyJob,
  deleteApplyJob,
};