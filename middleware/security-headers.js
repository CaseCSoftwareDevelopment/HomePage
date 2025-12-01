const helmet = require('helmet');

module.exports = [
  helmet(), // Basic security headers
  
  // Custom security headers
  (req, res, next) => {
    res.setHeader(
      'Strict-Transport-Security', 
      'max-age=31536000; includeSubDomains'
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  }
];
