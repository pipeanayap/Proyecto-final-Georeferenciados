const AuthService = require('../services/AuthService');

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password, phone } = req.body;
      const { user, token } = await AuthService.register({ name, email, password, phone });
      res.status(201).json({ success: true, token, data: user });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, token } = await AuthService.login({ email, password });
      res.json({ success: true, token, data: user });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await AuthService.getMe(req.user._id);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const UserService = require('../services/UserService');
      const user = await UserService.updateProfile(req.user._id, req.body);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
