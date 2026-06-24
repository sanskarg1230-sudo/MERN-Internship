import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Moon, Sun, Menu, X, BookOpen, LogOut } from 'lucide-react';
import { logout } from '../../redux/slices/authSlice';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    setIsMenuOpen(false); // Close mobile menu if open
  };

  const confirmLogout = () => {
    dispatch(logout());
    setShowLogoutConfirm(false);
    navigate('/');
  };

  return (
    <>
    <nav className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/70 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              LMS Pro
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/courses" className="text-slate-600 hover:text-primary-600 dark:text-zinc-300 dark:hover:text-primary-400 font-medium transition-colors">Courses</Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="text-slate-600 hover:text-primary-600 dark:text-zinc-300 font-medium transition-colors">Dashboard</Link>
                <Link to="/my-courses" className="text-slate-600 hover:text-primary-600 dark:text-zinc-300 font-medium transition-colors">My Courses</Link>
                <Link to="/my-certificates" className="text-slate-600 hover:text-primary-600 dark:text-zinc-300 font-medium transition-colors">My Certificates</Link>
                <Link to="/messages" className="text-slate-600 hover:text-primary-600 dark:text-zinc-300 font-medium transition-colors">Messages</Link>
                <NotificationBell />
                <div className="h-6 w-px bg-slate-200 dark:bg-zinc-700 mx-2"></div>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)} 
                  className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors text-slate-600 dark:text-zinc-300"
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button 
                  onClick={handleLogoutClick} 
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-zinc-300 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 group"
                >
                  <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)} 
                  className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors text-slate-600 dark:text-zinc-300"
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <Link to="/login" className="text-slate-600 hover:text-primary-600 dark:text-zinc-300 font-medium transition-colors">Login</Link>
                <Link to="/register" className="px-5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors shadow-lg shadow-primary-500/30">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors text-slate-600 dark:text-zinc-300"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600 dark:text-zinc-300">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 absolute w-full">
          <div className="px-4 pt-2 pb-6 space-y-3">
            <Link to="/courses" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-50 dark:text-zinc-300 dark:hover:bg-zinc-800">Courses</Link>
            
            {isAuthenticated ? (
               <>
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-50 dark:text-zinc-300 dark:hover:bg-zinc-800">Dashboard</Link>
                <Link to="/my-courses" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-50 dark:text-zinc-300 dark:hover:bg-zinc-800">My Courses</Link>
                <Link to="/my-certificates" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-50 dark:text-zinc-300 dark:hover:bg-zinc-800">My Certificates</Link>
                <Link to="/messages" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-50 dark:text-zinc-300 dark:hover:bg-zinc-800">Messages</Link>
                <button onClick={handleLogoutClick} className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors">
                  <LogOut size={18} /> Logout
                </button>
               </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-50 dark:text-zinc-300 dark:hover:bg-zinc-800">Login</Link>
                <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 bg-primary-50 dark:bg-primary-900/30">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>

    {/* Logout Confirmation Modal */}
    {showLogoutConfirm && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm">
        <div 
          className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200 border border-slate-100 dark:border-zinc-700"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <LogOut className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ready to leave?</h3>
            <p className="text-slate-500 dark:text-zinc-400 text-sm mb-6">
              Are you sure you want to log out of your account? You will need to log back in to access your courses.
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-700 dark:text-zinc-300 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-lg shadow-red-500/30 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Navbar;
