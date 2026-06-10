const User = require('../models/User');

class UserService {
  async getAll({ page = 1, limit = 20, role, search } = {}) {
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);
    return { users, total, page: Number(page), pages: Math.ceil(total / limit) };
  }

  async updateProfile(userId, { name, phone }) {
    const user = await User.findByIdAndUpdate(
      userId,
      { name, phone },
      { new: true, runValidators: true }
    );
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  async toggleActive(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    user.isActive = !user.isActive;
    await user.save();
    return user;
  }
}

module.exports = new UserService();
