const Drive = require('../models/Drive');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');

exports.getDrives = async (req, res, next) => {
  try {
    const drives = await Drive.find().sort({ createdAt: -1 }).populate('createdBy', 'name email');
    res.json(drives);
  } catch (error) {
    next(error);
  }
};

exports.createDrive = async (req, res, next) => {
  try {
    const drive = await Drive.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(drive);
  } catch (error) {
    next(error);
  }
};

exports.updateDrive = async (req, res, next) => {
  try {
    const drive = await Drive.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!drive) return res.status(404).json({ message: 'Drive not found' });
    res.json(drive);
  } catch (error) {
    next(error);
  }
};

exports.deleteDrive = async (req, res, next) => {
  try {
    const drive = await Drive.findByIdAndDelete(req.params.id);
    if (!drive) return res.status(404).json({ message: 'Drive not found' });
    res.json({ message: 'Drive deleted' });
  } catch (error) {
    next(error);
  }
};

exports.getDriveById = async (req, res, next) => {
  try {
    const drive = await Drive.findById(req.params.id).populate('createdBy', 'name email');
    if (!drive) return res.status(404).json({ message: 'Drive not found' });
    res.json(drive);
  } catch (error) {
    next(error);
  }
};

exports.applyToDrive = async (req, res, next) => {
  try {
    const existing = await Application.findOne({ student: req.user._id, drive: req.params.id });
    if (existing) return res.status(400).json({ message: 'Already applied' });

    const profile = await StudentProfile.findOne({ user: req.user._id });
    const drive = await Drive.findById(req.params.id);
    if (!drive) return res.status(404).json({ message: 'Drive not found' });

    const eligible = profile ? (profile.cgpa || 0) >= (drive.cgpaRequirement || 0) && (!drive.allowedDepartments?.length || drive.allowedDepartments.includes(profile.department)) : false;
    const application = await Application.create({
      student: req.user._id,
      drive: req.params.id,
      resume: req.body.resume || '',
      status: eligible ? 'Eligible' : 'Pending Review',
      appliedAt: new Date(),
    });
    await Drive.findByIdAndUpdate(req.params.id, { $push: { applications: application._id } });
    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};

exports.getApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user._id }).populate('drive');
    res.json(applications);
  } catch (error) {
    next(error);
  }
};
