const Application = require('../models/Application');
const Drive = require('../models/Drive');
const User = require('../models/User');
const Placement = require('../models/Placement');
const isEligible = require('../utils/placementEligibility');

const statuses = ['Applied', 'Shortlisted', 'Rejected', 'Interview Scheduled', 'Selected'];

const parsePackageNumber = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value !== 'string' && value != null) value = String(value);
  if (!value) return 0;
  const cleaned = value.replace(/[^\d.]/g, '');
  const numericValue = Number(cleaned);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const snapshot = (student) => ({
  name: student.name,
  rollNo: student.rollNo,
  gender: student.gender,
  department: student.department,
  email: student.email,
  phone: student.phone,
  tenthPercentage: student.tenthPercentage,
  twelfthPercentage: student.twelfthPercentage,
  cgpa: student.cgpa,
  arrears: student.arrears,
  skills: student.skills || [],
});

exports.createApplication = async (req, res, next) => {
  try {
    const [student, drive] = await Promise.all([
      User.findOne({ _id: req.user._id, role: 'student' }).select('-password'),
      Drive.findById(req.body.driveId),
    ]);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    if (!drive) return res.status(404).json({ message: 'Placement drive not found' });
    const existing = await Application.findOne({ student: student._id, drive: drive._id });
    if (existing) return res.status(409).json({ message: 'You have already applied for this placement drive.' });
    if (drive.status !== 'open') return res.status(400).json({ message: 'This placement drive is not open' });
    if (drive.deadline && new Date(drive.deadline) < new Date()) return res.status(400).json({ message: 'The application deadline has passed' });

    const currentPackage = parsePackageNumber(student.currentPlacement?.package || student.placementHistory?.slice(-1)[0]?.package || 0);
    if (student.currentPlacement?.company || student.placementHistory?.length) {
      const minimumPackage = currentPackage * 2;
      const drivePackage = parsePackageNumber(drive.package || drive.salaryPackage || 0);
      if (drivePackage < minimumPackage) {
        return res.status(403).json({ message: `You are already placed. You can apply only for opportunities offering at least ₹${minimumPackage} LPA.` });
      }
    }

    if (!isEligible(student, drive)) return res.status(403).json({ message: 'You are not eligible for this placement drive' });
    if (!student.resume) return res.status(400).json({ message: 'Please upload your resume before applying.' });
    const application = await Application.create({ student: student._id, drive: drive._id, resume: student.resume, snapshot: snapshot(student), status: 'Applied' });
    await Drive.findByIdAndUpdate(drive._id, { $addToSet: { applications: application._id } });
    res.status(201).json(await application.populate('drive', 'company role title package'));
  } catch (error) {
    next(error);
  }
};

exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user._id }).populate('drive', 'company role title package').sort({ appliedAt: -1 });
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

exports.getCoordinatorApplications = async (req, res, next) => {
  try {
    const filter = req.query.driveId ? { drive: req.query.driveId } : {};
    const applications = await Application.find(filter).populate('drive', 'company role title package').sort({ appliedAt: -1 });
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

exports.getApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('drive', 'company role title package deadline');
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (req.user.role === 'student' && String(application.student) !== String(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
    res.json(application);
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    if (!statuses.includes(req.body.status)) return res.status(400).json({ message: 'Invalid application status' });
    const application = await Application.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).populate('drive', 'company role title package');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (req.body.status === 'Selected' || req.body.status === 'selected') {
      const student = await User.findById(application.student);
      const drivePackage = parsePackageNumber(application.drive?.package || application.drive?.salaryPackage || 0);
      const placementRecord = {
        studentId: student._id,
        company: application.drive?.company || application.drive?.title || 'Unknown Company',
        role: application.drive?.role || application.drive?.title || '',
        package: drivePackage,
        status: 'Placed',
        offerLetterStatus: 'Pending',
        offerLetter: null,
        placedAt: new Date(),
      };

      const previousPlacement = student.currentPlacement || null;
      const placement = await Placement.findOneAndUpdate(
        { studentId: student._id, company: placementRecord.company, package: placementRecord.package },
        { $set: placementRecord },
        { upsert: true, new: true }
      );

      if (!student.currentPlacement || !student.placementHistory?.length || previousPlacement?.company !== placementRecord.company) {
        student.currentPlacement = {
          company: placementRecord.company,
          role: placementRecord.role,
          package: placementRecord.package,
          offerLetterStatus: 'Pending',
          offerLetter: null,
          placedAt: placementRecord.placedAt,
        };
        student.placementHistory = Array.isArray(student.placementHistory) ? student.placementHistory : [];
        student.placementHistory.push({
          company: placementRecord.company,
          role: placementRecord.role,
          package: placementRecord.package,
          status: 'Placed',
          offerLetterStatus: 'Pending',
          offerLetter: null,
          placedAt: placementRecord.placedAt,
        });
      }

      await student.save();
      await Placement.findByIdAndUpdate(placement._id, { status: 'Placed', offerLetterStatus: 'Pending', offerLetter: null }, { new: true });
    }

    res.json(application);
  } catch (error) {
    next(error);
  }
};

exports.statuses = statuses;
