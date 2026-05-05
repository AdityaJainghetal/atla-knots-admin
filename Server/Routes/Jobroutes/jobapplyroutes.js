const express = require("express");
const router = express.Router();

const {
  createApplyJob,
  getAllApplyJobs,
  getApplyJobById,
  updateApplyJob,
  deleteApplyJob,
} = require("../../controller/jobcontroller/createJobController");   // ← Adjust path if needed

// ====================== JOB APPLICATION ROUTES ======================

// Create New Job
router.post("/", createApplyJob);

// Get All Jobs
router.get("/", getAllApplyJobs);

// Get Single Job by ID
router.get("/:id", getApplyJobById);

// Update Job
router.put("/:id", updateApplyJob);

// Delete Job
router.delete("/:id", deleteApplyJob);

module.exports = router;