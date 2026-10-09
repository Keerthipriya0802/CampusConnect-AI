const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student', 'coordinator', 'admin'], default: 'student' },
  rollNo: { type: String, default: '', trim: true },
  gender: { type: String, default: '', trim: true },
  phone: { type: String, default: '' },
  department: { type: String, default: '' },
  cgpa: { type: Number, default: 0, min: 0, max: 10 },
  arrears: { type: Number, default: 0, min: 0 },
  tenthPercentage: { type: Number, default: 0, min: 0, max: 100 },
  twelfthPercentage: { type: Number, default: 0, min: 0, max: 100 },
  resume: { type: String, default: '' },
  skills: [{ type: String, trim: true }],
  profilePicture: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  placementHistory: [{
    company: String,
    role: String,
    package: Number,
    status: { type: String, default: 'Placed' },
    offerLetterStatus: { type: String, default: 'Pending' },
    offerLetter: { type: String, default: null },
    placedAt: { type: Date, default: Date.now },
  }],
  currentPlacement: {
    company: String,
    role: String,
    package: Number,
    offerLetterStatus: { type: String, default: 'Pending' },
    offerLetter: { type: String, default: null },
    placedAt: { type: Date, default: Date.now },
  },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
