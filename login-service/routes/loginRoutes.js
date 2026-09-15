// routes/loginRoutes.js  -->  Task 6
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// POST /auth/login    body: { email, password, role }
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "email, password and role are required.",
      });
    }

    if (!["user", "admin"].includes(role.toLowerCase())) {
      return res.status(400).json({ success: false, message: "role must be 'user' or 'admin'." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // one identical message for every failure case, so an attacker cannot
    // work out which part was wrong
    const FAIL = { success: false, message: "Invalid email, password or role." };

    if (!user) return res.status(401).json(FAIL);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json(FAIL);

    if (user.role !== role.toLowerCase()) return res.status(401).json(FAIL);

    // matched -> issue the JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      role: user.role,
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      token,
    });
  } catch (error) {
    console.error("[LOGIN] error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;
