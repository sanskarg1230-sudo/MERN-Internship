const express = require('express');
const { getAssignments, submitAssignment, createAssignment, updateAssignment, deleteAssignment, gradeAssignment, getInstructorAssignments } = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('instructor', 'admin'), createAssignment);
router.get('/instructor', protect, authorize('instructor', 'admin'), getInstructorAssignments);
router.get('/course/:courseId', protect, getAssignments);
router.post('/:id/submit', protect, submitAssignment);
router.put('/:id/grade/:submissionId', protect, authorize('instructor', 'admin'), gradeAssignment);

router.route('/:id')
  .put(protect, authorize('instructor', 'admin'), updateAssignment)
  .delete(protect, authorize('instructor', 'admin'), deleteAssignment);

module.exports = router;
