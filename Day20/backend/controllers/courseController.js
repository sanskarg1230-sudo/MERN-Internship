const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const User = require('../models/User');

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).populate('instructor', 'name email profilePicture');
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email profilePicture')
      .populate('lessons');
    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const createCourse = async (req, res) => {
  const { title, description, category, thumbnail, price, level, lessons } = req.body;

  try {
    const course = new Course({
      title,
      description,
      category,
      thumbnail,
      price,
      level,
      instructor: req.user._id,
    });

    const createdCourse = await course.save();

    // If lessons were provided, create them and link to course
    if (lessons && lessons.length > 0) {
      const Lesson = require('../models/Lesson');
      const lessonIds = [];
      let totalDuration = 0;

      for (const lessonData of lessons) {
        const lesson = new Lesson({
          title: lessonData.title,
          videoUrl: lessonData.videoUrl,
          course: createdCourse._id,
        });
        const savedLesson = await lesson.save();
        lessonIds.push(savedLesson._id);
        // Default duration if we wanted to extract it, leaving as 0 for now based on model default
      }

      createdCourse.lessons = lessonIds;
      await createdCourse.save();
    }

    res.status(201).json(createdCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateCourse = async (req, res) => {
  const { title, description, category, thumbnail, price, level, lessons } = req.body;

  try {
    const course = await Course.findById(req.params.id);

    if (course) {
        if(course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this course' });
        }

      course.title = title || course.title;
      course.description = description || course.description;
      course.category = category || course.category;
      course.thumbnail = thumbnail || course.thumbnail;
      course.price = price !== undefined ? price : course.price;
      course.level = level || course.level;

      // Handle Lessons Update
      if (lessons && Array.isArray(lessons)) {
        const Lesson = require('../models/Lesson');
        const updatedLessonIds = [];
        
        for (const lessonData of lessons) {
          if (lessonData._id) {
            // Update existing lesson
            const existingLesson = await Lesson.findById(lessonData._id);
            if (existingLesson && existingLesson.course.toString() === course._id.toString()) {
              existingLesson.title = lessonData.title;
              existingLesson.videoUrl = lessonData.videoUrl;
              existingLesson.duration = lessonData.duration || existingLesson.duration;
              await existingLesson.save();
              updatedLessonIds.push(existingLesson._id);
            }
          } else {
            // Create new lesson
            const newLesson = new Lesson({
              title: lessonData.title,
              videoUrl: lessonData.videoUrl,
              duration: lessonData.duration || 0,
              course: course._id,
            });
            const savedLesson = await newLesson.save();
            updatedLessonIds.push(savedLesson._id);
          }
        }
        
        // Find lessons to delete (those that were in course.lessons but not in updatedLessonIds)
        const updatedLessonIdsStr = updatedLessonIds.map(id => id.toString());
        const lessonsToDelete = course.lessons.filter(id => !updatedLessonIdsStr.includes(id.toString()));
        await Lesson.deleteMany({ _id: { $in: lessonsToDelete } });
        
        course.lessons = updatedLessonIds;
      }

      const updatedCourse = await course.save();
      res.json(updatedCourse);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (course) {
         if(course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this course' });
        }
      await course.deleteOne();
      res.json({ message: 'Course removed' });
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    const user = req.user;

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    let updated = false;

    // Add to course if not present
    if (!course.enrolledStudents.includes(user._id)) {
      course.enrolledStudents.push(user._id);
      await course.save();
      updated = true;
    }

    // Add to user if not present
    if (!user.enrolledCourses.includes(course._id)) {
      user.enrolledCourses.push(course._id);
      await user.save();
      updated = true;
    }

    if (!updated) {
      // Both arrays already had the IDs
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    res.json({ message: 'Enrolled successfully', courseId: course._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const markLessonCompleted = async (req, res) => {
  try {
    const lessonId = req.params.lessonId;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.completedLessons) {
      user.completedLessons = [];
    }

    // Only add if it's not already completed
    if (!user.completedLessons.includes(lessonId)) {
      user.completedLessons.push(lessonId);
      await user.save();
    }

    // Return updated user object to sync frontend
    const updatedUser = await User.findById(user._id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server Error marking lesson complete' });
  }
};

const addLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, videoUrl, duration, notes } = req.body;
    const lesson = new Lesson({
      title,
      videoUrl,
      duration: duration || 0,
      notes,
      course: course._id
    });
    
    const savedLesson = await lesson.save();
    course.lessons.push(savedLesson._id);
    await course.save();

    res.status(201).json(savedLesson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error adding lesson' });
  }
};

const getInstructorStudents = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .populate('enrolledStudents', 'name email profilePicture enrolledCourses completedLessons passedQuizzes createdAt');
    
    // Deduplicate students across all instructor's courses
    const studentMap = new Map();
    
    courses.forEach(course => {
      course.enrolledStudents.forEach(student => {
        if (!studentMap.has(student._id.toString())) {
          // Calculate progress for this specific course if needed, or just aggregate
          studentMap.set(student._id.toString(), {
            _id: student._id,
            name: student.name,
            email: student.email,
            profilePicture: student.profilePicture,
            joinedAt: student.createdAt,
            enrolledCoursesCount: student.enrolledCourses?.length || 0,
            completedLessonsCount: student.completedLessons?.length || 0,
            courses: [{ id: course._id, title: course.title }]
          });
        } else {
          // Add this course to their list of courses taken with this instructor
          const existingStudent = studentMap.get(student._id.toString());
          existingStudent.courses.push({ id: course._id, title: course.title });
        }
      });
    });

    const uniqueStudents = Array.from(studentMap.values());
    res.json(uniqueStudents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching instructor students' });
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  markLessonCompleted,
  addLesson,
  getInstructorStudents,
};
