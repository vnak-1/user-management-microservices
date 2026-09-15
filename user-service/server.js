// user-service/server.js
require("dotenv").config();
const express = require("express");
const DBConnect = require("./config/DBConnect");
const internalOnly = require("./middleware/internalOnly");
const requireRole = require("./middleware/requireRole");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(express.json());

DBConnect();

app.use("/user", internalOnly, requireRole("user"), userRoutes);

app.get("/health", (req, res) =>
  res.json({ success: true, service: "User Service #5", status: "running" })
);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`[USER SERVICE] running on http://localhost:${PORT}`));
