const multer = require('multer');

const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const isProd = process.env.NODE_ENV === 'production';
  
  // Log full error for backend tracking
  logger.error({ 
    msg: err.message, 
    stack: isProd ? undefined : err.stack,
    path: req.path,
    method: req.method
  }, '[Global Error]');

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: 'File too large. Maximum size is 10MB.',
      });
    }
    return res.status(400).json({ success: false, error: err.message });
  }

  if (err.message && err.message.includes('Unsupported file type')) {
    return res.status(415).json({ success: false, error: err.message });
  }

  const status = err.status || err.statusCode || 500;
  
  // In production, mask generic 500 errors to avoid leaking details
  const message = (isProd && status === 500) 
    ? 'An unexpected error occurred. Please contact support.' 
    : (err.message || 'Internal server error');

  return res.status(status).json({
    success: false,
    error: message,
    ...(isProd ? {} : { stack: err.stack })
  });
}

module.exports = errorHandler;
