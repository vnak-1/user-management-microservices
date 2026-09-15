// registration-service/server.js
require("dotenv").config();
const express = require("express");
const DBConnect = require("./config/DBConnect");
const internalOnly = require("./middleware/internalOnly");
const registerRoutes = require("./routes/registerRoutes");

const app = express();
app.use(express.json());

DBConnect();

// every /register/* call must arrive from the API Gateway
app.use("/register", internalOnly, registerRoutes);

app.get("/health", (req, res) =>
  res.json({ success: true, service: "Registration Service #1", status: "running" })
);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`[REGISTRATION SERVICE] running on http://localhost:${PORT}`)
);
