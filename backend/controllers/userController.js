const bcrypt = require("bcryptjs");           // ✅ import bcrypt
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const OTP = require("../models/OtpModel");         // ✅ import OTP model

// Register User with OTP verification
exports.registerUser = async (req, res) => {
  try {
    console.log("👉 Incoming body:", req.body);  // debug

    const { name, email, password, phoneNumber, otp } = req.body;

    if (!name || !email || !password || !phoneNumber || !otp) {
      return res.status(400).json({ error: "All fields + OTP are required" });
    }

    // 1️⃣ Check OTP
    const otpRecord = await OTP.findOne({ where: { email, otp } });
    if (!otpRecord) return res.status(400).json({ error: "Invalid OTP" });

    // 2️⃣ Check expiry
    if (otpRecord.expiresAt < Date.now()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Create user
    const user = await User.create({
      name,
      email,
      phoneNumber,
      passwordHash: hashedPassword,
    });

    // 5️⃣ Delete OTP after successful registration
    await otpRecord.destroy();

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("❌ Error registering user:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 2️⃣ Compare hashed password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 3️⃣ Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("❌ Error logging in user:", error);
    res.status(500).json({ error: "Failed to login" });
  }
};

// ✅ Create User Without OTP (for admin/test purposes)
exports.createUserWithoutOtp = async (req, res) => {
  try {
    console.log("👉 Incoming body:", req.body);

    const { name, email, password, phoneNumber } = req.body;

    if (!name || !email || !password || !phoneNumber) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // 🔍 Check if user already exists
    const existingAdmin = await User.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    // 🔑 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 📝 Create user
    const user = await User.create({
      name,
      email,
      phoneNumber,
      passwordHash: hashedPassword,
    });

    res.status(201).json({ 
      message: "User created successfully (without OTP)", 
      user 
    });
  } catch (error) {
    console.error("❌ Error creating user without OTP:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
};


// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json({ users });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Get single user
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};
