const mongoose = require('mongoose');

const interviewExperienceSchema = new mongoose.Schema({
  company: { type: String, required: true, trim: true },
  role: { type: String, default: '', trim: true },
  note: { type: String, required: true, trim: true },
  sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorRole: { type: String, enum: ['student', 'coordinator', 'admin'], default: 'student' },
  studentName: { type: String, default: '', trim: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('InterviewExperience', interviewExperienceSchema);
