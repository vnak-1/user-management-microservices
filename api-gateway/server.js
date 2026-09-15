// api-gateway/server.js  -->  Task 4 + Task 7
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const authorize = require("./middleware/auth");

const app = express();
app.use(cors());
app.use(express.json());

const SERVICES = {
  registration: process.env.REGISTRATION_URL,
  login: process.env.LOGIN_URL,
  admin: process.env.ADMIN_URL,
  user: process.env.USER_URL,
};

/**
 * Generic forwarder.
 * Rebuilds the incoming request against the target microservice and adds:
 *   x-internal-key -> proves the call came from the Gateway
 *   x-user-*       -> the identity the Gateway already verified from the JWT
 */
const forward = (target, label) => async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${target}${req.originalUrl}`,
      data: req.body,
      headers: {
        "Content-Type": "application/json",
        "x-internal-key": process.env.INTERNAL_KEY,
        ...(req.user && {
          "x-user-id": req.user.id,
          "x-user-email": req.user.email,
          "x-user-role": req.user.role,
        }),
      },
      validateStatus: () => true, // pass the service's status code straight through
      timeout: 10000,
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`[GATEWAY] ${label} unreachable:`, error.message);
    return res.status(503).json({
      success: false,
      message: `${label} is currently unavailable.`,
    });
  }
};

// ---------------- PUBLIC ROUTES (no token needed) ----------------
app.use("/register", forward(SERVICES.registration, "Registration Service"));
app.use("/auth", forward(SERVICES.login, "Login Service"));

// ---------------- PROTECTED ROUTES (JWT + role check) ----------------
app.use("/admin", authorize("admin"), forward(SERVICES.admin, "Admin Service"));
app.use("/user", authorize("user"), forward(SERVICES.user, "User Service"));

// ---------------- malformed JSON body ----------------
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON in request body. Check for a missing comma or quote.",
    });
  }
  next(err);
});

// ---------------- health + 404 ----------------
app.get("/", (req, res) =>
  res.json({ success: true, service: "API Gateway", status: "running" })
);

app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found on the Gateway.` })
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[API GATEWAY] running on http://localhost:${PORT}`));
