import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { 
  LayoutDashboard, 
  Video, 
  Users, 
  FileCheck, 
  BarChart3, 
  Settings, 
  Menu, 
  X, 
  LogOut,
  Bell,
  MessageSquare
} from 'lucide-react';
import { logout } from '../../redux/slices/authSlice';

const InstructorLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/instructor/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', path: '/instructor/courses', icon: Video },
    { name: 'Students', path: '/instructor/students', icon: Users },
    { name: 'Assignments', path: '/instructor/assignments', icon: FileCheck },
    { name: 'Analytics', path: '/instructor/analytics', icon: BarChart3 },
    { name: 'Messages', path: '/instructor/messages', icon: MessageSquare },
    { name: 'Settings', path: '/instructor/settings', icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 dark:bg-zinc-950 text-slate-300 dark:text-zinc-400 border-r border-slate-800 dark:border-zinc-800 shadow-2xl transition-all duration-300">
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 dark:border-zinc-800">
        <Link to="/" className={`font-bold text-xl text-white transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
          <span className="text-primary-500">Instructor</span>Studio
        </Link>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className="hidden md:block p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-primary-600/10 text-primary-500 dark:text-primary-400' 
                  : 'hover:bg-slate-800 hover:text-white dark:hover:bg-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-primary-500 dark:text-primary-400' : 'text-slate-400 group-hover:text-white'} />
              <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? 'opacity-100 block' : 'opacity-0 hidden md:hidden'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile / Logout */}
      <div className="p-4 border-t border-slate-800 dark:border-zinc-800">
        <button 
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors group ${!isSidebarOpen && 'md:justify-center'}`}
        >
          <LogOut size={20} />
          <span className={`font-medium transition-all duration-300 ${isSidebarOpen ? 'opacity-100 block' : 'opacity-0 hidden md:hidden'}`}>
            Logout
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-zinc-900 overflow-hidden font-sans">
      
      {/* Desktop Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? '260px' : '80px' }}
        className="hidden md:block h-full flex-shrink-0 z-20"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-[260px] z-40 md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Navbar Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg">
              <Menu size={24} />
            </button>
            {!isSidebarOpen && (
              <h2 className="hidden md:block text-lg font-bold text-slate-800 dark:text-zinc-100">Studio</h2>
            )}
          </div>
          
          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'notifications' ? null : 'notifications')}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors relative"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-zinc-950"></span>
            </button>
            
            {activeDropdown === 'notifications' && (
              <div className="absolute top-12 right-12 w-64 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-slate-100 dark:border-zinc-700 overflow-hidden z-50">
                <div className="p-3 border-b border-slate-100 dark:border-zinc-700 font-bold text-slate-800 dark:text-zinc-100">
                  Notifications
                </div>
                <div className="p-4 text-sm text-slate-500 dark:text-zinc-400 text-center">
                  No new notifications right now.
                </div>
              </div>
            )}

            <button 
              onClick={() => navigate('/instructor/messages')}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
            >
              <MessageSquare size={20} />
            </button>

            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'profile' ? null : 'profile')}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-purple-500 p-0.5 shadow-sm outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 transition-all hover:scale-105"
            >
              <div className="w-full h-full rounded-full border-2 border-white dark:border-zinc-950 overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Instructor&background=random" alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </button>

            {activeDropdown === 'profile' && (
              <div className="absolute top-12 right-0 w-48 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-slate-100 dark:border-zinc-700 overflow-hidden z-50">
                <div className="py-1">
                  <button onClick={() => { navigate('/instructor/settings'); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700">
                    Profile & Settings
                  </button>
                  <div className="h-px bg-slate-100 dark:bg-zinc-700 my-1"></div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default InstructorLayout;
