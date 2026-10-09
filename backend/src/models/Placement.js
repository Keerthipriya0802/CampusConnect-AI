const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, default: '' },
  role: { type: String, default: '' },
  package: { type: Number, default: 0 },
  status: { type: String, enum: ['Placed', 'Not Placed'], default: 'Not Placed' },
  offerLetterStatus: { type: String, enum: ['Pending', 'Received'], default: 'Pending' },
  offerLetter: { type: String, default: null },
  placedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

placementSchema.index({ studentId: 1, status: 1 });
placementSchema.index({ studentId: 1, company: 1, package: 1 });

module.exports = mongoose.model('Placement', placementSchema);
