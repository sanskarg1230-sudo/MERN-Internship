import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './redux/slices/authSlice';
import Navbar from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import InstructorCourses from './pages/InstructorCourses';
import InstructorStudents from './pages/InstructorStudents';
import InstructorAssignments from './pages/InstructorAssignments';
import InstructorAnalytics from './pages/InstructorAnalytics';
import InstructorMessages from './pages/InstructorMessages';
import InstructorSettings from './pages/InstructorSettings';
import CourseCatalog from './pages/CourseCatalog';
import CreateCourse from './pages/CreateCourse';
import EditCourse from './pages/EditCourse';
import VideoPlayer from './pages/VideoPlayer';
import QuizAttempt from './pages/QuizAttempt';
import CertificateView from './pages/CertificateView';
import AssignmentSubmit from './pages/AssignmentSubmit';
import MyCourses from './pages/MyCourses';
import MyCertificates from './pages/MyCertificates';
import StudentMessages from './pages/StudentMessages';
import InstructorLayout from './components/layout/InstructorLayout';
import { Outlet } from 'react-router-dom';

const MainLayout = () => (
  <>
    <Navbar />
    <main className="flex-grow">
      <Outlet />
    </main>
    {/* Footer can go here */}
  </>
);

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMe());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-50 transition-colors duration-300 flex flex-col font-sans">
        <Routes>
          {/* Public & Student Routes with Navbar */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<CourseCatalog />} />
            <Route path="/courses/:id/learn" element={<VideoPlayer />} />
            <Route path="/courses/:id/quiz" element={<QuizAttempt />} />
            <Route path="/courses/:id/assignments" element={<AssignmentSubmit />} />
            <Route path="/certificate/:certId" element={<CertificateView />} />
            <Route path="/my-courses" element={<MyCourses />} />
            <Route path="/my-certificates" element={<MyCertificates />} />
            <Route path="/messages" element={<StudentMessages />} />
          </Route>

          {/* Dedicated SaaS Instructor Routes without global Navbar */}
          <Route path="/instructor" element={<InstructorLayout />}>
            <Route path="dashboard" element={<InstructorDashboard />} />
            <Route path="courses" element={<InstructorCourses />} />
            <Route path="students" element={<InstructorStudents />} />
            <Route path="assignments" element={<InstructorAssignments />} />
            <Route path="analytics" element={<InstructorAnalytics />} />
            <Route path="messages" element={<InstructorMessages />} />
            <Route path="settings" element={<InstructorSettings />} />
            <Route path="course/create" element={<CreateCourse />} />
            <Route path="course/edit/:id" element={<EditCourse />} />
            {/* Add more instructor routes here later */}
          </Route>
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
