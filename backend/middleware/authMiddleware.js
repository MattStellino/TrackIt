const jwt = require('jsonwebtoken');

/**
 * Authentication middleware to verify JWT tokens
 * Extracts user ID from token and adds it to request object
 */
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if authorization header exists and has Bearer token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Extract token from Bearer header
  const token = authHeader.split(' ')[1];

  try {
    // Verify JWT token and extract user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
