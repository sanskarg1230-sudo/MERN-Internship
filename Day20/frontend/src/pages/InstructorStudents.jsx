import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, BookOpen, Clock, MoreVertical, Award, Users } from 'lucide-react';
import api from '../services/api';

const InstructorStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/courses/instructor/students');
        setStudents(res.data);
      } catch (error) {
        console.error('Failed to fetch students', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleDropdown = (e, id) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
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
            <Users className="text-primary-600 dark:text-primary-500" size={32} />
            Student Roster
          </h1>
          <p className="mt-2 text-slate-500 dark:text-zinc-400">Manage and track progress for all your enrolled students.</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-zinc-800/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-700/60 mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 h-5 w-5" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-zinc-800/80 backdrop-blur-md rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-700/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-zinc-900/30 border-b border-slate-200 dark:border-zinc-700/80">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Student Profile</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Enrolled Courses</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-center">Lessons Finished</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Joined At</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-700/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <p className="text-slate-500 dark:text-zinc-400 text-lg">No students found matching your search.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={student._id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/20 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-zinc-700 flex-shrink-0 overflow-hidden">
                          <img src={student.profilePicture || `https://ui-avatars.com/api/?name=${student.name}&background=random`} alt={student.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{student.name}</p>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {student.courses.map(course => (
                          <span key={course.id} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded-md max-w-[200px] truncate">
                            <BookOpen size={12} className="text-primary-500 flex-shrink-0" />
                            <span className="truncate">{course.title}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {student.completedLessonsCount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-zinc-400">
                        <Clock size={14} />
                        {new Date(student.joinedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={(e) => toggleDropdown(e, student._id)}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {activeDropdown === student._id && (
                        <div className="absolute right-8 top-12 w-48 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-slate-100 dark:border-zinc-700 overflow-hidden z-20 origin-top-right">
                          <div className="py-1">
                            <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-colors">
                              <Mail size={16} className="text-primary-500" /> Send Message
                            </button>
                            <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-colors">
                              <Award size={16} className="text-amber-500" /> View Certificates
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InstructorStudents;
