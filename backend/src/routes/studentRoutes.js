const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const { getProfile, updateProfile, changePassword, updateSkills, uploadResume, getMyPlacement, getHigherPackageDrives } = require('../controllers/studentController');

const router = express.Router();

router.use(protect, authorizeRoles('student'));
router.get('/profile', getProfile);
router.get('/my-placement', getMyPlacement);
router.get('/higher-package-drives', getHigherPackageDrives);
router.put('/profile', updateProfile);
router.put('/profile/skills', updateSkills);
router.post('/profile/resume', uploadResume);
router.put('/change-password', changePassword);

module.exports = router;
