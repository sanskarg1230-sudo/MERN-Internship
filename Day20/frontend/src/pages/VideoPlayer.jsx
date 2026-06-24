import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PlayCircle, CheckCircle, ChevronLeft, Download, MessageSquare, FileText, Lock } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { completeLessonAsync } from '../redux/slices/authSlice';
import api from '../services/api';

const VideoPlayer = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const mockLessons = [
    { _id: 'm1', title: 'Introduction', duration: '15:20', isCompleted: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { _id: 'm2', title: 'Core Concepts', duration: '22:45', isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  ];
  
  const [activeLesson, setActiveLesson] = useState(mockLessons[0]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${id}`);
        const fetchedCourse = res.data;

        // Check enrollment
        if (
          user?.role === 'student' && 
          !user?.enrolledCourses?.includes(id) && 
          fetchedCourse.instructor?._id !== user?._id
        ) {
          toast.error('You must enroll in this course to view the content');
          navigate('/courses');
          return;
        }

        setCourse(fetchedCourse);
        if (res.data.lessons && res.data.lessons.length > 0) {
          setActiveLesson(res.data.lessons[0]);
        }
      } catch (error) {
        console.error('Failed to fetch course:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-20 text-red-500">Course not found</div>;
  }

  const handleCompleteCourse = async () => {
    try {
      const res = await api.post(`/certificates/course/${id}`);
      toast.success('Course Completed successfully!');
      navigate(`/certificate/${res.data.certificateId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete course. Make sure you passed the quiz!');
    }
  };

  const displayLessons = course.lessons?.length > 0 ? course.lessons : mockLessons;

  // Calculate Progress
  const completedLessonsCount = displayLessons.filter(lesson => user?.completedLessons?.includes(lesson._id || lesson.id)).length;
  const totalLessons = displayLessons.length;
  const progressPercentage = totalLessons > 0 ? (completedLessonsCount / totalLessons) * 100 : 0;
  const allLessonsCompleted = completedLessonsCount === totalLessons;

  const handleLessonComplete = () => {
    const lessonId = activeLesson._id || activeLesson.id;
    if (!user?.completedLessons?.includes(lessonId)) {
      dispatch(completeLessonAsync(lessonId))
        .unwrap()
        .then(() => toast.success('Lesson completed!'))
        .catch(() => toast.error('Failed to update progress'));
    }
  };

  const isCurrentLessonCompleted = user?.completedLessons?.includes(activeLesson._id || activeLesson.id);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/dashboard" className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors text-slate-600 dark:text-zinc-400">
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{course.title}</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">by {course.instructor?.name || 'Unknown Instructor'}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-grow">
        {/* Main Video Area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-grow flex flex-col bg-black rounded-3xl overflow-hidden shadow-xl"
        >
          <div className="w-full h-full relative aspect-video lg:aspect-auto">
            <video 
              key={activeLesson._id || activeLesson.id}
              className="w-full h-full object-contain"
              controls 
              autoPlay
              onEnded={handleLessonComplete}
            >
              <source src={activeLesson.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 p-6 border-t border-slate-200 dark:border-zinc-800">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{activeLesson.title}</h2>
                <div className="flex items-center gap-4">
                  {!isCurrentLessonCompleted ? (
                    <button 
                      onClick={handleLessonComplete}
                      className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <CheckCircle size={16} /> Mark as Completed
                    </button>
                  ) : (
                    <button 
                      onClick={handleCompleteCourse}
                      className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <CheckCircle size={16} /> Complete Course & Get Certificate
                    </button>
                  )}
                  <button className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <Download size={16} /> Resources
                  </button>
                </div>
              </div>
              <Link to={`/courses/${id}/assignments`} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl font-medium transition-colors">
                <FileText size={18} /> Assignments
              </Link>
              <button 
                disabled={!allLessonsCompleted}
                onClick={() => allLessonsCompleted && navigate(`/courses/${id}/quiz`)}
                title={!allLessonsCompleted ? "Watch all videos to unlock the final exam" : ""}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  allLessonsCompleted 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20 cursor-pointer' 
                    : 'bg-slate-200 dark:bg-zinc-700 text-slate-400 dark:text-zinc-500 cursor-not-allowed'
                }`}
              >
                {!allLessonsCompleted && <Lock size={16} />}
                Take Quiz
              </button>
            </div>
          </div>
        </motion.div>

        {/* Playlist Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-96 flex flex-col bg-white dark:bg-zinc-800 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-700 overflow-hidden flex-shrink-0"
        >
          <div className="p-5 border-b border-slate-100 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900/50">
            <h3 className="font-bold text-slate-900 dark:text-white">Course Content</h3>
            <p className="text-xs text-slate-500 mt-1">{completedLessonsCount} / {totalLessons} lessons completed</p>
            <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-1.5 mt-3">
              <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
          
          <div className="overflow-y-auto flex-grow p-3 space-y-2">
            {displayLessons.map((lesson, index) => (
              <button
                key={lesson._id || lesson.id}
                onClick={() => setActiveLesson(lesson)}
                className={`w-full text-left p-3 rounded-xl transition-all flex gap-3 ${
                  (activeLesson._id || activeLesson.id) === (lesson._id || lesson.id) 
                    ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800' 
                    : 'hover:bg-slate-50 dark:hover:bg-zinc-700/50 border border-transparent'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {user?.completedLessons?.includes(lesson._id || lesson.id) ? (
                    <CheckCircle size={18} className="text-emerald-500" />
                  ) : (activeLesson._id || activeLesson.id) === (lesson._id || lesson.id) ? (
                    <PlayCircle size={18} className="text-primary-600 dark:text-primary-400" />
                  ) : (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-700 text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                      {index + 1}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className={`text-sm font-medium leading-tight mb-1 ${
                    (activeLesson._id || activeLesson.id) === (lesson._id || lesson.id) ? 'text-primary-700 dark:text-primary-300' : 'text-slate-700 dark:text-zinc-300'
                  }`}>
                    {lesson.title}
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-zinc-500">{lesson.duration}</span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VideoPlayer;
