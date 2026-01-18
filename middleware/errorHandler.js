// Global error handler middleware
module.exports = (err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Log error
  console.error('[ERROR]', {
    message: err.message,
    status: err.status || 500,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    ...(isDevelopment && { stack: err.stack })
  });

  // Stripe errors
  if (err.type === 'StripeInvalidRequestError') {
    return res.status(err.statusCode || 400).json({
      error: isDevelopment ? err.message : 'Payment processing error'
    });
  }

  // CSRF errors
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      error: 'Invalid CSRF token - request rejected for security'
    });
  }

  // Validation errors
  if (err.status === 422) {
    return res.status(422).json({
      error: 'Validation error',
      details: isDevelopment ? err.details : undefined
    });
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  const message = isDevelopment ? err.message : 'Internal server error';
  
  res.status(statusCode).json({
    error: message,
    ...(isDevelopment && { details: err.stack })
  });
};
