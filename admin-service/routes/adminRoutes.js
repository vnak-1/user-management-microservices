// routes/adminRoutes.js  -->  Task 8
const express = require("express");
const User = require("../models/User");

const router = express.Router();

// GET /admin/searchuser?query=john     (also accepts ?name= or ?email=)
router.get("/searchuser", async (req, res) => {
  try {
    const term = req.query.query || req.query.name || req.query.email;

    if (!term) {
      return res.status(400).json({
        success: false,
        message: "Provide a search term, e.g. /admin/searchuser?query=john",
      });
    }

    // escape regex special characters so a search like "a+b" cannot break
    const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const users = await User.find({
      $or: [
        { name: { $regex: safeTerm, $options: "i" } },
        { email: { $regex: safeTerm, $options: "i" } },
      ],
    }).select("-password");

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No user found matching '${term}'.`,
      });
    }

    return res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error("[ADMIN] searchuser error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// GET /admin/viewalluser
router.get("/viewalluser", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: users.length ? "All users retrieved." : "No users in the database yet.",
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("[ADMIN] viewalluser error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// DELETE /admin/deluser     body: { "email": "..." }   (also accepts ?email=)
router.delete("/deluser", async (req, res) => {
  try {
    const email = req.body.email || req.query.email;

    if (!email) {
      return res.status(400).json({ success: false, message: "email is required to delete a user." });
    }

    // an admin should not be able to delete their own account
    if (email.toLowerCase() === (req.headers["x-user-email"] || "").toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account.",
      });
    }

    const deletedUser = await User.findOneAndDelete({ email: email.toLowerCase() }).select("-password");

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: `No user found with email '${email}'.` });
    }

    return res.status(200).json({
      success: true,
      message: `User '${email}' deleted successfully.`,
      data: deletedUser,
    });
  } catch (error) {
    console.error("[ADMIN] deluser error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;
