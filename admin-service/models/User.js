// models/User.js  -->  Task 3
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,   // email must be unique
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true }, // always stored hashed
    role: { type: String, enum: ["user", "admin"], default: "user" },
    phone: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,      // adds createdAt + updatedAt automatically
    collection: "users",
  }
);

module.exports = mongoose.model("User", userSchema);
