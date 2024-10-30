const mongoose = require('mongoose');

const ThemeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  contentTypes: [{
    type: String,
    enum: ['images', 'videos', 'texts'],
    default: []
  }],
  permissions: [{
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    read: { type: Boolean },
    write: { type: Boolean }
  }]
});

module.exports = mongoose.model('Theme', ThemeSchema);
