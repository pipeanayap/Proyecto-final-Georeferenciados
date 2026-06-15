const router = require('express').Router();
const FiguraController = require('../controllers/FiguraController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.get('/', FiguraController.getAll);
router.post('/', FiguraController.create);
router.delete('/:id', FiguraController.delete);

module.exports = router;
