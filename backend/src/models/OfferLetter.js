const mongoose = require('mongoose');

const offerLetterSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  placementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Placement', required: true },
  company: { type: String, default: '' },
  package: { type: Number, default: 0 },
  fileUrl: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Received'], default: 'Pending' },
  uploadedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('OfferLetter', offerLetterSchema);
