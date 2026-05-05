const mongoose = require("mongoose");
const JobApplication = require("../../module/Jobmodule/applicationmodule"); // Path adjust karo
const ApplyJob = require("../../module/Jobmodule/jobmodule");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { name, email, phone, coverLetter } = req.body;

    if (!isValidObjectId(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const jobExists = await ApplyJob.findById(jobId);
    if (!jobExists) {
      return res.status(404).json({
        success: false,
        message: "Job Not Found",
      });
    }

    const alreadyApplied = await JobApplication.findOne({ job: jobId, email });
    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    const newApplication = new JobApplication({
      job: jobId,
      name,
      email,
      phone,
      coverLetter,
    });

    const savedApplication = await newApplication.save();

    // Populate job title while returning
    const populatedApp = await JobApplication.findById(
      savedApplication._id,
    ).populate("job", "title category endDate");

    res.status(201).json({
      success: true,
      message: "Application Submitted Successfully!",
      data: populatedApp,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ====================== GET ALL APPLICATIONS (Admin Dashboard) ======================
const getAllApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find()
      .populate("job", "title endDate") // ← Job Title yahan aa raha hai
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====================== GET APPLICATIONS BY JOB ======================
const getApplicationsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!isValidObjectId(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const applications = await JobApplication.find({ job: jobId })
      .populate("job", "title endDate")
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      jobTitle: applications[0]?.job?.title || "N/A",
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====================== UPDATE STATUS ======================
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const updated = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    ).populate("job", "title");

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    res.status(200).json({
      success: true,
      message: "Status Updated Successfully",
      data: updated,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  applyToJob,
  getAllApplications,
  getApplicationsByJob,
  updateApplicationStatus,
};
