import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, Award } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const CertificateView = () => {
  const { certId } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef(null);

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const res = await api.get(`/certificates/${certId}`);
        setCert(res.data);
      } catch (error) {
        toast.error('Invalid Certificate ID');
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
  }, [certId]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>;
  if (!cert) return <div className="text-center py-20 text-red-500 font-bold text-2xl">Certificate Not Found</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col items-center">
      <div className="mb-8 flex gap-4 no-print">
        <button 
          onClick={() => window.print()} 
          className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold shadow-md transition-colors"
        >
          Print / Save as PDF
        </button>
      </div>

      <motion.div 
        ref={printRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full aspect-[1.414/1] max-w-4xl bg-white border-[16px] border-double border-slate-200 p-12 relative shadow-2xl flex flex-col items-center text-center print:shadow-none print:border-8 print:w-[1000px] print:h-[707px]"
        style={{
          backgroundImage: 'radial-gradient(circle at center, #ffffff 0%, #f8fafc 100%)'
        }}
      >
        <div className="absolute top-12 left-12 opacity-10">
          <Award size={120} className="text-primary-500" />
        </div>
        <div className="absolute bottom-12 right-12 opacity-10">
          <Award size={120} className="text-primary-500" />
        </div>

        <h1 className="text-5xl font-serif text-slate-900 tracking-widest mt-10 mb-2 uppercase">Certificate</h1>
        <h2 className="text-2xl font-serif text-primary-600 tracking-widest mb-12 uppercase">of Completion</h2>

        <p className="text-lg text-slate-500 mb-4 italic">This is to certify that</p>
        <h3 className="text-4xl font-bold text-slate-900 border-b-2 border-slate-300 pb-2 mb-6 w-3/4 max-w-lg">
          {cert.student?.name || 'Student Name'}
        </h3>

        <p className="text-lg text-slate-500 mb-4 italic">has successfully completed the course</p>
        <h4 className="text-3xl font-bold text-primary-700 mb-12">
          {cert.course?.title || 'Course Title'}
        </h4>

        <div className="flex justify-between w-full mt-auto pt-10 px-10">
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-slate-800 border-b border-slate-400 pb-1 w-40 text-center">{cert.instructorName}</span>
            <span className="text-sm text-slate-500 mt-2 uppercase tracking-wider">Instructor</span>
          </div>

          <div className="flex flex-col items-center">
            <Award size={64} className="text-amber-400 mb-2" />
            <span className="text-xs font-mono text-slate-400">ID: {cert.certificateId}</span>
            <span className="text-xs font-mono text-slate-400 mt-1">Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-slate-800 border-b border-slate-400 pb-1 w-40 text-center">LMS Pro Inc.</span>
            <span className="text-sm text-slate-500 mt-2 uppercase tracking-wider">Platform</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CertificateView;
