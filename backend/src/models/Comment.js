const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      minlength: [2, 'Comment must be at least 2 characters'],
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    isStatusUpdate: {
      type: Boolean,
      default: false,
    },
    statusChanged: {
      from: { type: String },
      to: { type: String },
    },
  },
  { timestamps: true }
);

commentSchema.index({ report: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', commentSchema);
