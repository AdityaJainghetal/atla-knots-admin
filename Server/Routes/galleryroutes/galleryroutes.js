const express = require("express");
const router = express.Router();

const {
  createContent,
  getHomeData,
  getSingleContent,
  updateHomeData,
  deletedContent,
} = require("../../controller/gallerycontroller/gallerycontroller.js");

// ============================
// CREATE Gallery
// POST → /api/gallery
// ============================
router.post("/", createContent);

// ============================
// GET ALL Gallery
// GET → /api/gallery
// ============================
router.get("/", getHomeData);

// ============================
// GET SINGLE Gallery
// GET → /api/gallery/:id
// ============================
router.get("/:id", getSingleContent);

// ============================
// UPDATE Gallery
// PUT → /api/gallery/:id
// ============================
router.put("/:id", updateHomeData);

// ============================
// DELETE Gallery
// DELETE → /api/gallery/:id
// ============================
router.delete("/:id", deletedContent);

module.exports = router;