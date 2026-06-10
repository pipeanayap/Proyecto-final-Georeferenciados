const ReportService = require('../services/ReportService');
const UserService = require('../services/UserService');
const CategoryService = require('../services/CategoryService');

class AdminController {
  async getReports(req, res, next) {
    try {
      const result = await ReportService.getAll(req.query);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getReportById(req, res, next) {
    try {
      const report = await ReportService.getById(req.params.id);
      res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  async updateReport(req, res, next) {
    try {
      const report = await ReportService.updateStatus(req.params.id, req.user._id, req.body);
      res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await ReportService.getStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }

  async getUsers(req, res, next) {
    try {
      const result = await UserService.getAll(req.query);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async toggleUser(req, res, next) {
    try {
      const user = await UserService.toggleActive(req.params.id);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  async getCategories(req, res, next) {
    try {
      const categories = await CategoryService.getAll();
      res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  }

  async createCategory(req, res, next) {
    try {
      const category = await CategoryService.create(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const category = await CategoryService.update(req.params.id, req.body);
      res.json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
