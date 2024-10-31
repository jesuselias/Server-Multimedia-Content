const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: String,
  type: String,
  imageTextUrl: String,
  videoUrl: String,
  themeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Theme' },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  credits: String,
  file: Buffer, // Agrega este campo
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Content', contentSchema);