const router = require('express').Router();
const { body } = require('express-validator');
const AuthController = require('../controllers/AuthController');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').optional().trim().isLength({ max: 20 }),
  ],
  validate,
  AuthController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  AuthController.login
);

router.get('/me', protect, AuthController.getMe);

router.put(
  '/me',
  protect,
  [
    body('name').optional().trim().isLength({ min: 2, max: 100 }),
    body('phone').optional().trim().isLength({ max: 20 }),
  ],
  validate,
  AuthController.updateProfile
);

module.exports = router;
