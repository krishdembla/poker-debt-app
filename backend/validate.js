const { body, validationResult } = require('express-validator');

const withValidation = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((v) => v.run(req)));
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({ error: errors.array()[0].msg });
};

const validateBuyIn = withValidation([
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('buyIn')
    .exists().withMessage('buyIn is required')
    .isFloat({ gt: 0 })
    .withMessage('buyIn must be a number > 0'),
]);

const validateCashOut = withValidation([
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('cashOut')
    .exists().withMessage('cashOut is required')
    .isFloat()
    .withMessage('cashOut must be a number'),
]);

const validateAuth = withValidation([
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),
]);

const validateCreateGame = withValidation([
  body('currency')
    .optional()
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3-letter code'),
  body('date').optional().isISO8601().withMessage('Date must be ISO8601'),
  body('players').optional().isArray().withMessage('Players must be array'),
]);

const validateNameBody = withValidation([
  body('name').trim().notEmpty().withMessage('Name required')
]);

module.exports = { validateBuyIn, validateCashOut, validateAuth, validateCreateGame, validateNameBody };
