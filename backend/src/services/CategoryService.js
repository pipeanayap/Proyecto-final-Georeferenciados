const Category = require('../models/Category');

class CategoryService {
  async getAll() {
    return Category.find({ isActive: true }).sort({ name: 1 });
  }

  async create(data) {
    const existing = await Category.findOne({ name: data.name });
    if (existing) {
      const error = new Error('Category already exists');
      error.statusCode = 409;
      throw error;
    }
    return Category.create(data);
  }

  async update(id, data) {
    const category = await Category.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }
    return category;
  }

  async delete(id) {
    const category = await Category.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }
  }
}

module.exports = new CategoryService();
