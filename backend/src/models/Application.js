const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  drive: { type: mongoose.Schema.Types.ObjectId, ref: 'Drive', required: true },
  resume: { type: String, default: '' },
  status: { type: String, enum: ['applied', 'shortlisted', 'interview', 'selected', 'rejected', 'Eligible', 'Pending Review'], default: 'applied' },
  notes: { type: String, default: '' },
  appliedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Application', applicationSchema);
