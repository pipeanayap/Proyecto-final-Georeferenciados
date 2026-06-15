const UbicacionService = require('../services/UbicacionService');

class UbicacionController {
  async getAll(req, res, next) {
    try {
      const { search } = req.query;
      const data = await UbicacionService.getAll(search);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const data = await UbicacionService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const data = await UbicacionService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await UbicacionService.delete(req.params.id);
      res.json({ success: true, message: 'Location deleted' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UbicacionController();
