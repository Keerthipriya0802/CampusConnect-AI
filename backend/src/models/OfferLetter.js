const mongoose = require('mongoose');

const offerLetterSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  drive: { type: mongoose.Schema.Types.ObjectId, ref: 'Drive', required: true },
  fileUrl: { type: String, required: true },
  package: { type: String, default: '' },
  joiningDate: { type: String, default: '' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('OfferLetter', offerLetterSchema);
