import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { UploadCloud, Plus, Trash2, Video, FileText, ChevronRight, ChevronLeft, Save, CheckCircle2, HelpCircle } from 'lucide-react';
import api from '../services/api';

const EditCourse = () => {
  const { id } = useParams();
  const { register, handleSubmit, formState: { errors }, trigger, reset, setValue } = useForm();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  // Curriculum State
  const [lessons, setLessons] = useState([]);

  // Quiz State
  const [quizDuration, setQuizDuration] = useState(30);
  const [quizQuestions, setQuizQuestions] = useState([]);

  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  // Fetch Existing Data
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const [courseRes, quizRes] = await Promise.all([
          api.get(`/courses/${id}`),
          api.get(`/quizzes/course/${id}/instructor`).catch(() => ({ data: null }))
        ]);

        const course = courseRes.data;
        
        // Populate Step 1 Form
        reset({
          title: course.title,
          description: course.description,
          category: course.category,
          price: course.price,
          level: course.level,
        });
        setThumbnailPreview(course.thumbnail);

        // Populate Step 2 Lessons
        if (course.lessons && course.lessons.length > 0) {
          setLessons(course.lessons.map(l => ({
            _id: l._id,
            id: l._id, // fallback for UI keys
            title: l.title,
            videoUrl: l.videoUrl,
            duration: l.duration
          })));
        } else {
          setLessons([{ id: Date.now(), title: '', videoUrl: '', duration: '' }]);
        }

        // Populate Step 3 Quiz
        const quiz = quizRes.data;
        if (quiz && quiz.questions && quiz.questions.length > 0) {
          setQuizDuration(quiz.duration);
          setQuizQuestions(quiz.questions.map(q => ({
            id: q._id || Date.now() + Math.random(),
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer
          })));
        } else {
          setQuizQuestions([{ id: Date.now(), question: '', options: ['', '', '', ''], correctAnswer: '' }]);
        }

      } catch (error) {
        toast.error('Failed to load course data');
        navigate('/instructor/courses');
      } finally {
        setIsFetching(false);
      }
    };
    fetchCourseData();
  }, [id, reset, navigate]);

  // --- Curriculum Handlers ---
  const handleAddLesson = () => setLessons([...lessons, { id: Date.now(), title: '', videoUrl: '', duration: '' }]);
  const handleRemoveLesson = (identifier) => setLessons(lessons.filter(l => (l._id || l.id) !== identifier));
  const handleLessonChange = (identifier, field, value) => setLessons(lessons.map(l => (l._id || l.id) === identifier ? { ...l, [field]: value } : l));

  // --- Quiz Handlers ---
  const handleAddQuestion = () => setQuizQuestions([...quizQuestions, { id: Date.now(), question: '', options: ['', '', '', ''], correctAnswer: '' }]);
  const handleRemoveQuestion = (id) => setQuizQuestions(quizQuestions.filter(q => q.id !== id));
  const handleQuestionChange = (id, field, value) => setQuizQuestions(quizQuestions.map(q => q.id === id ? { ...q, [field]: value } : q));
  const handleOptionChange = (questionId, optionIndex, value) => {
    setQuizQuestions(quizQuestions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  // --- Navigation Handlers ---
  const handleNextStep = async () => {
    if (currentStep === 1) {
      const isStep1Valid = await trigger(['title', 'description', 'category', 'price', 'level']);
      if (isStep1Valid) {
        setIsTransitioning(true);
        setCurrentStep(2);
        setTimeout(() => setIsTransitioning(false), 500);
      }
    } else if (currentStep === 2) {
      const isValid = lessons.every(l => l.title && l.videoUrl);
      if (!isValid) {
        toast.error('Please fill in all lesson titles and URLs.');
        return;
      }
      setIsTransitioning(true);
      setCurrentStep(3);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // --- Final Submit ---
  const onSubmit = async (data) => {
    // Validate Quiz before final submission
    const isValidQuiz = quizQuestions.every(q => q.question && q.options.every(o => o) && q.correctAnswer);
    if (!isValidQuiz && quizQuestions.length > 0) {
      toast.error('Please completely fill out all quiz questions, options, and correct answers.');
      return;
    }

    setIsLoading(true);
    try {
      let thumbnailUrl = thumbnailPreview; 

      if (data.thumbnail && data.thumbnail[0]) {
        const formData = new FormData();
        formData.append('file', data.thumbnail[0]);
        const uploadRes = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
        thumbnailUrl = uploadRes.data.url;
      }
      
      const courseData = {
        title: data.title,
        description: data.description,
        category: data.category,
        price: Number(data.price),
        level: data.level,
        thumbnail: thumbnailUrl,
        lessons: lessons, 
      };

      // 1. Update Course & Lessons
      await api.put(`/courses/${id}`, courseData);

      // 2. Upsert Final Quiz (If questions exist)
      if (quizQuestions.length > 0 && quizQuestions[0].question.trim() !== '') {
        const formattedQuestions = quizQuestions.map(q => {
          const formatted = {
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer
          };
          if (typeof q.id === 'string' && q.id.length === 24) {
            formatted._id = q.id;
          }
          return formatted;
        });

        await api.post('/quizzes', {
          title: 'Final Course Certification Exam',
          courseId: id,
          duration: quizDuration,
          questions: formattedQuestions
        });
      }

      toast.success('Course & Curriculum updated successfully!');
      navigate('/instructor/courses');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update course.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // --- Step Components ---
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-10 w-full max-w-2xl mx-auto">
      {[1, 2, 3].map((step, index) => (
        <div key={step} className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold shadow-sm transition-colors duration-300 ${
            currentStep === step ? 'bg-primary-600 text-white border-2 border-primary-200 dark:border-primary-900/50' : 
            currentStep > step ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500'
          }`}>
            {currentStep > step ? <CheckCircle2 size={20} /> : step}
          </div>
          {index < 2 && (
            <div className={`w-16 sm:w-24 h-1 mx-2 rounded-full transition-colors duration-300 ${
              currentStep > step ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-zinc-800'
            }`}></div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[80vh]">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Studio Editor</h1>
        <p className="mt-2 text-slate-600 dark:text-zinc-400">Update your course metadata, refine the curriculum, and tweak the exam.</p>
      </div>

      <StepIndicator />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Basic Info */}
          {currentStep === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="bg-white dark:bg-zinc-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-700/60"
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <FileText className="text-primary-600 dark:text-primary-400" /> Basic Information
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Course Title</label>
                  <input
                    type="text"
                    {...register("title", { required: "Title is required" })}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Description</label>
                  <textarea
                    rows={4}
                    {...register("description", { required: "Description is required" })}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Category</label>
                    <select
                      {...register("category", { required: true })}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                    >
                      <option value="Web Development">Web Development</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Difficulty Level</label>
                    <select
                      {...register("level", { required: true })}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("price", { required: "Price is required", min: 0 })}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Course Cover Image</label>
                  {thumbnailPreview && (
                    <div className="mb-4">
                      <img src={thumbnailPreview} alt="Current Thumbnail" className="h-32 rounded-xl object-cover border border-slate-200 dark:border-zinc-700" />
                    </div>
                  )}
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-zinc-700 border-dashed rounded-2xl hover:border-primary-500 transition-colors cursor-pointer bg-slate-50 dark:bg-zinc-900/30">
                    <div className="space-y-2 text-center">
                      <UploadCloud className="mx-auto h-12 w-12 text-slate-400 dark:text-zinc-500" />
                      <div className="flex justify-center text-sm text-slate-600 dark:text-zinc-400">
                        <label className="relative cursor-pointer rounded-md font-bold text-primary-600 dark:text-primary-400 hover:text-primary-500 focus-within:outline-none">
                          <span>Upload a new thumbnail to replace</span>
                          <input type="file" className="sr-only" {...register("thumbnail")} accept="image/*" />
                        </label>
                      </div>
                      <p className="text-xs text-slate-500">Optional. 16:9 Ratio recommended. PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Curriculum */}
          {currentStep === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="bg-white dark:bg-zinc-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-700/60"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Video className="text-primary-600 dark:text-primary-400" /> Video Curriculum
                </h2>
                <button 
                  type="button" onClick={handleAddLesson}
                  className="flex items-center gap-2 text-sm font-bold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 px-4 py-2 rounded-xl transition-colors"
                >
                  <Plus size={16} /> Add Lesson
                </button>
              </div>

              <div className="space-y-5">
                {lessons.map((lesson, index) => {
                  const identifier = lesson._id || lesson.id;
                  return (
                    <div key={identifier} className="p-5 border border-slate-200 dark:border-zinc-700/80 rounded-2xl bg-slate-50 dark:bg-zinc-900/40 relative group">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-slate-800 dark:text-white/90 bg-white dark:bg-zinc-800 px-3 py-1 rounded-lg shadow-sm border border-slate-100 dark:border-zinc-700 text-sm">
                          Lesson {index + 1}
                        </span>
                        {lessons.length > 1 && (
                          <button type="button" onClick={() => handleRemoveLesson(identifier)} className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Lesson Title</label>
                          <input
                            type="text" value={lesson.title} onChange={(e) => handleLessonChange(identifier, 'title', e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Video URL</label>
                          <input
                            type="url" value={lesson.videoUrl} onChange={(e) => handleLessonChange(identifier, 'videoUrl', e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 3: Final Quiz */}
          {currentStep === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="bg-white dark:bg-zinc-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-700/60"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                    <HelpCircle className="text-primary-600 dark:text-primary-400" /> Final Certification Quiz
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-zinc-400">Students must pass this quiz to receive their certificate.</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button 
                    type="button" onClick={handleAddQuestion}
                    className="flex items-center gap-2 text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl shadow-md transition-colors"
                  >
                    <Plus size={16} /> Add Question
                  </button>
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-sm">
                    <span className="text-slate-600 dark:text-zinc-400 font-medium">Duration:</span>
                    <input type="number" value={quizDuration} onChange={(e) => setQuizDuration(e.target.value)} className="w-12 bg-transparent outline-none font-bold text-slate-900 dark:text-white" min="1" />
                    <span className="text-slate-600 dark:text-zinc-400 font-medium">mins</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {quizQuestions.map((q, qIndex) => (
                  <div key={q.id} className="p-6 border border-slate-200 dark:border-zinc-700/80 rounded-2xl bg-slate-50 dark:bg-zinc-900/40 relative">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-slate-800 dark:text-white/90 text-sm">Question {qIndex + 1}</span>
                      {quizQuestions.length > 1 && (
                        <button type="button" onClick={() => handleRemoveQuestion(q.id)} className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                    
                    <div className="mb-5">
                      <input
                        type="text" value={q.question} onChange={(e) => handleQuestionChange(q.id, 'question', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none font-medium"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correctAnswer === opt && opt !== ''}
                            onChange={() => handleQuestionChange(q.id, 'correctAnswer', opt)}
                            className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                            title="Mark as correct answer"
                          />
                          <input
                            type="text" value={opt} onChange={(e) => handleOptionChange(q.id, oIndex, e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors ${
                              q.correctAnswer === opt && opt !== '' 
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-900 dark:text-emerald-100' 
                              : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 focus:border-primary-500'
                            }`}
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Wizard Controls */}
        <div className="flex justify-between items-center pt-6 mt-4 border-t border-slate-200 dark:border-zinc-800">
          {currentStep > 1 ? (
            <button
              type="button" onClick={handlePrevStep}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-slate-600 dark:text-zinc-300 font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft size={20} /> Back
            </button>
          ) : <div></div>}

          {currentStep < 3 ? (
            <button
              type="button" onClick={handleNextStep}
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 shadow-lg transition-all hover:-translate-y-0.5"
            >
              Next Step <ChevronRight size={20} />
            </button>
          ) : (
            <button
              type="submit" disabled={isLoading || isTransitioning}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 disabled:opacity-70 transition-all hover:-translate-y-0.5"
            >
              {isLoading ? 'Saving...' : <><Save size={20} /> Save Changes</>}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default EditCourse;
