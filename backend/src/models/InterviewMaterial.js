const mongoose = require('mongoose');

const interviewMaterialSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('InterviewMaterial', interviewMaterialSchema);
