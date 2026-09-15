// login-service/server.js
require("dotenv").config();
const express = require("express");
const DBConnect = require("./config/DBConnect");
const internalOnly = require("./middleware/internalOnly");
const loginRoutes = require("./routes/loginRoutes");

const app = express();
app.use(express.json());

DBConnect();

app.use("/auth", internalOnly, loginRoutes);

app.get("/health", (req, res) =>
  res.json({ success: true, service: "Login Service #2", status: "running" })
);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`[LOGIN SERVICE] running on http://localhost:${PORT}`));
