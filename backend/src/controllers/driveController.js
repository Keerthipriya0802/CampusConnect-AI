const Drive = require('../models/Drive');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const isEligible = require('../utils/placementEligibility');

exports.getDrives = async (req, res, next) => {
  try {
    const drives = await Drive.find().sort({ createdAt: -1 }).populate('createdBy', 'name email').lean();
    if (req.user?.role === 'student') {
      let profile = null;
      let applications = [];
      try {
        profile = await StudentProfile.findOne({ user: req.user._id }).lean();
        applications = await Application.find({ student: req.user._id }).lean();
      } catch (error) {
        profile = null;
      }
      const applicationByDrive = new Map(applications.map((application) => [String(application.drive), application.status]));
      return res.json(drives.map((drive) => ({
        ...drive,
        isEligible: Boolean(profile) && isEligible(profile, drive),
        applicationStatus: applicationByDrive.get(String(drive._id)) || null,
      })));
    }
    res.json(drives);
  } catch (error) {
    next(error);
  }
};

exports.getEligibleStudents = async (req, res, next) => {
  try {
    const drive = await Drive.findById(req.params.id).lean();
    if (!drive) return res.status(404).json({ message: 'Drive not found' });
    const profiles = await StudentProfile.find().populate('user', 'name email').lean();
    const eligibleStudents = profiles.filter((profile) => (
      isEligible(profile, drive)
    )).map((profile) => ({
      id: profile._id,
      name: profile.user?.name || 'Student',
      email: profile.user?.email || '',
      registerNumber: profile.registerNumber,
      department: profile.department,
      cgpa: profile.cgpa,
      criteria: [
        { name: 'CGPA', studentValue: Number(profile.cgpa || 0), requirement: `At least ${Number(drive.cgpaRequirement || 0)}`, passed: true },
        { name: 'Arrears', studentValue: Number(profile.arrears || 0), requirement: `At most ${Number(drive.maxArrears ?? 0)}`, passed: true },
        { name: '10th percentage', studentValue: Number(profile.tenthPercentage || 0), requirement: `At least ${Number(drive.tenthPercentageRequirement || 0)}%`, passed: true },
        { name: '12th percentage', studentValue: Number(profile.twelfthPercentage || 0), requirement: `At least ${Number(drive.twelfthPercentageRequirement || 0)}%`, passed: true },
        {
          name: 'Department',
          studentValue: profile.department || 'Not specified',
          requirement: drive.allowedDepartments?.length ? drive.allowedDepartments.join(', ') : 'All departments',
          passed: true,
        },
      ],
    }));
    res.json(eligibleStudents);
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
    if (req.user?.role === 'student') {
      const application = await Application.findOne({ student: req.user._id, drive: drive._id }).select('status');
      return res.json({ ...drive.toObject(), applicationStatus: application?.status || null });
    }
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

    const eligible = profile ? isEligible(profile, drive) : false;
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
