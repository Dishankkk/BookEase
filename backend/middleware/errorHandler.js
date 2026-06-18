const errorHandler = (err, req, res, next) => {
  // Log error in console for debugging
  console.error('❌ Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', err.stack);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific MongoDB/Mongoose errors
  
  // Duplicate key error (e.g., same roll number registered twice)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists. Please use a different ${field}.`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    // Extract all validation messages
    const messages = Object.values(err.errors).map(e => e.message);
    message = messages.join('. ');
  }

  // Mongoose cast error (e.g., invalid ObjectId format)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Only show detailed error in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;