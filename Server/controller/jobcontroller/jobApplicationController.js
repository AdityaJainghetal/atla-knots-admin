const mongoose = require("mongoose");
const JobApplication = require("../../module/Jobmodule/applicationmodule");
const ApplyJob = require("../../module/Jobmodule/jobmodule");
const cloudinary = require("../../utils/cloudinary");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ====================== UPLOAD RESUME ======================
const uploadResumeToCloudinary = async (resumeFile) => {
  const validTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!validTypes.includes(resumeFile.mimetype)) {
    throw new Error("Resume must be a PDF, DOC, or DOCX file only.");
  }

  const fileData = `data:${resumeFile.mimetype};base64,${resumeFile.data.toString("base64")}`;

  const uploadResponse = await cloudinary.uploader.upload(fileData, {
    resource_type: "auto",
    folder: "resumes",
    public_id: `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Better unique name
    overwrite: false,
  });

  return uploadResponse.secure_url;
};

// ====================== APPLY TO JOB ======================
const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { name, email, phone } = req.body;
    const resumeFile = req.files?.resume;

    // Basic Validation
    if (!isValidObjectId(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and phone are required",
      });
    }

    if (!resumeFile) {
      return res.status(400).json({
        success: false,
        message: "Resume is required",
      });
    }

    // Check if job exists
    const jobExists = await ApplyJob.findById(jobId);
    if (!jobExists) {
      return res.status(404).json({
        success: false,
        message: "Job Not Found",
      });
    }

    // Check if already applied
    const alreadyApplied = await JobApplication.findOne({ job: jobId, email });
    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    // Upload resume
    const resumeUrl = await uploadResumeToCloudinary(resumeFile);

    // Create application
    const newApplication = new JobApplication({
      job: jobId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      resumeUrl,
    });

    const savedApplication = await newApplication.save();

    // Populate job details
    const populatedApp = await JobApplication.findById(savedApplication._id)
      .populate("job", "title category endDate companyName"); // Add more fields if needed

    res.status(201).json({
      success: true,
      message: "Application Submitted Successfully!",
      data: populatedApp,
    });
  } catch (error) {
    console.error("Apply Job Error:", error);

    // Better error response
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong while submitting application",
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
