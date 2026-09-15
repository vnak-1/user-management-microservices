// routes/userRoutes.js  -->  Task 9
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// GET /user/viewprofile  -> always the OWN profile, taken from the verified token
router.get("/viewprofile", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("[USER] viewprofile error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// PUT /user/updateprofile   body: { name?, phone?, password? }
router.put("/updateprofile", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const { name, phone, password, email, role } = req.body;

    // a user must not be able to change their own email or promote themselves
    if (email || role) {
      return res.status(400).json({
        success: false,
        message: "email and role cannot be updated. Only name, phone and password are editable.",
      });
    }

    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long.",
        });
      }
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nothing to update. Send at least one of: name, phone, password.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("[USER] updateprofile error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;
