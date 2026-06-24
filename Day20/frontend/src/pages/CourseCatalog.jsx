import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses, enrollInCourse } from '../redux/slices/courseSlice';
import { updateAuthUser } from '../redux/slices/authSlice';
import { toast } from 'react-hot-toast';

const CourseCatalog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const dispatch = useDispatch();
  const { courses, loading, error } = useSelector((state) => state.courses);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const handleEnroll = async (courseId) => {
    if (!isAuthenticated) {
      toast.error('Please login to enroll');
      return;
    }
    try {
      await dispatch(enrollInCourse(courseId)).unwrap();
      toast.success('Successfully enrolled!');
      
      // Update local storage so reload picks it up
      const updatedEnrolledCourses = [...(user.enrolledCourses || []), courseId];
      dispatch(updateAuthUser({ enrolledCourses: updatedEnrolledCourses }));

      window.location.reload();
    } catch (err) {
      toast.error(err.message || 'Failed to enroll');
    }
  };
  
  // Using real courses from DB instead of mock data

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Explore Courses</h1>
          <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">Find the perfect course to advance your career.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors">
            <Filter size={18} />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">{error}</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 text-slate-500">No courses available yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase())).map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group flex flex-col bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 dark:border-zinc-700 transition-all duration-300"
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={course.thumbnail || course.image || 'https://via.placeholder.com/400x300'} 
                alt={course.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute top-3 left-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-slate-700 dark:text-zinc-300">
                {course.category}
              </div>
            </div>
            
            <div className="p-5 flex flex-col flex-grow">
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">{course.rating || 0}</span>
                <span className="text-xs text-slate-500 dark:text-zinc-400">({(course.reviews || 0).toLocaleString()})</span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">{course.title}</h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400 mb-4">{course.instructor?.name || 'Unknown Instructor'}</p>
              
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-zinc-400 mb-6 mt-auto">
                <span className="flex items-center gap-1"><Clock size={14} /> {course.duration || '0h'}</span>
                <span>• {course.level}</span>
              </div>
              
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-700 flex items-center justify-between">
                <span className="text-xl font-bold text-slate-900 dark:text-white">${course.price}</span>
                {user?.enrolledCourses?.includes(course._id) || course.instructor?._id === user?._id || user?.role === 'admin' ? (
                  <Link to={`/courses/${course._id}/learn`} className="px-4 py-2 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-lg text-sm font-semibold transition-colors">
                    View Course
                  </Link>
                ) : (
                  <button 
                    onClick={() => handleEnroll(course._id)}
                    className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg text-sm font-semibold transition-colors shadow-md shadow-primary-500/20"
                  >
                    Enroll Now
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        </div>
      )}
    </div>
  );
};

export default CourseCatalog;
