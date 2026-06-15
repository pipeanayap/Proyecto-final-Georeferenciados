const router = require('express').Router();
const UbicacionController = require('../controllers/UbicacionController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.get('/', UbicacionController.getAll);
router.post('/', UbicacionController.create);
router.put('/:id', UbicacionController.update);
router.delete('/:id', UbicacionController.delete);

module.exports = router;
