import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, ChevronRight, Check } from 'lucide-react';
import api from '../services/api';

const QuizAttempt = () => {
  const { id } = useParams(); // course ID
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/quizzes/course/${id}`);
        setQuiz(res.data);
      } catch (error) {
        console.error('Failed to fetch quiz', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const handleSelectOption = (questionId, option) => {
    if (results) return; // Prevent changing answers after submission
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      if (!window.confirm('You have unanswered questions. Are you sure you want to submit?')) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/quizzes/${quiz._id}/submit`, { answers });
      setResults(res.data);
    } catch (error) {
      console.error('Failed to submit quiz', error);
      alert('Error submitting quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>;
  
  if (!quiz) return (
    <div className="max-w-3xl mx-auto py-20 text-center">
      <AlertCircle className="mx-auto h-12 w-12 text-slate-400 mb-4" />
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">No Quiz Available</h2>
      <p className="text-slate-500 dark:text-zinc-400 mt-2">This course does not have a quiz set up yet.</p>
      <button onClick={() => navigate(`/courses/${id}/learn`)} className="mt-6 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Back to Course</button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 border-b border-slate-200 dark:border-zinc-700 pb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{quiz.title}</h1>
        <p className="text-slate-500 dark:text-zinc-400 mt-2">Duration: {quiz.duration} minutes • {quiz.questions.length} Questions</p>
      </div>

      {results && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 mb-8 rounded-2xl border ${results.passed ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'}`}
        >
          <div className="flex items-center gap-4">
            {results.passed ? <CheckCircle className="h-10 w-10 text-emerald-500" /> : <XCircle className="h-10 w-10 text-red-500" />}
            <div>
              <h2 className={`text-xl font-bold ${results.passed ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-800 dark:text-red-300'}`}>
                {results.passed ? 'Congratulations! You passed.' : 'You did not pass. Try again!'}
              </h2>
              <p className="text-sm font-medium mt-1">Score: {results.score} / {results.total} ({results.percentage.toFixed(0)}%)</p>
            </div>
            <button onClick={() => navigate(`/courses/${id}/learn`)} className="ml-auto px-4 py-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm font-medium hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors">
              Return to Course
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-8">
        {quiz.questions.map((q, index) => {
          const result = results?.results.find(r => r.questionId === q._id);
          
          return (
            <motion.div 
              key={q._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-700"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                <span className="text-primary-600 dark:text-primary-400 mr-2">{index + 1}.</span> 
                {q.question}
              </h3>
              
              <div className="space-y-3">
                {q.options.map((option) => {
                  const isSelected = answers[q._id] === option;
                  let optionClass = "border-slate-200 dark:border-zinc-700 hover:border-primary-400";
                  let icon = null;

                  if (results && result) {
                    // It's graded
                    if (option === result.correctAnswer) {
                      optionClass = "bg-emerald-50 border-emerald-500 dark:bg-emerald-900/30 dark:border-emerald-500 text-emerald-900 dark:text-emerald-100";
                      icon = <CheckCircle size={18} className="text-emerald-500" />;
                    } else if (isSelected && !result.isCorrect) {
                      optionClass = "bg-red-50 border-red-500 dark:bg-red-900/30 dark:border-red-500 text-red-900 dark:text-red-100";
                      icon = <XCircle size={18} className="text-red-500" />;
                    } else {
                      optionClass = "opacity-50 border-slate-200 dark:border-zinc-700";
                    }
                  } else if (isSelected) {
                    optionClass = "bg-primary-50 border-primary-500 dark:bg-primary-900/30 dark:border-primary-500";
                    icon = <Check size={18} className="text-primary-600 dark:text-primary-400" />;
                  }

                  return (
                    <button
                      key={option}
                      onClick={() => handleSelectOption(q._id, option)}
                      disabled={!!results}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${optionClass}`}
                    >
                      <span className="font-medium text-slate-700 dark:text-zinc-300">{option}</span>
                      {icon && <span>{icon}</span>}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {!results && (
        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 transition-transform hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
          >
            {submitting ? 'Submitting...' : 'Submit Answers'} <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizAttempt;
