const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved', 'rejected'],
      default: 'pending',
    },
    location: {
      address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
        maxlength: [200, 'Address cannot exceed 200 characters'],
      },
      coordinates: {
        lat: { type: Number, min: -90, max: 90 },
        lng: { type: Number, min: -180, max: 180 },
      },
    },
    photos: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

reportSchema.index({ citizen: 1, status: 1 });
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ category: 1 });

reportSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Report', reportSchema);
