const express = require('express');
const { getQuizByCourse, instructorGetQuiz, submitQuizAttempt, createQuiz } = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('instructor', 'admin'), createQuiz);
router.route('/course/:courseId').get(protect, getQuizByCourse);

// Get full quiz by course ID (for instructors)
router.route('/course/:courseId/instructor').get(protect, authorize('instructor', 'admin'), instructorGetQuiz);
router.post('/:id/submit', protect, submitQuizAttempt);

module.exports = router;
