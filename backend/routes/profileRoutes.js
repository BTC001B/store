const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");

// GET all profiles
router.get("/profiles/all", profileController.getAllProfiles);

// GET profile by ID
router.get("/:id", profileController.getProfile);

// UPSERT profile by userId
router.post("/:id", profileController.updateProfile);

// DELETE profile by ID
router.delete("/:id", profileController.deleteProfile);

module.exports = router;
