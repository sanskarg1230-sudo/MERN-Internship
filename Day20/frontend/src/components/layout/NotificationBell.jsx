import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // Connect to Socket.io server
    const socket = io('http://localhost:5000', {
      withCredentials: true,
    });

    // Join personal room
    socket.emit('join_room', user._id);

    // Listen for new notifications
    socket.on('new_notification', (data) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      toast(data.message, {
        icon: '🔔',
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
      });
    });

    socket.on('new_announcement', (announcement) => {
      const data = {
        message: `New Announcement: ${announcement.title}`,
        type: 'ANNOUNCEMENT'
      };
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      toast(data.message, {
        icon: '📢',
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
      });
    });

    socket.on('receive_message', (msg) => {
      const data = {
        message: `New message from ${msg.sender?.name || 'Instructor'}`,
        type: 'DIRECT_MESSAGE'
      };
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      toast(data.message, {
        icon: '💬',
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0); // Mark as read when opening
    }
  };

  const handleNotificationClick = (notification) => {
    setIsOpen(false);
    if (notification.type === 'ANNOUNCEMENT') {
      navigate('/messages?tab=announcements');
    } else if (notification.type === 'DIRECT_MESSAGE') {
      navigate(user?.role === 'instructor' ? '/instructor/messages' : '/messages?tab=chats');
    } else if (notification.type === 'ASSIGNMENT_GRADED') {
      navigate('/my-courses');
    } else if (notification.type === 'ASSIGNMENT_SUBMISSION') {
      navigate('/instructor/assignments');
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={toggleDropdown}
        className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors focus:outline-none"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 origin-top-right rounded-2xl bg-white dark:bg-zinc-800 shadow-xl border border-slate-100 dark:border-zinc-700 focus:outline-none z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-700 flex justify-between items-center bg-slate-50 dark:bg-zinc-800/50">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h3>
              {notifications.length > 0 && (
                <button 
                  onClick={() => setNotifications([])}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500 dark:text-zinc-400">
                  No new notifications
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {notifications.map((notification, index) => (
                    <li 
                      key={index} 
                      onClick={() => handleNotificationClick(notification)}
                      className="p-4 hover:bg-slate-50 dark:hover:bg-zinc-700/30 transition-colors cursor-pointer"
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-2 w-2 rounded-full bg-primary-500"></div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-800 dark:text-zinc-200">{notification.message}</p>
                          <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">Just now</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
