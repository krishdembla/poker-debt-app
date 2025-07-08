const { body, param, validationResult } = require('express-validator');

// Sanitize and validate player names
const sanitizePlayerName = (name) => {
  if (!name || typeof name !== 'string') {
    throw new Error('Player name is required and must be a string');
  }
  
  // Remove HTML tags and dangerous characters
  let sanitized = name
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>"'&]/g, '') // Remove dangerous characters
    .trim();
  
  // Check length limits
  if (sanitized.length === 0) {
    throw new Error('Player name cannot be empty');
  }
  
  if (sanitized.length > 50) {
    throw new Error('Player name must be 50 characters or less');
  }
  
  // Check for valid characters (letters, numbers, spaces, hyphens, underscores)
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(sanitized)) {
    throw new Error('Player name can only contain letters, numbers, spaces, hyphens, and underscores');
  }
  
  return sanitized;
};

// Sanitize and validate amounts
const sanitizeAmount = (amount) => {
  if (amount === null || amount === undefined) {
    throw new Error('Amount is required');
  }
  
  const num = Number(amount);
  if (isNaN(num)) {
    throw new Error('Amount must be a valid number');
  }
  
  if (num < 0) {
    throw new Error('Amount cannot be negative');
  }
  
  if (num > 999999.99) {
    throw new Error('Amount cannot exceed 999,999.99');
  }
  
  // Round to 2 decimal places
  return Math.round(num * 100) / 100;
};

// Sanitize and validate game titles
const sanitizeGameTitle = (title) => {
  if (!title || typeof title !== 'string') {
    throw new Error('Game title is required and must be a string');
  }
  
  let sanitized = title
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>"'&]/g, '') // Remove dangerous characters
    .trim();
  
  if (sanitized.length === 0) {
    throw new Error('Game title cannot be empty');
  }
  
  if (sanitized.length > 100) {
    throw new Error('Game title must be 100 characters or less');
  }
  
  return sanitized;
};

// Sanitize and validate dates
const sanitizeDate = (date) => {
  if (!date) return null;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date format');
  }
  
  return dateObj.toISOString();
};

// Rate limiting configuration
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Common validation rules
const commonValidations = {
  playerName: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Player name must be between 1 and 50 characters')
      .matches(/^[a-zA-Z0-9\s\-_]+$/)
      .withMessage('Player name can only contain letters, numbers, spaces, hyphens, and underscores')
      .escape()
  ],
  
  amount: [
    body('buyIn')
      .isFloat({ min: 0, max: 999999.99 })
      .withMessage('Buy-in amount must be a positive number less than 999,999.99')
      .toFloat(),
    body('cashOut')
      .optional()
      .isFloat({ min: 0, max: 999999.99 })
      .withMessage('Cash-out amount must be a positive number less than 999,999.99')
      .toFloat()
  ],
  
  gameId: [
    param('id')
      .isUUID()
      .withMessage('Invalid game ID format')
  ],
  
  gameTitle: [
    body('title')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Game title must be between 1 and 100 characters')
      .escape()
  ]
};

module.exports = {
  sanitizePlayerName,
  sanitizeAmount,
  sanitizeGameTitle,
  sanitizeDate,
  rateLimitConfig,
  handleValidationErrors,
  commonValidations
}; 