const router = require('express').Router();
const { body } = require('express-validator');
const AdminController = require('../controllers/AdminController');
const { protect, requireAdmin } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

router.use(protect, requireAdmin);

// Reports
router.get('/reports', AdminController.getReports);
router.get('/reports/stats', AdminController.getStats);
router.get('/reports/:id', AdminController.getReportById);
router.put(
  '/reports/:id',
  [
    body('status').optional().isIn(['pending', 'in_progress', 'resolved', 'rejected']),
    body('comment').optional().trim().isLength({ max: 500 }),
    body('priority').optional().isIn(['low', 'medium', 'high']),
  ],
  validate,
  AdminController.updateReport
);

// Users
router.get('/users', AdminController.getUsers);
router.put('/users/:id/toggle', AdminController.toggleUser);

// Categories
router.get('/categories', AdminController.getCategories);
router.post(
  '/categories',
  [
    body('name').trim().notEmpty().isLength({ max: 60 }),
    body('description').optional().trim().isLength({ max: 200 }),
    body('icon').optional().trim(),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/),
  ],
  validate,
  AdminController.createCategory
);
router.put('/categories/:id', AdminController.updateCategory);

module.exports = router;
