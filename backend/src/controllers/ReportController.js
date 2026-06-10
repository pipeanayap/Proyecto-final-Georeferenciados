const ReportService = require('../services/ReportService');

class ReportController {
  async create(req, res, next) {
    try {
      const locationRaw = req.body.location;
      const location = typeof locationRaw === 'string' ? JSON.parse(locationRaw) : locationRaw;
      const report = await ReportService.create(req.user._id, { ...req.body, location }, req.files || []);
      res.status(201).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  async getMine(req, res, next) {
    try {
      const result = await ReportService.getMine(req.user._id, req.query);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const report = await ReportService.getById(req.params.id);
      if (
        req.user.role !== 'admin' &&
        report.citizen._id.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  async addComment(req, res, next) {
    try {
      const comment = await ReportService.addComment(req.params.id, req.user._id, req.body.text);
      res.status(201).json({ success: true, data: comment });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await ReportService.deleteReport(req.params.id, req.user._id, req.user.role);
      res.json({ success: true, message: 'Report deleted' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReportController();
