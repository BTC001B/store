const multer = require("multer");
const path = require("path");

// Storage config (local for now)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/reviews/"); // store inside uploads/reviews
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images are allowed!"), false);
  }
});

module.exports = upload;
