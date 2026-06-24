import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Award, Download, Eye, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const MyCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const { data } = await api.get('/certificates/my-certificates');
        setCertificates(data);
      } catch (error) {
        toast.error('Failed to load certificates');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Award className="text-purple-600" size={32} /> My Certificates
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-2">
            View and download your earned credentials
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : certificates.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-12 text-center border border-slate-100 dark:border-zinc-700 shadow-sm">
          <div className="mx-auto w-20 h-20 bg-slate-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mb-6">
            <Award className="h-10 w-10 text-slate-400 dark:text-zinc-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            No certificates earned yet
          </h3>
          <p className="text-slate-500 dark:text-zinc-400 mb-8 max-w-md mx-auto">
            Complete a course and pass its final exam to earn a verifiable certificate of completion.
          </p>
          <Link
            to="/my-courses"
            className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium transition-colors shadow-lg shadow-primary-500/30"
          >
            Continue Learning
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {certificates.map((cert, index) => (
            <motion.div
              key={cert._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-zinc-700 hover:shadow-xl transition-shadow flex flex-col group relative"
            >
              {/* Certificate Graphic Placeholder */}
              <div className="h-40 w-full bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <Award size={100} />
                </div>
                <h4 className="text-white font-serif italic text-lg z-10 leading-tight">
                  Certificate of Completion
                </h4>
                <p className="text-white/80 text-xs mt-2 z-10 font-medium max-w-[90%] truncate">
                  {cert.course?.title}
                </p>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">
                  {cert.course?.title || 'Unknown Course'}
                </h3>
                
                <div className="flex items-center gap-2 mt-4 text-sm text-slate-500 dark:text-zinc-400">
                  <Calendar size={16} />
                  <span>Issued: {new Date(cert.issueDate || cert.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-zinc-400">
                  <span className="font-mono text-xs bg-slate-100 dark:bg-zinc-700 px-2 py-1 rounded">
                    ID: {cert.certificateId}
                  </span>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-zinc-700">
                  <Link
                    to={`/certificate/${cert.certificateId}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50 rounded-xl font-medium transition-colors"
                  >
                    <Eye size={18} /> View
                  </Link>
                  <button
                    onClick={() => {
                      // Trigger download via new window/print
                      window.open(`/certificate/${cert.certificateId}`, '_blank');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600 rounded-xl font-medium transition-colors"
                  >
                    <Download size={18} /> Print
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCertificates;
