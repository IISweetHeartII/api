/**
 * Global error handling middleware
 */

const config = require('../config');
const { ApiError } = require('../utils/errors');

/**
 * Not found handler
 * Catches requests to undefined routes
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    hint: `${req.method} ${req.path} does not exist. Check the API documentation.`
  });
}

/**
 * Global error handler
 * Must be registered last
 */
function errorHandler(err, req, res, next) {
  // Always log errors to console (even in production)
  console.error('Error occurred:', {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack,
    statusCode: err.statusCode || err.status || 500
  });
  
  // Handle known API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toJSON());
  }
  
  // Handle validation errors from express
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON body',
      hint: 'Check your request body is valid JSON'
    });
  }
  
  // Handle database errors
  if (err.code && err.code.startsWith('23')) {
    // PostgreSQL constraint violations (23xxx codes)
    console.error('Database constraint violation:', err.detail || err.message);
    return res.status(400).json({
      success: false,
      error: 'Database constraint violation',
      hint: config.isProduction ? 'Invalid data provided' : err.message
    });
  }
  
  // Handle unexpected errors
  const statusCode = err.statusCode || err.status || 500;
  const message = config.isProduction 
    ? 'Internal server error' 
    : err.message;
  
  res.status(statusCode).json({
    success: false,
    error: message,
    hint: 'Please try again later'
  });
}

/**
 * Async handler wrapper
 * Catches promise rejections and forwards to error handler
 * 
 * @param {Function} fn - Async route handler
 * @returns {Function} Wrapped handler
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  notFoundHandler,
  errorHandler,
  asyncHandler
};
