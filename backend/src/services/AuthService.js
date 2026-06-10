const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  }

  async register({ name, email, password, phone }) {
    const existing = await User.findOne({ email });
    if (existing) {
      const error = new Error('Email already registered');
      error.statusCode = 409;
      throw error;
    }
    const user = await User.create({ name, email, password, phone });
    const token = this.generateToken(user._id);
    return { user, token };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }
    if (!user.isActive) {
      const error = new Error('Account is deactivated');
      error.statusCode = 403;
      throw error;
    }
    const token = this.generateToken(user._id);
    user.password = undefined;
    return { user, token };
  }

  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }
}

module.exports = new AuthService();
