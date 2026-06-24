import { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Lock, 
  Bell, 
  Palette, 
  Save, 
  Camera, 
  Moon, 
  Sun,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const InstructorSettings = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  
  // Simulated Theme State
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark') || 
    localStorage.getItem('theme') === 'dark'
  );

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Settings updated successfully!');
    }, 800);
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Public Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette },
  ];

  return (
    <div className="max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-slate-500 dark:text-zinc-400">Manage your account preferences, profile, and security.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 hide-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' 
                      : 'bg-white dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <tab.icon size={18} className={isActive ? 'text-white' : 'text-slate-400 dark:text-zinc-500'} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                className="bg-white dark:bg-zinc-800/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-zinc-700/60"
              >
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden border-4 border-white dark:border-zinc-800 shadow-lg">
                      <img 
                        src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name || 'Instructor'}&background=random`} 
                        alt="Profile" 
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${user?.name || 'Instructor'}&background=random`; }}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors">
                      <Camera size={16} />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Profile Picture</h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">PNG, JPG up to 5MB. Recommended size 500x500px.</p>
                  </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Full Name</label>
                      <input type="text" defaultValue={user?.name} className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Email Address</label>
                      <input type="email" defaultValue={user?.email} className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Professional Headline</label>
                    <input type="text" placeholder="e.g. Senior Software Engineer & Educator" className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Instructor Bio</label>
                    <textarea rows="4" placeholder="Tell students about your experience and teaching style..." className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white" />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-70">
                      {isSaving ? 'Saving...' : <><Save size={18} /> Save Profile</>}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <motion.div 
                key="security"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-zinc-800/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-zinc-700/60">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <ShieldCheck className="text-primary-500" /> Change Password
                  </h2>
                  <form onSubmit={handleSave} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Current Password</label>
                      <input type="password" placeholder="••••••••" className="w-full max-w-md px-4 py-3 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full max-w-md px-4 py-3 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white" />
                    </div>
                    <div className="pt-2">
                      <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 rounded-xl font-bold transition-all">
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-white dark:bg-zinc-800/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-zinc-700/60 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                      <Smartphone className="text-blue-500" size={20} /> Two-Factor Authentication
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">Add an extra layer of security to your account.</p>
                  </div>
                  <button className="px-5 py-2 bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-600 transition-colors">
                    Enable 2FA
                  </button>
                </div>
              </motion.div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <motion.div 
                key="notifications"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                className="bg-white dark:bg-zinc-800/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-zinc-700/60"
              >
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Notification Preferences</h2>
                
                <div className="space-y-4">
                  {[
                    { title: 'New Student Enrollments', desc: 'Get notified when a new student joins your course.', defaultChecked: true },
                    { title: 'Assignment Submissions', desc: 'Receive alerts when students submit their work for review.', defaultChecked: true },
                    { title: 'Course Reviews', desc: 'Get notified when a student leaves a rating or review.', defaultChecked: true },
                    { title: 'Platform Updates', desc: 'Receive news and updates about Instructor Studio features.', defaultChecked: false },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between p-5 border border-slate-200 dark:border-zinc-700 rounded-2xl bg-slate-50 dark:bg-zinc-900/50">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">{item.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                        <input type="checkbox" className="sr-only peer" defaultChecked={item.defaultChecked} />
                        <div className="w-11 h-6 bg-slate-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
                
                <div className="pt-8 flex justify-end">
                  <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-70">
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === 'preferences' && (
              <motion.div 
                key="preferences"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                className="bg-white dark:bg-zinc-800/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-zinc-700/60"
              >
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Appearance & Settings</h2>
                
                <div className="flex items-center justify-between p-5 border border-slate-200 dark:border-zinc-700 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 mb-6">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Studio Theme</h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">Toggle between Light mode and Dark Zinc mode.</p>
                  </div>
                  <button 
                    onClick={toggleTheme}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-zinc-700"
                  >
                    {isDarkMode ? <><Sun size={18} className="text-amber-500" /> Light Mode</> : <><Moon size={18} className="text-indigo-500" /> Dark Mode</>}
                  </button>
                </div>

                <div className="flex items-center justify-between p-5 border border-slate-200 dark:border-zinc-700 rounded-2xl bg-slate-50 dark:bg-zinc-900/50">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Email Language</h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">The language used for your student communications.</p>
                  </div>
                  <select className="px-4 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none font-medium text-slate-700 dark:text-white">
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default InstructorSettings;
