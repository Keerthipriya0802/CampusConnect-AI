const mongoose = require('mongoose');

const driveSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, default: '' },
  eligibility: { type: String, default: '' },
  package: { type: String, default: '' },
  deadline: { type: Date, required: true },
  interviewDate: { type: Date, default: null },
  status: { type: String, enum: ['draft', 'open', 'closed', 'completed'], default: 'open' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
  role: { type: String, default: '' },
  salaryPackage: { type: String, default: '' },
  cgpaRequirement: { type: Number, default: 0 },
  tenthPercentageRequirement: { type: Number, default: 0 },
  twelfthPercentageRequirement: { type: Number, default: 0 },
  maxArrears: { type: Number, default: 0 },
  allowedDepartments: [{ type: String }],
  driveDate: { type: Date, default: null },
  registrationDeadline: { type: Date, default: null },
  jobDescription: { type: String, default: '' },
  openings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Drive', driveSchema);
