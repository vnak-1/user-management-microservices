// middleware/internalOnly.js
// Blocks anyone who tries to hit this microservice directly instead of
// going through the API Gateway. The Gateway is the only component that
// knows the INTERNAL_KEY.
module.exports = (req, res, next) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_KEY) {
    return res.status(403).json({
      success: false,
      message: "Direct access is not allowed. All requests must go through the API Gateway.",
    });
  }
  next();
};
