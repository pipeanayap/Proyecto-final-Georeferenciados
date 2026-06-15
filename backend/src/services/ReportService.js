const Report = require('../models/Report');
const Comment = require('../models/Comment');

class ReportService {
  async create(citizenId, data, files = []) {
    const photos = [];
    const report = await Report.create({ ...data, citizen: citizenId, photos });
    return report.populate(['category', 'citizen']);
  }

  async getAll({ page = 1, limit = 10, status, category, priority, search, citizenId } = {}) {
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (citizenId) query.citizen = citizenId;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (page - 1) * limit;
    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('category', 'name icon color')
        .populate('citizen', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Report.countDocuments(query),
    ]);
    return { reports, total, page: Number(page), pages: Math.ceil(total / limit) };
  }

  async getById(id) {
    const report = await Report.findById(id)
      .populate('category', 'name icon color description')
      .populate('citizen', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name role' },
        options: { sort: { createdAt: 1 } },
      });
    if (!report) {
      const error = new Error('Report not found');
      error.statusCode = 404;
      throw error;
    }
    return report;
  }

  async getMine(citizenId, filters = {}) {
    return this.getAll({ ...filters, citizenId });
  }

  async updateStatus(reportId, adminId, { status, comment, assignedTo, priority }) {
    const report = await Report.findById(reportId);
    if (!report) {
      const error = new Error('Report not found');
      error.statusCode = 404;
      throw error;
    }

    const oldStatus = report.status;
    if (status) report.status = status;
    if (assignedTo !== undefined) report.assignedTo = assignedTo || null;
    if (priority) report.priority = priority;
    await report.save();

    if (comment || (status && status !== oldStatus)) {
      const commentText = comment || `Status updated from "${oldStatus}" to "${status}"`;
      const newComment = await Comment.create({
        report: reportId,
        author: adminId,
        text: commentText,
        isStatusUpdate: !!status && status !== oldStatus,
        statusChanged: status && status !== oldStatus ? { from: oldStatus, to: status } : undefined,
      });
      report.comments.push(newComment._id);
      await report.save();
    }

    return this.getById(reportId);
  }

  async addComment(reportId, authorId, text) {
    const report = await Report.findById(reportId);
    if (!report) {
      const error = new Error('Report not found');
      error.statusCode = 404;
      throw error;
    }
    const comment = await Comment.create({ report: reportId, author: authorId, text });
    report.comments.push(comment._id);
    await report.save();
    await comment.populate('author', 'name role');
    return comment;
  }

  async deleteReport(reportId, userId, userRole) {
    const report = await Report.findById(reportId);
    if (!report) {
      const error = new Error('Report not found');
      error.statusCode = 404;
      throw error;
    }
    if (userRole !== 'admin' && report.citizen.toString() !== userId.toString()) {
      const error = new Error('Not authorized');
      error.statusCode = 403;
      throw error;
    }
    await Comment.deleteMany({ report: reportId });
    await report.deleteOne();
  }

  async update(reportId, userId, userRole, data) {
    const report = await Report.findById(reportId);
    if (!report) {
      const error = new Error('Report not found');
      error.statusCode = 404;
      throw error;
    }
    if (userRole !== 'admin' && report.citizen.toString() !== userId.toString()) {
      const error = new Error('Not authorized');
      error.statusCode = 403;
      throw error;
    }

    const allowedFields = ['title', 'description', 'category', 'priority', 'location'];
    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        report[field] = data[field];
      }
    });

    await report.save();
    return this.getById(reportId);
  }

  async getStats() {
    const [statusCounts, categoryCounts, recentReports] = await Promise.all([
      Report.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Report.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'categoryInfo',
          },
        },
        { $unwind: '$categoryInfo' },
        { $project: { name: '$categoryInfo.name', icon: '$categoryInfo.icon', count: 1 } },
      ]),
      Report.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
    ]);

    const stats = { pending: 0, in_progress: 0, resolved: 0, rejected: 0 };
    statusCounts.forEach(({ _id, count }) => { stats[_id] = count; });

    return {
      byStatus: stats,
      total: Object.values(stats).reduce((a, b) => a + b, 0),
      topCategories: categoryCounts,
      lastWeek: recentReports,
    };
  }
}

module.exports = new ReportService();
