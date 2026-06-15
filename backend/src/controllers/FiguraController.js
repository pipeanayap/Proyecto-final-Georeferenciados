const FiguraService = require('../services/FiguraService');

class FiguraController {
  async getAll(req, res, next) {
    try {
      const data = await FiguraService.getAll();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const data = await FiguraService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await FiguraService.delete(req.params.id);
      res.json({ success: true, message: 'Figure deleted' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new FiguraController();
