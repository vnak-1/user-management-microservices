// middleware/requireRole.js
// Second layer of defence. The Gateway already checked the JWT role, but the
// service re-checks the role header so it can never be reached by the wrong role.
module.exports = (expectedRole) => (req, res, next) => {
  if (req.headers["x-user-role"] !== expectedRole) {
    return res.status(403).json({
      success: false,
      message: `Access denied. '${expectedRole}' role required.`,
    });
  }
  next();
};
