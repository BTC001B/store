const express = require("express");
const { registerUser,loginUser,createUserWithoutOtp,getAllUsers,getUserById } = require("../controllers/userController");
const {requestOtp,forgotPasswordRequestOtp,forgotPasswordVerifyOtp,forgotPasswordReset} =require("../controllers/authController");

const router = express.Router();

router.post("/request-otp", requestOtp);   // Step 1 → Send OTP
router.post("/register", registerUser);  
router.post("/login",loginUser);
router.post("/no-otp",createUserWithoutOtp);
router.get("/",getAllUsers);
router.get("/userid/:userId",getUserById);
router.post('/forgot-password/request-otp', forgotPasswordRequestOtp);
router.post('/forgot-password/verify-otp', forgotPasswordVerifyOtp);
router.post('/forgot-password/reset', forgotPasswordReset);
module.exports = router;
