const Profile = require("../models/Profile");

// Get all profiles
exports.getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.findAll();
    res.json(profiles);
  } catch (error) {
    console.error("Error in getAllProfiles:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get profile by userId
exports.getProfile = async (req, res) => {
  try {
    const { id } = req.params; // userId
    const profile = await Profile.findOne({ where: { userId: id } });
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Upsert profile (create or update by userId)
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params; // userId
    const data = req.body;

    let profile = await Profile.findOne({ where: { userId: id } });

    if (!profile) {
      // If profile doesn't exist → create one
      profile = await Profile.create({ ...data, userId: id });
      return res.json({ message: "Profile created successfully", profile });
    }

    // If profile exists → update it
    await profile.update(data);
    res.json({ message: "Profile updated successfully", profile });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete profile by userId
exports.deleteProfile = async (req, res) => {
  try {
    const { id } = req.params; // userId
    const deleted = await Profile.destroy({ where: { userId: id } });
    if (!deleted) return res.status(404).json({ error: "Profile not found" });
    res.json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProfile:", error);
    res.status(500).json({ error: "Server error" });
  }
};
