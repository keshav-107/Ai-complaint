const jwt = require('jsonwebtoken');

/**
 * protect – Verifies JWT Bearer token and attaches decoded user to req.user
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }
  try {
    const token = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET_KEY);
    req.user = token;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

/**
 * errorHandler – Global Express error-handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};

module.exports = { protect, errorHandler };
