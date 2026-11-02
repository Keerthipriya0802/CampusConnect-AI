const mongoose = require('mongoose');

const companyDetailSchema = new mongoose.Schema({
  company: { type: String, required: true, trim: true },
  role: { type: String, default: '', trim: true },
  package: { type: String, default: '', trim: true },
  description: { type: String, default: '', trim: true },
  eligibility: { type: String, default: '', trim: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CompanyDetail', companyDetailSchema);
