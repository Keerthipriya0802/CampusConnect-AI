const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  drive: { type: mongoose.Schema.Types.ObjectId, ref: 'Drive', required: true },
  resume: { type: String, default: '' },
  snapshot: {
    name: String,
    rollNo: String,
    gender: String,
    department: String,
    email: String,
    phone: String,
    tenthPercentage: Number,
    twelfthPercentage: Number,
    cgpa: Number,
    arrears: Number,
    skills: [String],
  },
  status: { type: String, enum: ['Applied', 'Shortlisted', 'Rejected', 'Interview Scheduled', 'Selected', 'applied', 'shortlisted', 'interview', 'selected', 'rejected', 'Eligible', 'Pending Review'], default: 'Applied' },
  notes: { type: String, default: '' },
  appliedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Application', applicationSchema);
