import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const AssignmentSubmit = () => {
  const { id } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await api.get(`/assignments/course/${id}`);
        setAssignments(res.data);
      } catch (error) {
        console.error('Failed to fetch assignments', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [id]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (assignmentId) => {
    if (!file) {
      return toast.error('Please select a file to submit');
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const fileUrl = uploadRes.data.url;

      await api.post(`/assignments/${assignmentId}/submit`, { fileUrl });
      
      toast.success('Assignment submitted successfully!');
      
      const res = await api.get(`/assignments/course/${id}`);
      setAssignments(res.data);
      setFile(null);
    } catch (error) {
      toast.error('Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>;

  if (assignments.length === 0) return (
    <div className="text-center py-20">
      <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">No Assignments</h2>
      <p className="text-slate-500 dark:text-zinc-400 mt-2">There are currently no assignments for this course.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Course Assignments</h1>
      
      <div className="space-y-6">
        {assignments.map((assignment) => {
          return (
            <motion.div 
              key={assignment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-700"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{assignment.title}</h3>
                  <div className="flex flex-col gap-1 mt-1">
                    {assignment.lesson && (
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                        Lesson: {assignment.lesson.title}
                      </p>
                    )}
                    <p className="text-sm text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                      <Clock size={14} /> Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-slate-700 dark:text-zinc-300 mb-6">{assignment.description}</p>
              
              <div className="bg-slate-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-slate-100 dark:border-zinc-700">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Submit your work</h4>
                
                <div className="flex items-center gap-4">
                  <input 
                    type="file" 
                    id={`file-${assignment._id}`}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label 
                    htmlFor={`file-${assignment._id}`}
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 dark:border-zinc-600 rounded-lg text-sm font-medium text-slate-600 dark:text-zinc-400 hover:border-primary-500 hover:text-primary-600 transition-colors"
                  >
                    <Upload size={18} />
                    {file ? file.name : 'Choose File'}
                  </label>
                  
                  <button
                    onClick={() => handleSubmit(assignment._id)}
                    disabled={!file || submitting}
                    className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold shadow-md shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Uploading...' : 'Submit'}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AssignmentSubmit;
