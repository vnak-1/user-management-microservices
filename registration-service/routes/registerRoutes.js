// routes/registerRoutes.js  -->  Task 5
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// POST /register/userregister
router.post("/userregister", async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // 1. Validate input
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "name, email, password and phone are required.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format." });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const finalRole = (role || "user").toLowerCase();
    if (!["user", "admin"].includes(finalRole)) {
      return res.status(400).json({ success: false, message: "role must be 'user' or 'admin'." });
    }

    // 2. Check email is not already used
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered. Please use a different email.",
      });
    }

    // 3. Hash the password (never store plain text)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Store in MongoDB
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: finalRole,
      phone,
    });

    // 5. Return success (password is never sent back)
    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
    });
  } catch (error) {
    // safety net in case two duplicate requests race each other
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Email already registered." });
    }
    console.error("[REGISTRATION] error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;
