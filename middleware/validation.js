const { body, validationResult } = require('express-validator');

// Generic input sanitization
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .substring(0, 1000); // Length limit
};

// Validation rules
const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 })
];

const userInputValidation = [
  body('*').customSanitizer(value => sanitizeInput(value))
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      errors: errors.array(),
      message: 'Invalid input detected'
    });
  }
  next();
};

module.exports = {
  loginValidation,
  userInputValidation, 
  validate,
  sanitizeInput
};
