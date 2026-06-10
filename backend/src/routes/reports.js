const router = require('express').Router();
const { body } = require('express-validator');
const ReportController = require('../controllers/ReportController');
const { protect } = require('../middlewares/auth');
const { upload } = require('../config/cloudinary');
const validate = require('../middlewares/validate');

router.use(protect);

router.post(
  '/',
  upload.array('photos', 3),
  [
    body('title').trim().notEmpty().isLength({ min: 5, max: 120 }),
    body('description').trim().notEmpty().isLength({ min: 10, max: 1000 }),
    body('category').notEmpty().withMessage('Category is required'),
  ],
  validate,
  ReportController.create
);

router.get('/mine', ReportController.getMine);

router.get('/:id', ReportController.getById);

router.post(
  '/:id/comments',
  [body('text').trim().notEmpty().isLength({ min: 2, max: 500 })],
  validate,
  ReportController.addComment
);

router.delete('/:id', ReportController.delete);

module.exports = router;
