const express = require('express');
const router = express.Router();
const { 
  sendOTP,            
  verifyOTP,          
  forgotPasswordRequestOtp, 
  forgotPasswordVerifyOtp, 
  forgotPasswordReset 
} = require('../controllers/authController');


router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

router.post('/forgot-password/request-otp', forgotPasswordRequestOtp);
router.post('/forgot-password/verify-otp', forgotPasswordVerifyOtp);
router.post('/forgot-password/reset', forgotPasswordReset);

module.exports = router;
