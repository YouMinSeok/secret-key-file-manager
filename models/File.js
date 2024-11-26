// /models/File.js

const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  secretKey: { type: String, required: false }, // 비밀키는 나중에 할당
  filename: { type: String, required: true },
  originalname: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('File', fileSchema);