import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Award, Clock, CheckCircle, PlayCircle, User as UserIcon, Mail, Edit3, X, Save, MapPin, Briefcase, Code, Globe, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchCourses } from '../redux/slices/courseSlice';
import { updateProfileAsync } from '../redux/slices/authSlice';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { courses, loading } = useSelector((state) => state.courses);
  
  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    jobTitle: user?.jobTitle || '',
    location: user?.location || '',
    skills: user?.skills?.join(', ') || '',
    github: user?.socialLinks?.github || '',
    linkedin: user?.socialLinks?.linkedin || '',
    website: user?.socialLinks?.website || '',
    profilePicture: user?.profilePicture || '',
  });
  const [uploading, setUploading] = useState(false);

  // Location Autocomplete State
  const [locationResults, setLocationResults] = useState([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  // Helper to determine the correct avatar URL
  const getAvatarUrl = (url, name) => {
    const brokenUrl = 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg';
    if (!url || url === brokenUrl) {
      return `https://ui-avatars.com/api/?name=${name || 'User'}&background=0f172a&color=ffffff&bold=true`;
    }
    return url;
  };

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  // Debounced Location Search
  useEffect(() => {
    const searchLocation = async () => {
      if (profileData.location && profileData.location.length > 2 && showLocationDropdown) {
        setIsSearchingLocation(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(profileData.location)}&limit=5`);
          const data = await res.json();
          setLocationResults(data);
        } catch (error) {
          console.error('Location search failed:', error);
        } finally {
          setIsSearchingLocation(false);
        }
      } else {
        setLocationResults([]);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      searchLocation();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [profileData.location, showLocationDropdown]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    if (e.target.name === 'location') {
      setShowLocationDropdown(true);
    }
  };

  const handleLocationSelect = (locationName) => {
    setProfileData({ ...profileData, location: locationName });
    setShowLocationDropdown(false);
    setLocationResults([]);
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfileData({ ...profileData, profilePicture: data.url });
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const submitProfileHandler = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProfileAsync({
        name: profileData.name,
        bio: profileData.bio,
        jobTitle: profileData.jobTitle,
        location: profileData.location,
        skills: profileData.skills,
        profilePicture: profileData.profilePicture,
        socialLinks: {
          github: profileData.github,
          linkedin: profileData.linkedin,
          website: profileData.website,
        }
      })).unwrap();
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message || 'Profile update failed');
    }
  };

  // Derive real data from state
  const enrolledCourses = courses.filter(c => user?.enrolledCourses?.includes(c._id));

  const stats = [
    { name: 'Enrolled Courses', value: user?.enrolledCourses?.length || 0, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { name: 'Completed Courses', value: user?.passedQuizzes?.length || 0, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { name: 'Certificates Earned', value: user?.passedQuizzes?.length || 0, icon: Award, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { name: 'Hours Learned', value: '12h', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* User Profile Banner */}
      {/* User Profile Banner */}
      <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 md:p-8 mb-8 shadow-sm border border-slate-100 dark:border-zinc-700 relative">
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-zinc-700 rounded-full transition-colors"
            title="Edit Profile"
          >
            <Edit3 size={20} />
          </button>
        )}

        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.form 
              key="edit"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onSubmit={submitProfileHandler}
              className="flex flex-col gap-6 w-full"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-700 pb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Profile</h2>
                <button type="button" onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <img src={getAvatarUrl(profileData.profilePicture, profileData.name)} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-slate-100 dark:border-zinc-700" />
                    <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <Camera size={24} className="mb-1" />
                      <span className="text-xs font-semibold">Change</span>
                      <input type="file" onChange={uploadFileHandler} className="hidden" accept="image/*" />
                    </label>
                  </div>
                  {uploading && <span className="text-xs text-primary-500 animate-pulse">Uploading...</span>}
                </div>

                <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Full Name</label>
                    <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} className="w-full px-4 py-2 border border-slate-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-slate-900 dark:text-white" required />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Job Title / Headline</label>
                    <input type="text" name="jobTitle" value={profileData.jobTitle} onChange={handleProfileChange} placeholder="e.g. Full Stack Developer" className="w-full px-4 py-2 border border-slate-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-slate-900 dark:text-white" />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Bio</label>
                    <textarea name="bio" value={profileData.bio} onChange={handleProfileChange} rows="3" placeholder="Tell us about yourself..." className="w-full px-4 py-2 border border-slate-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-slate-900 dark:text-white" />
                  </div>

                  <div className="col-span-2 md:col-span-1 relative">
                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Location</label>
                    <input 
                      type="text" 
                      name="location" 
                      value={profileData.location} 
                      onChange={handleProfileChange} 
                      onFocus={() => setShowLocationDropdown(true)}
                      onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                      placeholder="City, Country" 
                      className="w-full px-4 py-2 border border-slate-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-slate-900 dark:text-white" 
                    />
                    <AnimatePresence>
                      {showLocationDropdown && (profileData.location.length > 2) && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                        >
                          {isSearchingLocation ? (
                            <div className="px-4 py-3 text-sm text-slate-500 text-center animate-pulse">Searching...</div>
                          ) : locationResults.length > 0 ? (
                            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                              {locationResults.map((result) => (
                                <li 
                                  key={result.place_id}
                                  onClick={() => handleLocationSelect(result.display_name)}
                                  className="px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-zinc-700 cursor-pointer text-slate-700 dark:text-zinc-300 transition-colors"
                                >
                                  {result.display_name}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="px-4 py-3 text-sm text-slate-500 text-center">No results found</div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Skills (comma separated)</label>
                    <input type="text" name="skills" value={profileData.skills} onChange={handleProfileChange} placeholder="React, Node.js, Python" className="w-full px-4 py-2 border border-slate-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-slate-900 dark:text-white" />
                  </div>

                  {/* Social Links */}
                  <div className="col-span-2 mt-2 pt-4 border-t border-slate-100 dark:border-zinc-700">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Social Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">GitHub URL</label>
                        <input type="text" name="github" value={profileData.github} onChange={handleProfileChange} className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700 text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">LinkedIn URL</label>
                        <input type="text" name="linkedin" value={profileData.linkedin} onChange={handleProfileChange} className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700 text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Personal Website</label>
                        <input type="text" name="website" value={profileData.website} onChange={handleProfileChange} className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700 text-slate-900 dark:text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-700">
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={uploading} className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2">
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div 
              key="view"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col md:flex-row items-center md:items-start gap-8 w-full"
            >
              <img 
                src={getAvatarUrl(user?.profilePicture, user?.name)} 
                alt={user?.name} 
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-slate-50 dark:border-zinc-700 shadow-md flex-shrink-0"
              />
              <div className="flex-1 text-center md:text-left w-full">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-3">
                  {user?.name}
                  <span className="text-xs font-medium px-2 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400 rounded-full capitalize">
                    {user?.role}
                  </span>
                </h1>
                
                {user?.jobTitle && <p className="text-lg font-medium text-slate-600 dark:text-zinc-400 mt-1">{user.jobTitle}</p>}
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 mt-3 text-sm text-slate-600 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5"><Mail size={16} /> {user?.email}</span>
                  {user?.location && <span className="flex items-center gap-1.5"><MapPin size={16} /> {user.location}</span>}
                  
                  {/* Social Links Display */}
                  <div className="flex items-center gap-3 ml-auto mr-12 md:mr-0">
                    {user?.socialLinks?.github && <a href={user.socialLinks.github} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><Code size={18} /></a>}
                    {user?.socialLinks?.linkedin && <a href={user.socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#0A66C2]"><Briefcase size={18} /></a>}
                    {user?.socialLinks?.website && <a href={user.socialLinks.website} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary-500"><Globe size={18} /></a>}
                  </div>
                </div>

                {user?.bio && <p className="mt-5 text-sm text-slate-700 dark:text-zinc-300 max-w-3xl leading-relaxed">{user.bio}</p>}
                
                {user?.skills && user.skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                    {user.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 text-xs font-medium rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-800 p-6 shadow-sm border border-slate-100 dark:border-zinc-700"
          >
            <dt>
              <div className={`absolute rounded-xl p-3 ${item.bg}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-slate-500 dark:text-zinc-400">{item.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">{item.value}</p>
            </dd>
          </motion.div>
        ))}
      </div>

      {/* Continue Learning Section */}
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Continue Learning</h2>
      
      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div></div>
      ) : enrolledCourses.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-8 text-center border border-slate-100 dark:border-zinc-700">
          <BookOpen className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No courses yet</h3>
          <p className="text-slate-500 mb-6">You haven't enrolled in any courses yet. Start your learning journey today!</p>
          <Link to="/courses" className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium transition-colors">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrolledCourses.map((course, index) => {
            const isCourseFullyCompleted = user?.completedCourses?.includes(course._id);
            const completedLessonsInCourse = isCourseFullyCompleted ? (course.lessons?.length || 0) : (course.lessons?.filter(lessonId => user?.completedLessons?.includes(lessonId)).length || 0);
            const totalLessonsInCourse = course.lessons?.length || 0;
            const progressPercentage = isCourseFullyCompleted ? 100 : totalLessonsInCourse > 0 ? Math.round((completedLessonsInCourse / totalLessonsInCourse) * 100) : 0;
            
            return (
            <motion.div 
              key={course._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="flex flex-col sm:flex-row bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-zinc-700 hover:shadow-md transition-shadow"
            >
              <div className="sm:w-48 h-48 sm:h-auto flex-shrink-0">
                <img src={course.thumbnail || course.image || 'https://via.placeholder.com/400x300'} alt={course.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-6 flex flex-col justify-center flex-grow">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{course.title}</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mb-4">{course.instructor?.name || 'Instructor'}</p>
                
                <div className="mb-2 flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-700 dark:text-zinc-300">Progress</span>
                  <span className="font-medium text-primary-600 dark:text-primary-400">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-2 mb-4">
                  <div className="bg-primary-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-xs text-slate-500 dark:text-zinc-400">{completedLessonsInCourse} / {totalLessonsInCourse} Lessons</span>
                  {progressPercentage === 100 ? (
                    <Link to={`/courses/${course._id}/learn`} className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
                      <CheckCircle size={16} /> Completed
                    </Link>
                  ) : (
                    <Link to={`/courses/${course._id}/learn`} className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
                      <PlayCircle size={16} /> Continue
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )})}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
