const mongoose = require('mongoose');

const figuraSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    coordinates: [
      {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Figura', figuraSchema);
