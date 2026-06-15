const Figura = require('../models/Figura');

class FiguraService {
  async getAll() {
    return Figura.find({}).sort({ createdAt: -1 });
  }

  async create(data) {
    return Figura.create(data);
  }

  async delete(id) {
    const figura = await Figura.findByIdAndDelete(id);
    if (!figura) {
      const error = new Error('Figure not found');
      error.statusCode = 404;
      throw error;
    }
    return figura;
  }
}

module.exports = new FiguraService();
