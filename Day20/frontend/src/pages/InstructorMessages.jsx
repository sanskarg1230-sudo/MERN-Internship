import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { 
  Search, 
  Send, 
  MessageSquare, 
  Megaphone,
  User,
  Clock,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const InstructorMessages = () => {
  const { user } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' or 'announcements'
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Direct Messaging State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Announcements State
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize Socket and Fetch Contacts
  useEffect(() => {
    // Connect Socket
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
    });

    if (user?._id) {
      socketRef.current.emit('join_room', user._id);
    }

    socketRef.current.on('receive_message', (message) => {
      // If the incoming message is from the currently selected student, append it
      setMessages((prev) => [...prev, message]);
    });

    // Fetch initial data
    const fetchInitialData = async () => {
      try {
        const [studentsRes, coursesRes] = await Promise.all([
          api.get('/courses/instructor/students'),
          api.get('/courses') // Instructor's courses handled later or assuming we filter
        ]);
        setStudents(studentsRes.data);
        
        const myCourses = coursesRes.data.filter(c => (c.instructor?._id || c.instructor) === user?._id);
        setCourses(myCourses);
      } catch (error) {
        console.error('Failed to load contacts', error);
      }
    };
    fetchInitialData();

    return () => {
      socketRef.current.disconnect();
    };
  }, [user]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, announcements]);

  // Load chat history when student is selected
  useEffect(() => {
    if (selectedStudent && activeTab === 'direct') {
      const fetchChat = async () => {
        try {
          const res = await api.get(`/messages/${selectedStudent._id}`);
          setMessages(res.data);
        } catch (error) {
          console.error('Failed to fetch chat', error);
        }
      };
      fetchChat();
    }
  }, [selectedStudent, activeTab]);

  // Load announcements when course is selected
  useEffect(() => {
    if (selectedCourse && activeTab === 'announcements') {
      const fetchAnnouncements = async () => {
        try {
          const res = await api.get(`/messages/announcements/${selectedCourse._id}`);
          setAnnouncements(res.data);
        } catch (error) {
          console.error('Failed to fetch announcements', error);
        }
      };
      fetchAnnouncements();
    }
  }, [selectedCourse, activeTab]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedStudent) return;

    try {
      const res = await api.post(`/messages/${selectedStudent._id}`, { content: newMessage });
      setMessages((prev) => [...prev, res.data]); // Append my own message
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementTitle || !announcementContent || !selectedCourse) return;

    try {
      const res = await api.post(`/messages/announcements/${selectedCourse._id}`, {
        title: announcementTitle,
        content: announcementContent
      });
      // Append manually for instant feedback since we are the sender
      const newAnn = { ...res.data, instructor: user };
      setAnnouncements((prev) => [newAnn, ...prev]);
      setShowAnnouncementModal(false);
      setAnnouncementTitle('');
      setAnnouncementContent('');
      toast.success('Announcement broadcasted globally!');
    } catch (error) {
      toast.error('Failed to post announcement');
    }
  };

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6 p-4 max-w-7xl mx-auto">
      
      {/* Sidebar Panel */}
      <div className="w-full md:w-80 flex flex-col bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden flex-shrink-0">
        
        {/* Toggle Tabs */}
        <div className="flex p-2 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800">
          <button 
            onClick={() => { setActiveTab('direct'); setSelectedCourse(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'direct' ? 'bg-white dark:bg-zinc-800 text-primary-600 shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
          >
            <MessageSquare size={16} /> Direct
          </button>
          <button 
            onClick={() => { setActiveTab('announcements'); setSelectedStudent(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'announcements' ? 'bg-white dark:bg-zinc-800 text-amber-600 shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
          >
            <Megaphone size={16} /> Broadcasts
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder={activeTab === 'direct' ? "Search students..." : "Search courses..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
        </div>

        {/* List Items */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'direct' ? (
            <div className="divide-y divide-slate-50 dark:divide-zinc-800/50">
              {filteredStudents.length === 0 && <p className="text-center py-8 text-slate-400 text-sm">No students found.</p>}
              {filteredStudents.map(student => (
                <button 
                  key={student._id}
                  onClick={() => setSelectedStudent(student)}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors text-left ${selectedStudent?._id === student._id ? 'bg-primary-50 dark:bg-primary-900/10 border-l-4 border-primary-500' : 'border-l-4 border-transparent'}`}
                >
                  <img 
                    src={student.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || 'S')}&background=random`} 
                    alt={student.name} 
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || 'S')}&background=random`; }}
                    className="w-10 h-10 rounded-full object-cover" 
                  />
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-slate-900 dark:text-zinc-100 truncate text-sm">{student.name}</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-500 truncate">{student.email}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-zinc-800/50">
              {filteredCourses.length === 0 && <p className="text-center py-8 text-slate-400 text-sm">No courses found.</p>}
              {filteredCourses.map(course => (
                <button 
                  key={course._id}
                  onClick={() => setSelectedCourse(course)}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors text-left ${selectedCourse?._id === course._id ? 'bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500' : 'border-l-4 border-transparent'}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-slate-900 dark:text-zinc-100 truncate text-sm">{course.title}</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-500 truncate">{course.enrolledStudents?.length || 0} Students Enrolled</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat/Announcement Panel */}
      <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden relative">
        
        {/* DIRECT MESSAGING VIEW */}
        {activeTab === 'direct' ? (
          selectedStudent ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900 flex items-center gap-4">
                <img 
                  src={selectedStudent.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name || 'S')}&background=random`} 
                  alt="Avatar" 
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name || 'S')}&background=random`; }}
                  className="w-10 h-10 rounded-full" 
                />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{selectedStudent.name}</h3>
                  <p className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online / Active
                  </p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 dark:bg-zinc-950/30">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <MessageSquare size={48} className="mb-4 opacity-20" />
                    <p>No messages yet. Say hi to {selectedStudent.name}!</p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMine = msg.sender === user._id || msg.sender?._id === user._id;
                    return (
                      <div key={i} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isMine ? 'bg-primary-600 text-white rounded-br-none' : 'bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 rounded-bl-none'}`}>
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..." 
                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-zinc-950 border border-transparent focus:border-primary-500 rounded-xl outline-none text-slate-900 dark:text-white transition-all"
                  />
                  <button type="submit" disabled={!newMessage.trim()} className="p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl disabled:opacity-50 transition-colors shadow-lg shadow-primary-500/20">
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <User size={64} className="mb-4 opacity-20" />
              <p className="text-lg font-medium text-slate-600 dark:text-zinc-400">Select a student to start messaging</p>
            </div>
          )
        ) : (
          /* ANNOUNCEMENTS VIEW */
          selectedCourse ? (
            <>
              {/* Announcements Header */}
              <div className="p-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                    <img src={selectedCourse.thumbnail} alt="Cover" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Global Announcements</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">{selectedCourse.title}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAnnouncementModal(true)}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/30 transition-all hover:-translate-y-0.5"
                >
                  <Megaphone size={16} /> New Broadcast
                </button>
              </div>

              {/* Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-zinc-950/30">
                {announcements.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Megaphone size={48} className="mb-4 opacity-20" />
                    <p>No announcements yet for this course.</p>
                  </div>
                ) : (
                  announcements.map((ann, i) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className="bg-white dark:bg-zinc-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-700 relative">
                      <div className="flex items-center gap-3 mb-3">
                        <img 
                          src={ann.instructor?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(ann.instructor?.name || 'I')}&background=random`} 
                          onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(ann.instructor?.name || 'I')}&background=random`; }}
                          className="w-8 h-8 rounded-full" 
                          alt="Inst" 
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{ann.instructor?.name}</p>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1"><Clock size={10} /> {new Date(ann.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-zinc-100 mb-2">{ann.title}</h4>
                      <p className="text-slate-600 dark:text-zinc-300 text-sm whitespace-pre-wrap">{ann.content}</p>
                    </motion.div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Megaphone size={64} className="mb-4 opacity-20" />
              <p className="text-lg font-medium text-slate-600 dark:text-zinc-400">Select a course to broadcast announcements</p>
            </div>
          )
        )}
      </div>

      {/* Announcement Modal */}
      <AnimatePresence>
        {showAnnouncementModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
              onClick={() => setShowAnnouncementModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl z-50 overflow-hidden border border-slate-200 dark:border-zinc-800"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><Megaphone className="text-amber-500" /> Broadcast Announcement</h3>
                <button onClick={() => setShowAnnouncementModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><X size={24} /></button>
              </div>
              <form onSubmit={handlePostAnnouncement} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Subject / Title</label>
                  <input type="text" required value={announcementTitle} onChange={e => setAnnouncementTitle(e.target.value)} placeholder="e.g. Exam dates moved to Friday" className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Message Body</label>
                  <textarea required rows="5" value={announcementContent} onChange={e => setAnnouncementContent(e.target.value)} placeholder="Type your announcement here... This will be sent to all enrolled students." className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"></textarea>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAnnouncementModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800">Cancel</button>
                  <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-500/30">Broadcast</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InstructorMessages;
