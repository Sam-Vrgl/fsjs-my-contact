const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');

dotenv.config();
const PORT = process.env.PORT || 5000;

// e.g. http://localhost:3000 (CRA) or http://localhost:5173 (Vite)
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://localhost:3000',
];

connectDB();

const app = express();

// Only set this if you're actually behind a proxy (Render, Nginx, etc.)
app.set('trust proxy', 1);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (credentials + dynamic origin)
app.use(cors({
  origin(origin, callback) {
    // Allow non-browser tools (Postman/Thunder) where origin is undefined
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Don’t throw; just block with false so it becomes a CORS rejection
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Cookies after CORS is fine
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Optional: minimal error handler to surface CORS denials as 403 instead of 500
app.use((err, req, res, next) => {
  if (err && err.message && err.message.startsWith('CORS')) {
    return res.status(403).json({ message: 'CORS blocked' });
  }
  next(err);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
