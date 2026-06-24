import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PlayCircle, CheckCircle, BookOpen } from 'lucide-react';
import { fetchCourses } from '../redux/slices/courseSlice';

const MyCourses = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { courses, loading } = useSelector((state) => state.courses);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const enrolledCourses = courses.filter((c) => user?.enrolledCourses?.includes(c._id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Courses</h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-2">Pick up right where you left off</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : enrolledCourses.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-12 text-center border border-slate-100 dark:border-zinc-700 shadow-sm">
          <BookOpen className="mx-auto h-16 w-16 text-slate-300 dark:text-zinc-600 mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No courses yet</h3>
          <p className="text-slate-500 dark:text-zinc-400 mb-8 max-w-md mx-auto">
            You haven't enrolled in any courses yet. Explore our catalog and start your learning journey today!
          </p>
          <Link
            to="/courses"
            className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium transition-colors shadow-lg shadow-primary-500/30"
          >
            Browse Course Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrolledCourses.map((course, index) => {
            const isCourseFullyCompleted = user?.completedCourses?.includes(course._id);
            const completedLessonsInCourse = isCourseFullyCompleted
              ? course.lessons?.length || 0
              : course.lessons?.filter((lessonId) => user?.completedLessons?.includes(lessonId)).length || 0;
            const totalLessonsInCourse = course.lessons?.length || 0;
            const progressPercentage = isCourseFullyCompleted
              ? 100
              : totalLessonsInCourse > 0
              ? Math.round((completedLessonsInCourse / totalLessonsInCourse) * 100)
              : 0;

            return (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-zinc-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-48 w-full relative">
                  <img
                    src={course.thumbnail || course.image || 'https://via.placeholder.com/400x300'}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  {progressPercentage === 100 && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                      <CheckCircle size={14} /> COMPLETED
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">
                    {course.instructor?.name || 'Instructor'}
                  </p>

                  <div className="mt-auto">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="font-medium text-slate-700 dark:text-zinc-300">Progress</span>
                      <span className="font-bold text-primary-600 dark:text-primary-400">
                        {progressPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-2.5 mb-5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          progressPercentage === 100 ? 'bg-emerald-500' : 'bg-primary-600'
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-zinc-700">
                      <span className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                        {completedLessonsInCourse} / {totalLessonsInCourse} Lessons
                      </span>
                      {progressPercentage === 100 ? (
                        <Link
                          to={`/courses/${course._id}/learn`}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-bold transition-colors"
                        >
                          Review <PlayCircle size={16} />
                        </Link>
                      ) : (
                        <Link
                          to={`/courses/${course._id}/learn`}
                          className="flex items-center gap-1.5 px-4 py-2 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 text-primary-700 dark:text-primary-400 rounded-lg text-sm font-bold transition-colors"
                        >
                          Continue <PlayCircle size={16} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
