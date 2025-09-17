const jwt = require('jsonwebtoken');
const User = require('../models/User');

function getTokenFromReq(req) {
  if (req.cookies && req.cookies.token) return req.cookies.token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
}

const protect = async (req, res, next) => {
  const token = getTokenFromReq(req);

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findOne({ _id: decoded.id }).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found or deactivated' });
    }

    next();
  } catch (error) {
    console.error('[protect] JWT error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: `User role '${req.user.role}' is not authorized to access this route` });
    }
    next();
  };
};

module.exports = { protect, authorize };
