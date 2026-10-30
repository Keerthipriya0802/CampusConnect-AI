const express = require('express');
const {
  chatWithAI,
  askDoubtAssistant,
  startMockInterview,
  submitMockInterviewAnswer,
  getMockInterviewHistory,
  getRecommendations,
  generateAnnouncement,
  generateReport,
} = require('../controllers/aiController');
const { protect, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.post('/chat', protect, chatWithAI);
router.post('/doubt', protect, authorizeRoles('student'), askDoubtAssistant);
router.post('/mock/start', protect, authorizeRoles('student'), startMockInterview);
router.post('/mock/answer', protect, authorizeRoles('student'), submitMockInterviewAnswer);
router.get('/mock/history', protect, authorizeRoles('student'), getMockInterviewHistory);
router.get('/recommendations', protect, authorizeRoles('student'), getRecommendations);
router.post('/announcement', protect, authorizeRoles('coordinator', 'admin'), generateAnnouncement);
router.post('/report', protect, authorizeRoles('coordinator', 'admin'), generateReport);

module.exports = router;
