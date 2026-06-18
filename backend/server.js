// Load environment variables FIRST (before anything else)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

// Import our database connection function
const connectDB = require('./config/db');

// Import all routes
const bookRoutes = require('./routes/bookRoutes');
const studentRoutes = require('./routes/studentRoutes');
const issueRoutes = require('./routes/issueRoutes');

// Import error handler middleware
const errorHandler = require('./middleware/errorHandler');

// ──────────────────────────────────────────────
// Initialize Express App
// ──────────────────────────────────────────────
const app = express();

// ──────────────────────────────────────────────
// Connect to MongoDB
// ──────────────────────────────────────────────
connectDB();

// ──────────────────────────────────────────────
// MIDDLEWARE (runs on every request)
// ──────────────────────────────────────────────

// Security headers
app.use(helmet());

// Enable CORS — Allow requests from React frontend (port 5173 or 3000)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

// Parse JSON request bodies
// This lets us read req.body in our controllers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logger (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ──────────────────────────────────────────────
// ROUTES
// All routes are prefixed with /api/
// ──────────────────────────────────────────────
app.use('/api/books', bookRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/issues', issueRoutes);

// ──────────────────────────────────────────────
// ROOT ROUTE — Test if server is running
// ──────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '📚 Library Management System API',
    status: 'Running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      books: '/api/books',
      students: '/api/students',
      issues: '/api/issues'
    }
  });
});

// ──────────────────────────────────────────────
// 404 HANDLER — Route not found
// ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ──────────────────────────────────────────────
// GLOBAL ERROR HANDLER (must be LAST)
// ──────────────────────────────────────────────
app.use(errorHandler);

// ──────────────────────────────────────────────
// START SERVER
// ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n====================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
  console.log('====================================\n');
});