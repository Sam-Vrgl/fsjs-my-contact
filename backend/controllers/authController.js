const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
};


const buildCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';

  let sameSite = (process.env.COOKIE_SAMESITE || 'Lax');
  let secure = (process.env.COOKIE_SECURE || (isProd ? 'true' : 'false')) === 'true';

  if (sameSite.toLowerCase() === 'none') secure = true;

  const maxAgeMs =
    parseInt(process.env.JWT_COOKIE_MAX_AGE_MS || '', 10) ||
    60 * 60 * 1000;

  return {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: maxAgeMs,
    path: '/',
  };
};

const sendTokenResponse = (res, user) => {
  const token = generateToken(user._id);
  const cookieOptions = buildCookieOptions();

  res.cookie('token', token, cookieOptions);

  return res.status(200).json({
    message: 'Authenticated',
    userId: user._id,
    role: user.role,
  });
};

exports.registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const user = await User.create({ email, password });
    return sendTokenResponse(res, user);

  } catch (error) {
    console.error('[registerUser] error:', error);
    return res.status(400).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return sendTokenResponse(res, user);
  } catch (error) {
    console.error('[loginUser] error:', error);
    return res.status(500).json({ message: error.message });
  }
};

exports.logoutUser = async (_req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return res.status(200).json({ message: 'Logged out' });
};


exports.getMe = async (req, res) => {
  try {
    const me = await User.findById(req.user._id).select('-password');
    if (!me) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json(me);
  } catch (e) {
    console.error('[getMe] error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
};
