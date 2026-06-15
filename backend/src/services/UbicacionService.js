const Ubicacion = require('../models/Ubicacion');

class UbicacionService {
  async getAll(search) {
    const query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    return Ubicacion.find(query).sort({ createdAt: -1 });
  }

  async create(data) {
    return Ubicacion.create(data);
  }

  async update(id, data) {
    const ubicacion = await Ubicacion.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!ubicacion) {
      const error = new Error('Location not found');
      error.statusCode = 404;
      throw error;
    }
    return ubicacion;
  }

  async delete(id) {
    const ubicacion = await Ubicacion.findByIdAndDelete(id);
    if (!ubicacion) {
      const error = new Error('Location not found');
      error.statusCode = 404;
      throw error;
    }
    return ubicacion;
  }
}

module.exports = new UbicacionService();
