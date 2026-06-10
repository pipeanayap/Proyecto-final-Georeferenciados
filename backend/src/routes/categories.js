const router = require('express').Router();
const CategoryService = require('../services/CategoryService');

router.get('/', async (_req, res, next) => {
  try {
    const categories = await CategoryService.getAll();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
