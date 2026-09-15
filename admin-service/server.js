// admin-service/server.js
require("dotenv").config();
const express = require("express");
const DBConnect = require("./config/DBConnect");
const internalOnly = require("./middleware/internalOnly");
const requireRole = require("./middleware/requireRole");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
app.use(express.json());

DBConnect();

app.use("/admin", internalOnly, requireRole("admin"), adminRoutes);

app.get("/health", (req, res) =>
  res.json({ success: true, service: "Admin Service #4", status: "running" })
);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`[ADMIN SERVICE] running on http://localhost:${PORT}`));
