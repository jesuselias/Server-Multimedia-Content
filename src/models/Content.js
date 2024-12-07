const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: String,
  type: String,
  image: String,
  videoUrl: String,
  themeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Theme' },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  credits: String,
  file: { type: String }, // Change this line
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Content', contentSchema);