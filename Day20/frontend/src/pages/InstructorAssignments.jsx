import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCheck, FileText, Upload, CheckCircle2, X, Send, Plus, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const InstructorAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseLessons, setCourseLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isGrading, setIsGrading] = useState(false);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editorData, setEditorData] = useState({
    id: null,
    title: '',
    description: '',
    dueDate: '',
    courseId: '',
    lessonId: ''
  });

  useEffect(() => {
    fetchAssignments();
    fetchCourses();
  }, []);

  // Fetch lessons when courseId changes
  useEffect(() => {
    if (editorData.courseId) {
      const fetchCourseDetails = async () => {
        try {
          const res = await api.get(`/courses/${editorData.courseId}`);
          setCourseLessons(res.data.lessons || []);
        } catch (error) {
          console.error('Failed to fetch course lessons', error);
        }
      };
      fetchCourseDetails();
    } else {
      setCourseLessons([]);
    }
  }, [editorData.courseId]);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/assignments/instructor');
      setAssignments(res.data);
    } catch (error) {
      console.error('Failed to fetch assignments', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      const myCourses = res.data.filter(c => c.instructor?._id || c.instructor); 
      setCourses(myCourses);
    } catch (error) {
      console.error(error);
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setEditorData({ id: null, title: '', description: '', dueDate: '', courseId: '', lessonId: '' });
    setIsEditorOpen(true);
  };

  const openEditModal = (assignment) => {
    setIsEditing(true);
    setEditorData({
      id: assignment._id,
      title: assignment.title,
      description: assignment.description,
      dueDate: new Date(assignment.dueDate).toISOString().slice(0, 16),
      courseId: assignment.course?._id || '',
      lessonId: assignment.lesson?._id || ''
    });
    setIsEditorOpen(true);
    setActiveDropdown(null);
  };

  const closeEditorModal = () => {
    setIsEditorOpen(false);
  };

  const saveAssignment = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isEditing) {
        await api.put(`/assignments/${editorData.id}`, editorData);
        toast.success('Assignment updated!');
      } else {
        await api.post('/assignments', editorData);
        toast.success('Assignment created!');
      }
      closeEditorModal();
      fetchAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save assignment');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAssignment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await api.delete(`/assignments/${id}`);
      toast.success('Assignment deleted!');
      fetchAssignments();
    } catch (error) {
      toast.error('Failed to delete assignment');
    }
  };

  const openGradingModal = (assignmentId, submission) => {
    setSelectedAssignmentId(assignmentId);
    setSelectedSubmission(submission);
    setMarks(submission.marks || '');
    setFeedback(submission.feedback || '');
  };

  const closeGradingModal = () => {
    setSelectedSubmission(null);
    setSelectedAssignmentId(null);
    setMarks('');
    setFeedback('');
  };

  const submitGrade = async (e) => {
    e.preventDefault();
    if (!marks) return toast.error('Please assign a grade');
    
    setIsGrading(true);
    try {
      await api.put(`/assignments/${selectedAssignmentId}/grade/${selectedSubmission._id}`, {
        marks: Number(marks),
        feedback
      });
      toast.success('Assignment graded successfully!');
      closeGradingModal();
      fetchAssignments();
    } catch (error) {
      toast.error('Failed to submit grade');
    } finally {
      setIsGrading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-4 relative">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <FileCheck className="text-primary-600 dark:text-primary-500" size={32} />
            Assignment Hub
          </h1>
          <p className="mt-2 text-slate-500 dark:text-zinc-400">Create assignments, review submissions, and provide feedback.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5"
        >
          <Plus size={20} /> Create Assignment
        </button>
      </div>

      <div className="space-y-8">
        {assignments.length === 0 ? (
          <div className="bg-white dark:bg-zinc-800 rounded-3xl p-12 text-center border border-slate-100 dark:border-zinc-800 shadow-sm">
            <FileText className="mx-auto h-16 w-16 text-slate-300 dark:text-zinc-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Assignments Created</h3>
            <p className="text-slate-500 dark:text-zinc-400 mb-6">You haven't created any assignments yet.</p>
            <button onClick={openCreateModal} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors">
              Create Your First Assignment
            </button>
          </div>
        ) : (
          assignments.map((assignment) => {
            const totalSubmissions = assignment.submissions?.length || 0;
            const gradedSubmissions = assignment.submissions?.filter(s => s.status === 'Graded').length || 0;
            const pendingReviews = totalSubmissions - gradedSubmissions;

            return (
              <motion.div 
                key={assignment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-800/80 backdrop-blur-md rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-700/60 overflow-visible"
              >
                <div className="p-6 border-b border-slate-100 dark:border-zinc-700/60 bg-slate-50/50 dark:bg-zinc-900/30 flex justify-between items-center flex-wrap gap-4 relative">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{assignment.title}</h2>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 flex flex-col gap-1">
                      <span>Course: <span className="font-semibold text-primary-600 dark:text-primary-400">{assignment.course?.title}</span></span>
                      {assignment.lesson && (
                        <span>Lesson: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{assignment.lesson.title}</span></span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-4">
                      <div className="bg-white dark:bg-zinc-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 shadow-sm text-center">
                        <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Submissions</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{totalSubmissions}</p>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-xl border border-amber-200 dark:border-amber-700/30 shadow-sm text-center">
                        <p className="text-xs text-amber-600 dark:text-amber-500 font-medium">Pending Review</p>
                        <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{pendingReviews}</p>
                      </div>
                    </div>

                    <div className="relative">
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === assignment._id ? null : assignment._id)}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                      >
                        <MoreVertical size={20} className="text-slate-500 dark:text-zinc-400" />
                      </button>

                      {activeDropdown === assignment._id && (
                        <div className="absolute right-0 top-10 w-48 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-slate-100 dark:border-zinc-700 overflow-hidden z-20 origin-top-right">
                          <div className="py-1">
                            <button onClick={() => openEditModal(assignment)} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-colors">
                              <Edit size={16} className="text-amber-500" /> Edit Assignment
                            </button>
                            <div className="h-px bg-slate-100 dark:bg-zinc-700 my-1"></div>
                            <button onClick={() => deleteAssignment(assignment._id)} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                              <Trash2 size={16} /> Delete Assignment
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {totalSubmissions === 0 ? (
                    <p className="text-center text-slate-500 dark:text-zinc-400 py-4 font-medium text-sm">No students have submitted this assignment yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {assignment.submissions.map((submission) => (
                        <div key={submission._id} className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 relative group transition-all hover:border-primary-300 dark:hover:border-primary-700/50 hover:shadow-md">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <img src={submission.student?.profilePicture || `https://ui-avatars.com/api/?name=${submission.student?.name || 'S'}`} className="w-8 h-8 rounded-full" alt="Student" />
                              <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{submission.student?.name}</p>
                                <p className="text-xs text-slate-500 dark:text-zinc-400">{new Date(submission.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            {submission.status === 'Graded' ? (
                              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md">
                                <CheckCircle2 size={12} /> Graded: {submission.marks}
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md">
                                Needs Review
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-4">
                            <a href={submission.fileUrl} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 py-2 rounded-lg transition-colors">
                              <FileText size={14} /> View File
                            </a>
                            <button 
                              onClick={() => openGradingModal(assignment._id, submission)}
                              className={`flex-1 flex items-center justify-center gap-2 text-xs font-semibold text-white py-2 rounded-lg transition-colors shadow-sm ${submission.status === 'Graded' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-primary-600 hover:bg-primary-700'}`}
                            >
                              {submission.status === 'Graded' ? 'Update Grade' : 'Grade Now'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      <AnimatePresence>
        {isEditorOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeEditorModal}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl z-50 border border-slate-200 dark:border-zinc-800 overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {isEditing ? <Edit size={20} className="text-amber-500"/> : <Plus size={20} className="text-primary-500" />}
                  {isEditing ? 'Edit Assignment' : 'Create Assignment'}
                </h3>
                <button onClick={closeEditorModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={saveAssignment} className="p-6 space-y-5">
                
                {!isEditing && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Select Course</label>
                    <select
                      value={editorData.courseId} onChange={(e) => setEditorData({...editorData, courseId: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                      required
                    >
                      <option value="">-- Choose a Course --</option>
                      {courses.map(c => (
                        <option key={c._id} value={c._id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                )}

                {editorData.courseId && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Select Lesson (Optional)</label>
                    <select
                      value={editorData.lessonId} onChange={(e) => setEditorData({...editorData, lessonId: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="">-- No specific lesson (Course-wide) --</option>
                      {courseLessons.map(l => (
                        <option key={l._id} value={l._id}>{l.title}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Assignment Title</label>
                  <input
                    type="text" value={editorData.title} onChange={(e) => setEditorData({...editorData, title: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="e.g. Build a React Calculator" required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Description / Instructions</label>
                  <textarea
                    rows={4} value={editorData.description} onChange={(e) => setEditorData({...editorData, description: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Describe the assignment requirements..." required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Due Date</label>
                  <input
                    type="datetime-local" value={editorData.dueDate} onChange={(e) => setEditorData({...editorData, dueDate: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={closeEditorModal} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-70">
                    {isSaving ? 'Saving...' : <><Send size={18} /> {isEditing ? 'Save Changes' : 'Create Assignment'}</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedSubmission && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeGradingModal}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl z-50 border border-slate-200 dark:border-zinc-800 overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Grade Submission</h3>
                <button onClick={closeGradingModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={submitGrade} className="p-6 space-y-5">
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl">
                  <img src={selectedSubmission.student?.profilePicture || `https://ui-avatars.com/api/?name=${selectedSubmission.student?.name || 'S'}`} className="w-12 h-12 rounded-full border-2 border-white dark:border-zinc-700 shadow-sm" alt="Student" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{selectedSubmission.student?.name}</p>
                    <a href={selectedSubmission.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 mt-1">
                      <FileText size={12} /> Review Submission File
                    </a>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Assign Grade / Score</label>
                  <input
                    type="number" value={marks} onChange={(e) => setMarks(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-lg font-bold"
                    placeholder="e.g. 95" required min="0" max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Instructor Feedback (Optional)</label>
                  <textarea
                    rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Provide constructive feedback for the student..."
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={closeGradingModal} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isGrading} className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-70">
                    {isGrading ? 'Saving...' : <><Send size={18} /> Submit Grade</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InstructorAssignments;
