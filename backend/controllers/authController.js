const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcryptjs");
const OTP = require("../models/OtpModel");
const User = require('../models/User');


exports.requestOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });

    // 1️⃣ Check if user already exists
    const existingAdmin = await User.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // 2️⃣ Generate 6-digit numeric OTP
    const otp = otpGenerator.generate(6, { 
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: true
    });

    // 3️⃣ Save OTP in DB (overwrite if already exists for that email)
    await OTP.upsert({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // 4️⃣ Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { 
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🔐 Your OTP for Registration",
      text: `Your One-Time Password (OTP) is: ${otp}\n\nThis will expire in 5 minutes.`,
    });

    res.json({ message: "✅ OTP sent successfully" });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};



exports.forgotPasswordRequestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // check if user exists
    const existingAdmin = await User.findOne({ where: { email } });
    if (!existingAdmin) {
      return res.status(404).json({ error: "No account found with this email" });
    }

    // generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });

    // save or update OTP
    await OTP.upsert({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🔐 OTP for Password Reset",
      text: `Your OTP is: ${otp}. It expires in 5 minutes.`,
    });

    res.json({ message: "✅ OTP sent for password reset" });
  } catch (error) {
    console.error("❌ Error sending forgot password OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};




exports.forgotPasswordVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email & OTP are required" });

    const record = await OTP.findOne({ where: { email } });
    if (!record) return res.status(400).json({ error: "No OTP found. Request again." });

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    if (record.otp !== parseInt(otp)) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    res.json({ message: "✅ OTP verified successfully" });
  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    res.status(500).json({ error: "OTP verification failed" });
  }
};

// 3️⃣ Reset Password
exports.forgotPasswordReset = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Email, OTP, and new password are required" });
    }

    const record = await OTP.findOne({ where: { email } });
    if (!record) return res.status(400).json({ error: "No OTP found. Request again." });

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    if (record.otp !== parseInt(otp)) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // update user password
    await User.update(
      { password: hashedPassword },
      { where: { email } }
    );

    // delete OTP after reset
    await OTP.destroy({ where: { email } });

    res.json({ message: "✅ Password reset successful" });
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    res.status(500).json({ error: "Password reset failed" });
  }
};
