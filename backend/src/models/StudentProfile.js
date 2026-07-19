const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  registerNumber: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  year: { type: String, required: true },
  cgpa: { type: Number, required: true },
  skills: [{ type: String }],
  resume: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },
  placementStatus: { type: String, default: 'Active' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
