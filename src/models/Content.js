const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video'],
    required: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  themeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theme',
    required: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  credits: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  fileUrl: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('Content', contentSchema);