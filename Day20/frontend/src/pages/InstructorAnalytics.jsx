import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, DollarSign, Users, BookOpen, Star, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { 
  AreaChart, Area, 
  BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses } from '../redux/slices/courseSlice';

const InstructorAnalytics = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { courses, loading } = useSelector((state) => state.courses);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const myCourses = courses.filter((course) => 
    (course.instructor?._id || course.instructor) === user?._id
  );

  // Derived Statistics
  const totalRevenue = myCourses.reduce((sum, course) => sum + ((course.price || 0) * (course.enrolledStudents?.length || 0)), 0);
  const totalStudents = myCourses.reduce((sum, course) => sum + (course.enrolledStudents?.length || 0), 0);
  
  // Dummy Data for visual demonstration
  const revenueData = [
    { name: 'Jan', revenue: totalRevenue * 0.1 },
    { name: 'Feb', revenue: totalRevenue * 0.15 },
    { name: 'Mar', revenue: totalRevenue * 0.2 },
    { name: 'Apr', revenue: totalRevenue * 0.35 },
    { name: 'May', revenue: totalRevenue * 0.6 },
    { name: 'Jun', revenue: totalRevenue },
  ];

  const studentGrowthData = [
    { name: 'Jan', students: Math.floor(totalStudents * 0.2) },
    { name: 'Feb', students: Math.floor(totalStudents * 0.35) },
    { name: 'Mar', students: Math.floor(totalStudents * 0.45) },
    { name: 'Apr', students: Math.floor(totalStudents * 0.6) },
    { name: 'May', students: Math.floor(totalStudents * 0.8) },
    { name: 'Jun', students: totalStudents },
  ];

  const coursePerformanceData = myCourses.slice(0, 4).map(course => ({
    name: course.title.length > 15 ? course.title.substring(0, 15) + '...' : course.title,
    revenue: (course.price || 0) * (course.enrolledStudents?.length || 0)
  }));

  const COLORS = ['#6366f1', '#8b5cf6', '#14b8a6', '#f59e0b'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <BarChart3 className="text-primary-600 dark:text-primary-500" size={32} />
          Analytics & Reports
        </h1>
        <p className="mt-2 text-slate-500 dark:text-zinc-400">Deep dive into your revenue, student growth, and course performance.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, trend: '+12.5%', isPositive: true, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { title: 'Total Enrollments', value: totalStudents.toLocaleString(), trend: '+8.2%', isPositive: true, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { title: 'Active Courses', value: myCourses.length, trend: '0%', isPositive: true, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { title: 'Avg. Course Rating', value: '4.8', trend: '+0.2', isPositive: true, icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' }
        ].map((stat, index) => (
          <motion.div 
            key={stat.title}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-zinc-800/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-700/60"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${stat.isPositive ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30' : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'}`}>
                {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Revenue Area Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-zinc-800/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-700/60"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-primary-500" size={20} />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Growth</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.15} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Student Growth Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-zinc-800/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-700/60"
        >
          <div className="flex items-center gap-2 mb-6">
            <Users className="text-emerald-500" size={20} />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Enrollment Trends</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.15} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                />
                <Bar dataKey="students" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

      {/* Course Breakdown Pie Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-white dark:bg-zinc-800/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-700/60 flex flex-col items-center"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 w-full text-left">Revenue by Course (Top 4)</h2>
        {coursePerformanceData.length > 0 ? (
          <div className="h-[350px] w-full max-w-lg">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={coursePerformanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="revenue"
                  stroke="none"
                >
                  {coursePerformanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `$${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-500">Not enough data to display breakdown.</div>
        )}
      </motion.div>
    </div>
  );
};

export default InstructorAnalytics;
