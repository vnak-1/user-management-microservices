// middleware/auth.js  -->  Task 7
const jwt = require("jsonwebtoken");

const authorize = (requiredRole) => (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }
  const token = authHeader.split(" ")[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This API is restricted to '${requiredRole}' role only. Your token role is '${decoded.role}'.`,
      });
    }
    req.user = decoded; // { id, email, role }
    next();
  } catch (error) {
    // b) Expired / invalid token
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please login again.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

module.exports = authorize;
