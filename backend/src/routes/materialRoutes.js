const express = require('express');
const { uploadMaterial, listMaterials, exportEligibleStudents } = require('../controllers/materialController');
const { protect, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.post('/upload', protect, authorizeRoles('coordinator', 'admin'), uploadMaterial);
router.get('/', protect, listMaterials);
router.get('/export/:driveId', protect, authorizeRoles('coordinator', 'admin'), exportEligibleStudents);

module.exports = router;
