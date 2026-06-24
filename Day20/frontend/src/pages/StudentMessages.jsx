import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, MessageSquare, Send, User, Clock, Search, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { fetchCourses } from '../redux/slices/courseSlice';
import api from '../services/api';
import { io } from 'socket.io-client';

const StudentMessages = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { courses } = useSelector((state) => state.courses);
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') === 'chats' ? 'chats' : 'announcements';
  });
  
  // Update tab if URL changes while on page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab')) {
      setActiveTab(params.get('tab'));
    }
  }, [location.search]);
  
  // Data State
  const [announcements, setAnnouncements] = useState([]);
  const [instructors, setInstructors] = useState([]);
  
  // Chat State
  const [activeChatId, setActiveChatId] = useState(null); // Instructor ID
  const [chatHistory, setChatHistory] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  // Fetch Data when courses are loaded
  useEffect(() => {
    if (courses.length > 0 && user?.enrolledCourses) {
      loadStudentData();
    }
  }, [courses, user]);

  const loadStudentData = async () => {
    try {
      const enrolledCourses = courses.filter(c => user.enrolledCourses.includes(c._id));
      
      // 1. Get unique instructors from enrolled courses
      const instructorMap = new Map();
      enrolledCourses.forEach(c => {
        if (c.instructor && !instructorMap.has(c.instructor._id)) {
          instructorMap.set(c.instructor._id, {
            _id: c.instructor._id,
            name: c.instructor.name,
            profilePicture: c.instructor.profilePicture,
            courses: [c.title]
          });
        } else if (c.instructor) {
          instructorMap.get(c.instructor._id).courses.push(c.title);
        }
      });
      setInstructors(Array.from(instructorMap.values()));

      // 2. Fetch Announcements for all enrolled courses
      const announcementPromises = enrolledCourses.map(c => 
        api.get(`/messages/announcements/${c._id}`).catch(() => ({ data: [] }))
      );
      
      const results = await Promise.all(announcementPromises);
      const allAnnouncements = results.flatMap((res, index) => 
        res.data.map(ann => ({ ...ann, courseTitle: enrolledCourses[index].title }))
      );
      
      // Sort newest first
      allAnnouncements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAnnouncements(allAnnouncements);

    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setLoading(false);
    }
  };

  // Socket Connection for Real-Time Updates while on this page
  useEffect(() => {
    if (!user) return;
    
    socketRef.current = io('http://localhost:5000', { withCredentials: true });
    socketRef.current.emit('join_room', user._id);

    socketRef.current.on('receive_message', (msg) => {
      // If we are currently chatting with the sender, append it
      if (activeChatId === msg.sender._id || activeChatId === msg.sender) {
        setChatHistory(prev => [...prev, msg]);
        scrollToBottom();
      }
    });

    socketRef.current.on('new_announcement', (ann) => {
      // Prepend to announcements
      setAnnouncements(prev => [ann, ...prev]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [user, activeChatId]);

  // Fetch Chat History
  useEffect(() => {
    if (activeChatId) {
      const fetchChat = async () => {
        try {
          const res = await api.get(`/messages/${activeChatId}`);
          setChatHistory(res.data);
          scrollToBottom();
        } catch (error) {
          console.error('Failed to fetch chat', error);
        }
      };
      fetchChat();
    }
  }, [activeChatId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId) return;

    setIsSending(true);
    try {
      const res = await api.post(`/messages/${activeChatId}`, { content: newMessage });
      setChatHistory(prev => [...prev, res.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <MessageSquare className="text-primary-600 dark:text-primary-500" size={32} />
          Communications Hub
        </h1>
        <p className="mt-2 text-slate-500 dark:text-zinc-400">Stay up to date with course announcements and chat with your instructors.</p>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-sm border border-slate-200 dark:border-zinc-700 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Sidebar - Navigation */}
        <div className="w-full md:w-80 border-r border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-900/30 flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-zinc-700">
            <div className="flex bg-slate-200 dark:bg-zinc-800 rounded-xl p-1">
              <button 
                onClick={() => { setActiveTab('announcements'); setActiveChatId(null); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'announcements' ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'}`}
              >
                <Megaphone size={16} /> Broadcasts
              </button>
              <button 
                onClick={() => setActiveTab('chats')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'chats' ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'}`}
              >
                <MessageSquare size={16} /> Instructors
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === 'announcements' ? (
              <div className="p-4">
                <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-3 px-2">Recent Broadcasts</p>
                {announcements.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-zinc-400 px-2">No announcements yet.</p>
                ) : (
                  <div className="space-y-2">
                    <div className="p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30 rounded-xl">
                      <p className="text-sm font-bold text-primary-700 dark:text-primary-400">{announcements.length} Total</p>
                      <p className="text-xs text-primary-600 dark:text-primary-500">Across your enrolled courses</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2">
                {instructors.length === 0 ? (
                  <div className="p-6 text-center">
                    <User className="h-8 w-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-zinc-400">Enroll in a course to chat with instructors.</p>
                  </div>
                ) : (
                  instructors.map(inst => (
                    <button
                      key={inst._id}
                      onClick={() => setActiveChatId(inst._id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${activeChatId === inst._id ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30' : 'hover:bg-slate-100 dark:hover:bg-zinc-800 border border-transparent'}`}
                    >
                      <img 
                        src={inst.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(inst.name || 'I')}`} 
                        alt={inst.name} 
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(inst.name || 'I')}`; }}
                        className="w-10 h-10 rounded-full object-cover" 
                      />
                      <div className="flex-1 overflow-hidden">
                        <h4 className={`text-sm font-bold truncate ${activeChatId === inst._id ? 'text-primary-700 dark:text-primary-400' : 'text-slate-900 dark:text-white'}`}>{inst.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">{inst.courses.join(', ')}</p>
                      </div>
                      <ChevronRight size={16} className={activeChatId === inst._id ? 'text-primary-500' : 'text-slate-400'} />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 relative">
          {activeTab === 'announcements' ? (
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-zinc-900/50">
              {announcements.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500">
                  <Megaphone size={48} className="mb-4 opacity-50" />
                  <p className="text-lg font-medium">No Announcements</p>
                  <p className="text-sm">Instructors haven't posted any global broadcasts yet.</p>
                </div>
              ) : (
                <div className="space-y-6 max-w-3xl mx-auto">
                  {announcements.map((ann, i) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      key={ann._id} 
                      className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-zinc-700"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                          <Megaphone size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-lg">{ann.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                            <span className="font-semibold text-primary-600 dark:text-primary-400">{ann.courseTitle || 'Course'}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> {new Date(ann.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-zinc-300 text-sm whitespace-pre-wrap">
                        {ann.content}
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-700 flex items-center gap-2">
                        <img 
                          src={ann.instructor?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(ann.instructor?.name || 'I')}`} 
                          onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(ann.instructor?.name || 'I')}`; }}
                          className="w-6 h-6 rounded-full object-cover" 
                          alt="" 
                        />
                        <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Posted by {ann.instructor?.name}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : !activeChatId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 bg-slate-50 dark:bg-zinc-900/50">
              <MessageSquare size={64} className="mb-4 opacity-20" />
              <p className="text-lg font-medium text-slate-600 dark:text-zinc-400">Select an Instructor</p>
              <p className="text-sm">Choose an instructor from the sidebar to start a conversation.</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center gap-4 shadow-sm z-10">
                <img 
                  src={instructors.find(i => i._id === activeChatId)?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructors.find(i => i._id === activeChatId)?.name || 'I')}`} 
                  alt="Instructor" 
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(instructors.find(i => i._id === activeChatId)?.name || 'I')}`; }}
                  className="w-10 h-10 rounded-full border border-slate-200 dark:border-zinc-600 object-cover"
                />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{instructors.find(i => i._id === activeChatId)?.name}</h3>
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">Instructor</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-zinc-900/50 space-y-4">
                {chatHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500">
                    <p className="text-sm">Say hello to your instructor!</p>
                  </div>
                ) : (
                  chatHistory.map((msg, idx) => {
                    const isMe = msg.sender._id ? msg.sender._id === user._id : msg.sender === user._id;
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        key={msg._id || idx} 
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${isMe ? 'bg-primary-600 text-white rounded-tr-sm' : 'bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 rounded-tl-sm'}`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className={`text-[10px] mt-2 font-medium text-right ${isMe ? 'text-primary-200' : 'text-slate-400 dark:text-zinc-500'}`}>
                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white dark:bg-zinc-800 border-t border-slate-200 dark:border-zinc-700">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-transparent dark:border-zinc-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 rounded-xl outline-none text-slate-900 dark:text-white transition-all"
                  />
                  <button 
                    type="submit" 
                    disabled={!newMessage.trim() || isSending}
                    className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-12 h-12 shadow-md shadow-primary-500/20"
                  >
                    <Send size={20} className={newMessage.trim() ? "translate-x-0.5 -translate-y-0.5 transition-transform" : ""} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentMessages;
