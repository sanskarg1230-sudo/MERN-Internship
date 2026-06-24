const express = require('express');
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  addLesson,
  markLessonCompleted,
  getInstructorStudents,
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getCourses)
  .post(protect, authorize('instructor', 'admin'), createCourse);

router.get('/instructor/students', protect, authorize('instructor', 'admin'), getInstructorStudents);

router.route('/:id')
  .get(getCourseById)
  .put(protect, authorize('instructor', 'admin'), updateCourse)
  .delete(protect, authorize('instructor', 'admin'), deleteCourse);

router.post('/:id/enroll', protect, enrollCourse);

// Lesson routes
router.post('/:id/lessons', protect, authorize('instructor', 'admin'), addLesson);
router.post('/lessons/:lessonId/complete', protect, markLessonCompleted);

module.exports = router;
