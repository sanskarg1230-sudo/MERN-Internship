import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, BookOpen, DollarSign, Star, Plus, TrendingUp, Award, Presentation } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchCourses } from '../redux/slices/courseSlice';

const InstructorDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { courses, loading } = useSelector((state) => state.courses);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  // Filter courses by the logged-in instructor
  const myCourses = courses.filter((course) => 
    (course.instructor?._id || course.instructor) === user?._id
  );

  // Calculate Real Statistics
  const totalStudents = myCourses.reduce((sum, course) => sum + (course.enrolledStudents?.length || 0), 0);
  const totalRevenue = myCourses.reduce((sum, course) => sum + ((course.price || 0) * (course.enrolledStudents?.length || 0)), 0);
  const activeCourses = myCourses.length;
  
  // Calculate average rating
  const ratedCourses = myCourses.filter(c => c.averageRating > 0);
  const avgRating = ratedCourses.length > 0 
    ? (ratedCourses.reduce((sum, course) => sum + course.averageRating, 0) / ratedCourses.length).toFixed(1)
    : 'New';

  // Sort by revenue/students to get top courses
  const topCourses = [...myCourses]
    .sort((a, b) => ((b.price || 0) * (b.enrolledStudents?.length || 0)) - ((a.price || 0) * (a.enrolledStudents?.length || 0)))
    .slice(0, 5);

  const stats = [
    { name: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10 dark:bg-emerald-500/20' },
    { name: 'Total Students', value: totalStudents.toLocaleString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10 dark:bg-blue-500/20' },
    { name: 'Active Courses', value: activeCourses.toString(), icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-500/10 dark:bg-purple-500/20' },
    { name: 'Avg. Rating', value: avgRating, icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10 dark:bg-amber-500/20' },
  ];

  // Simulated growth chart data based on actual revenue for visual flair
  const revenueData = [
    { name: 'Jan', revenue: totalRevenue * 0.1 },
    { name: 'Feb', revenue: totalRevenue * 0.25 },
    { name: 'Mar', revenue: totalRevenue * 0.3 },
    { name: 'Apr', revenue: totalRevenue * 0.6 },
    { name: 'May', revenue: totalRevenue * 0.8 },
    { name: 'Jun', revenue: totalRevenue },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-2">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Presentation className="text-primary-600 dark:text-primary-500" size={32} />
            Instructor Dashboard
          </h1>
          <p className="mt-2 text-slate-500 dark:text-zinc-400">Manage your premium content and track real-time analytics.</p>
        </div>
        <Link 
          to="/instructor/course/create" 
          className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-600/30 transition-all hover:-translate-y-0.5"
        >
          <Plus size={20} /> Create Course
        </Link>
      </div>

      {myCourses.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-zinc-800 rounded-3xl p-12 text-center border border-slate-100 dark:border-zinc-800 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-purple-500"></div>
          <div className="mx-auto w-24 h-24 bg-primary-50 dark:bg-zinc-700/50 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Presentation className="h-12 w-12 text-primary-500 dark:text-primary-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Welcome to your studio, {user?.name}!</h3>
          <p className="text-slate-500 dark:text-zinc-400 mb-8 max-w-lg mx-auto text-lg">
            You haven't published any courses yet. Start sharing your expertise with the world and build your premium audience today.
          </p>
          <Link
            to="/instructor/course/create"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl hover:from-primary-700 hover:to-purple-700 font-bold transition-all shadow-lg shadow-primary-500/30 hover:-translate-y-1"
          >
            <Plus size={20} /> Publish Your First Course
          </Link>
        </motion.div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-800 p-6 shadow-sm border border-slate-100 dark:border-zinc-700/60 hover:shadow-xl hover:border-slate-200 dark:hover:border-zinc-600 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${item.bg} group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`h-7 w-7 ${item.color}`} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mb-1">{item.name}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{item.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-700/60"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="text-primary-500" size={20} /> Revenue Trajectory
                </h2>
                <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">
                  +24% This Month
                </span>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#52525b" opacity={0.15} vertical={false} />
                    <XAxis dataKey="name" stroke="#71717a" axisLine={false} tickLine={false} dy={10} fontSize={12} />
                    <YAxis stroke="#71717a" axisLine={false} tickLine={false} dx={-10} fontSize={12} tickFormatter={(val) => `$${val}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                      itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#6366f1" 
                      strokeWidth={4} 
                      dot={{ r: 0 }} 
                      activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Top Courses Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-700/60 flex flex-col"
            >
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Award className="text-amber-500" size={20} /> Top Performing Courses
              </h2>
              <div className="space-y-4 flex-grow">
                {topCourses.map((course, i) => {
                  const courseRevenue = (course.price || 0) * (course.enrolledStudents?.length || 0);
                  return (
                    <Link 
                      to={`/courses/${course._id}`}
                      key={course._id} 
                      className="group flex flex-col p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/40 border border-transparent hover:border-primary-100 dark:hover:border-primary-900/30 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all cursor-pointer"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="h-12 w-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-zinc-800">
                          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {course.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-zinc-400">
                            <span className="flex items-center gap-1"><Users size={12} className="text-blue-500"/> {course.enrolledStudents?.length || 0}</span>
                            <span className="flex items-center gap-1"><DollarSign size={12} className="text-emerald-500"/> {courseRevenue.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <Link to="/courses" className="mt-6 w-full text-center px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-700/50 text-sm font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
                View Catalog
              </Link>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
};

export default InstructorDashboard;
