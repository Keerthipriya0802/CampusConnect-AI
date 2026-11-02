const express = require('express');
const { protect } = require('../middleware/auth');
const InterviewExperience = require('../models/InterviewExperience');
const CompanyDetail = require('../models/CompanyDetail');

const router = express.Router();

router.get('/interview-experiences', protect, async (req, res, next) => {
  try {
    const experiences = await InterviewExperience.find()
      .populate('sharedBy', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    res.json(experiences.map((entry) => ({
      _id: entry._id,
      company: entry.company,
      role: entry.role,
      note: entry.note,
      authorRole: entry.authorRole,
      studentName: entry.studentName || entry.sharedBy?.name || 'Student',
      sharedBy: entry.sharedBy ? {
        _id: entry.sharedBy._id,
        name: entry.sharedBy.name,
        email: entry.sharedBy.email,
        role: entry.sharedBy.role,
      } : null,
      createdAt: entry.createdAt,
    })));
  } catch (error) {
    next(error);
  }
});

router.post('/interview-experiences', protect, async (req, res, next) => {
  try {
    const { company, role, note } = req.body || {};
    if (!company || !note) {
      return res.status(400).json({ message: 'Company and experience details are required.' });
    }

    const created = await InterviewExperience.create({
      company: String(company).trim(),
      role: String(role || '').trim(),
      note: String(note).trim(),
      sharedBy: req.user._id,
      authorRole: req.user.role || 'student',
      studentName: req.user.name || '',
    });

    const populated = await created.populate('sharedBy', 'name email role');
    res.status(201).json({
      _id: populated._id,
      company: populated.company,
      role: populated.role,
      note: populated.note,
      authorRole: populated.authorRole,
      studentName: populated.studentName || populated.sharedBy?.name || 'Student',
      sharedBy: populated.sharedBy ? {
        _id: populated.sharedBy._id,
        name: populated.sharedBy.name,
        email: populated.sharedBy.email,
        role: populated.sharedBy.role,
      } : null,
      createdAt: populated.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/company-details', protect, async (req, res, next) => {
  try {
    const companies = await CompanyDetail.find()
      .populate('addedBy', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    res.json(companies.map((company) => ({
      _id: company._id,
      company: company.company,
      role: company.role,
      package: company.package,
      description: company.description,
      eligibility: company.eligibility,
      addedBy: company.addedBy ? {
        _id: company.addedBy._id,
        name: company.addedBy.name,
        email: company.addedBy.email,
        role: company.addedBy.role,
      } : null,
      createdAt: company.createdAt,
    })));
  } catch (error) {
    next(error);
  }
});

router.post('/company-details', protect, async (req, res, next) => {
  try {
    const { company, role, package: packageValue, description, eligibility } = req.body || {};
    if (!company) {
      return res.status(400).json({ message: 'Company name is required.' });
    }

    const created = await CompanyDetail.create({
      company: String(company).trim(),
      role: String(role || '').trim(),
      package: String(packageValue || '').trim(),
      description: String(description || '').trim(),
      eligibility: String(eligibility || '').trim(),
      addedBy: req.user._id,
    });

    const populated = await created.populate('addedBy', 'name email role');
    res.status(201).json({
      _id: populated._id,
      company: populated.company,
      role: populated.role,
      package: populated.package,
      description: populated.description,
      eligibility: populated.eligibility,
      addedBy: populated.addedBy ? {
        _id: populated.addedBy._id,
        name: populated.addedBy.name,
        email: populated.addedBy.email,
        role: populated.addedBy.role,
      } : null,
      createdAt: populated.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/company-details/:id', protect, async (req, res, next) => {
  try {
    const { company, role, package: packageValue, description, eligibility } = req.body || {};
    if (!company) {
      return res.status(400).json({ message: 'Company name is required.' });
    }

    const updated = await CompanyDetail.findByIdAndUpdate(
      req.params.id,
      {
        company: String(company).trim(),
        role: String(role || '').trim(),
        package: String(packageValue || '').trim(),
        description: String(description || '').trim(),
        eligibility: String(eligibility || '').trim(),
      },
      { new: true }
    ).populate('addedBy', 'name email role');

    if (!updated) {
      return res.status(404).json({ message: 'Company detail not found' });
    }

    res.json({
      _id: updated._id,
      company: updated.company,
      role: updated.role,
      package: updated.package,
      description: updated.description,
      eligibility: updated.eligibility,
      addedBy: updated.addedBy ? {
        _id: updated.addedBy._id,
        name: updated.addedBy.name,
        email: updated.addedBy.email,
        role: updated.addedBy.role,
      } : null,
      createdAt: updated.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/company-details/:id', protect, async (req, res, next) => {
  try {
    const deleted = await CompanyDetail.findOneAndDelete({ _id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ message: 'Company detail not found' });
    }
    res.json({ message: 'Company detail deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
