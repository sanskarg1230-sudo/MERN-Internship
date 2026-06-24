import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Plus, 
  BookOpen, 
  Users, 
  DollarSign, 
  Star 
} from 'lucide-react';
import { fetchCourses } from '../redux/slices/courseSlice';
import api from '../services/api';

const InstructorCourses = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { courses, loading } = useSelector((state) => state.courses);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const myCourses = courses.filter((course) => 
    (course.instructor?._id || course.instructor) === user?._id
  );

  const categories = ['All', ...new Set(myCourses.map(c => c.category))];

  const filteredCourses = myCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || course.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to permanently delete this course? This action cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/courses/${courseId}`);
      toast.success('Course deleted successfully');
      dispatch(fetchCourses()); // Refresh the list
    } catch (error) {
      toast.error('Failed to delete course');
    } finally {
      setIsDeleting(false);
      setActiveDropdown(null);
    }
  };

  const toggleDropdown = (e, id) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  if (loading && myCourses.length === 0) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <BookOpen className="text-primary-600 dark:text-primary-500" size={32} />
            Course Management
          </h1>
          <p className="mt-2 text-slate-500 dark:text-zinc-400">View, edit, and analyze your published courses.</p>
        </div>
        <Link 
          to="/instructor/course/create" 
          className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-600/30 transition-all hover:-translate-y-0.5"
        >
          <Plus size={20} /> Create New Course
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-zinc-800/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-700/60 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 h-5 w-5" />
          <input 
            type="text" 
            placeholder="Search courses..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-700 rounded-xl">
            <Filter className="text-slate-400 dark:text-zinc-500 h-4 w-4" />
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 dark:text-zinc-300 w-full"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-zinc-800/80 backdrop-blur-md rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-700/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-zinc-900/30 border-b border-slate-200 dark:border-zinc-700/80">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Course</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-center">Students</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-center">Revenue</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-center">Rating</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-700/60">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <p className="text-slate-500 dark:text-zinc-400 text-lg">No courses found matching your search.</p>
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => {
                  const enrollments = course.enrolledStudents?.length || 0;
                  const revenue = enrollments * (course.price || 0);
                  
                  return (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={course._id} 
                      className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/20 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-16 rounded-lg overflow-hidden bg-slate-200 dark:bg-zinc-800 flex-shrink-0 relative">
                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{course.title}</p>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{course.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-zinc-300">
                          <Users size={14} className="text-blue-500" /> {enrollments}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          <DollarSign size={14} /> {revenue.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-500">
                          <Star size={14} className="fill-amber-500" /> 
                          {course.averageRating > 0 ? course.averageRating.toFixed(1) : 'New'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                          Published
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button 
                          onClick={(e) => toggleDropdown(e, course._id)}
                          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <MoreVertical size={18} />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {activeDropdown === course._id && (
                          <div className="absolute right-8 top-12 w-48 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-slate-100 dark:border-zinc-700 overflow-hidden z-20 origin-top-right">
                            <div className="py-1">
                              <button onClick={() => navigate(`/courses/${course._id}/learn`)} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-colors">
                                <Eye size={16} className="text-blue-500" /> View Course
                              </button>
                              <button onClick={() => navigate(`/instructor/course/edit/${course._id}`)} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-colors">
                                <Edit size={16} className="text-amber-500" /> Edit Course
                              </button>
                              <div className="h-px bg-slate-100 dark:bg-zinc-700 my-1"></div>
                              <button 
                                onClick={() => handleDelete(course._id)}
                                disabled={isDeleting}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <Trash2 size={16} /> Delete Course
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InstructorCourses;
