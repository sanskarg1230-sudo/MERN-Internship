const Assignment = require('../models/Assignment');
const Course = require('../models/Course');

const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId })
      .populate('createdBy', 'name')
      .populate('lesson', 'title')
      .populate('submissions.student', 'name email');
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getInstructorAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ createdBy: req.user._id })
      .populate('course', 'title thumbnail')
      .populate('lesson', 'title')
      .populate('submissions.student', 'name email profilePicture')
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching instructor assignments' });
  }
};

const createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, courseId, lessonId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create an assignment for this course' });
    }

    const assignment = await Assignment.create({
      title,
      description,
      dueDate,
      course: courseId,
      lesson: lessonId || undefined,
      createdBy: req.user._id,
    });

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, lessonId } = req.body;
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this assignment' });
    }

    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;
    assignment.dueDate = dueDate || assignment.dueDate;
    if (lessonId !== undefined) {
      assignment.lesson = lessonId || null;
    }

    const updatedAssignment = await assignment.save();
    res.json(updatedAssignment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this assignment' });
    }

    await assignment.deleteOne();
    res.json({ message: 'Assignment removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const submitAssignment = async (req, res) => {
  try {
    const { fileUrl } = req.body;
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if already submitted
    const existingSubmissionIndex = assignment.submissions.findIndex(
      (sub) => sub.student.toString() === req.user._id.toString()
    );

    if (existingSubmissionIndex !== -1) {
      // Update existing submission
      assignment.submissions[existingSubmissionIndex].fileUrl = fileUrl;
      assignment.submissions[existingSubmissionIndex].status = 'Submitted';
    } else {
      // Add new submission
      assignment.submissions.push({
        student: req.user._id,
        fileUrl,
      });
    }

    await assignment.save();

    // Trigger Real-Time Notification to the instructor
    const io = req.app.get('io');
    if (io) {
      io.to(assignment.createdBy.toString()).emit('new_notification', {
        message: `A student submitted an assignment for ${assignment.title}`,
        type: 'ASSIGNMENT_SUBMISSION',
      });
    }

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const gradeAssignment = async (req, res) => {
  try {
    const { marks, feedback } = req.body;
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to grade this assignment' });
    }

    const submission = assignment.submissions.id(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.marks = marks;
    submission.feedback = feedback;
    submission.status = 'Graded';

    await assignment.save();

    // Notify the student
    const io = req.app.get('io');
    if (io) {
      io.to(submission.student.toString()).emit('new_notification', {
        message: `Your assignment "${assignment.title}" has been graded!`,
        type: 'ASSIGNMENT_GRADED',
      });
    }

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getAssignments,
  submitAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  gradeAssignment,
  getInstructorAssignments,
};
