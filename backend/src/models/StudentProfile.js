const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  registerNumber: { type: String, default: '', unique: true, sparse: true },
  department: { type: String, default: '' },
  year: { type: String, default: '' },
  cgpa: { type: Number, default: 0 },
  tenthPercentage: { type: Number, default: 0, min: 0, max: 100 },
  twelfthPercentage: { type: Number, default: 0, min: 0, max: 100 },
  skills: [{ type: String }],
  resume: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },
  arrears: { type: Number, default: 0 },
  placementStatus: { type: String, default: 'Active' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
