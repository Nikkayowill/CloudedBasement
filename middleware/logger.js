// Request logger middleware
module.exports = (req, res, next) => {
  const start = Date.now();
  
  // Log when response is finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 500 ? '[ERROR]' : 
                     res.statusCode >= 400 ? '[WARN]' : 
                     '[INFO]';
    
    console.log(`${logLevel} ${req.method.padEnd(6)} ${res.statusCode} ${req.path} ${duration}ms ${req.session?.userId ? `(user: ${req.session.userId})` : '(guest)'}`);
  });
  
  next();
};
