import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, LayoutDashboard, Search, LogOut, CheckCircle2, MapPin, Building, UploadCloud, X, FileText, AlertCircle, Calendar, Clock, Video, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { candidateService } from '../../services/candidate.service';
import { toast } from 'sonner';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Jobs State
  const [jobs, setJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  
  // Applications State
  const [applications, setApplications] = useState([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  
  // Apply Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  
  // Interviews State
  const [interviews, setInterviews] = useState([]);
  const [isLoadingInterviews, setIsLoadingInterviews] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [activeInterview, setActiveInterview] = useState(null);
  const [isSelectingSlot, setIsSelectingSlot] = useState(false);


  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const profileData = await authService.getProfile();
        setProfile(profileData?.data || profileData);
        await Promise.all([fetchJobs(), fetchApplications(), fetchInterviews()]);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
        toast.error("Session expired. Please log in again.");
        handleLogout();
      }
    };
    fetchInitialData();
  }, []);

  const fetchJobs = async () => {
    setIsLoadingJobs(true);
    try {
      const data = await candidateService.getJobs();
      // Assume array is in data.data or data directly based on conventional API response
      // Also filter out any jobs that might not be ACTIVE (assuming candidate shouldn't see CLOSED/INACTIVE)
      const allJobs = Array.isArray(data) ? data : data?.data || [];
      setJobs(allJobs);
    } catch (error) {
      toast.error('Failed to load available jobs');
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const fetchApplications = async () => {
    setIsLoadingApps(true);
    try {
      const data = await candidateService.getMyApplications();
      setApplications(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      toast.error('Failed to load your applications');
    } finally {
      setIsLoadingApps(false);
    }
  };

  const fetchInterviews = async () => {
    setIsLoadingInterviews(true);
    try {
      const data = await candidateService.getInterviews();
      setInterviews(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      toast.error('Failed to load your interviews');
    } finally {
      setIsLoadingInterviews(false);
    }
  };

  const getJobFromId = (jobId) => {
    return jobs.find(j => (j.id || j._id) === jobId) || { title: 'Connecting...', company_name: 'Loading...' };
  };

  const handleOpenApplyModal = (job) => {
    setSelectedJob(job);
    setResumeFile(null);
    setIsApplyModalOpen(true);
  };

  const handleCloseApplyModal = () => {
    setIsApplyModalOpen(false);
    setSelectedJob(null);
    setResumeFile(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Add validation maybe? (e.g., check if it's pdf/doc)
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF or DOC/DOCX file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size should not exceed 5MB.');
        return;
      }
      setResumeFile(file);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      toast.error('Please upload your resume to apply.');
      return;
    }

    setIsApplying(true);
    try {
      const jobId = selectedJob.id || selectedJob._id;
      await candidateService.applyToJob(jobId, resumeFile);
      toast.success(`Successfully applied to ${selectedJob.title}!`);
      handleCloseApplyModal();
      await fetchApplications(); // Refresh applications list
    } catch (error) {
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };

  const handleOpenSlotModal = (interview) => {
    setActiveInterview(interview);
    setSelectedSlot('');
    setIsSlotModalOpen(true);
  };

  const handleCloseSlotModal = () => {
    setIsSlotModalOpen(false);
    setActiveInterview(null);
    setSelectedSlot('');
  };

  const handleSelectSlot = async (e) => {
    e.preventDefault()

    const payload = {
      interview_date: selectedSlot.toISOString().split("T")[0],
      interview_time: selectedSlot.toTimeString().slice(0,5)
    }

    console.log(payload)
    if (!selectedSlot) {
      toast.error('Please select a preferred time slot.');
      return;
    }

    setIsSelectingSlot(true);
    try {
      await candidateService.selectSlot(activeInterview.id, selectedSlot);
      toast.success('Interview slot selected successfully!');
      handleCloseSlotModal();
      await fetchInterviews(); // Refresh list
    } catch (error) {
      toast.error(error.message || 'Failed to select slot');
    } finally {
      setIsSelectingSlot(false);
    }
  };


  const handleLogout = async () => {
    await authService.logout();
    navigate('/signin');
  };

  const getUserInitials = () => {
    if (!profile?.username) return 'CA';
    return profile.username.substring(0, 2).toUpperCase();
  };

  const minDateTime = activeInterview
  ? new Date(`${activeInterview.start_date}T${activeInterview.start_time}`)
  : null;

const maxDateTime = activeInterview
  ? new Date(`${activeInterview.end_date}T${activeInterview.end_time}`)
  : null;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">ATS Pro</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('jobs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'jobs' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Search size={18} /> Find Jobs
          </button>
          <button 
            onClick={() => setActiveTab('applications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'applications' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Briefcase size={18} /> My Applications
          </button>
          <button 
            onClick={() => setActiveTab('interviews')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'interviews' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Calendar size={18} /> My Interviews
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <header className="px-8 py-6 border-b border-slate-800 sticky top-0 bg-slate-950/80 backdrop-blur-md z-10 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            {activeTab === 'dashboard' && 'Candidate Dashboard'}
            {activeTab === 'jobs' && 'Explore Opportunities'}
            {activeTab === 'applications' && 'My Applications'}
            {activeTab === 'interviews' && 'My Interviews'}
          </h1>
          <div className="flex items-center gap-4">
            {profile && <span className="text-sm font-medium text-slate-400">Welcome, {profile.username}</span>}
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
              {getUserInitials()}
            </div>
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                  <div className="text-slate-400 text-sm font-medium mb-2">Applied Jobs</div>
                  <div className="text-3xl font-bold text-white">{applications.length}</div>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                  <div className="text-slate-400 text-sm font-medium mb-2">Shortlisted</div>
                  <div className="text-3xl font-bold text-white">{applications.filter(a => a.status === 'SHORTLISTED').length}</div>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                  <div className="text-slate-400 text-sm font-medium mb-2">Upcoming Interviews</div>
                  <div className="text-3xl font-bold text-white">{interviews.length}</div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'jobs' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-6 flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
                 <div className="relative flex-1 max-w-md">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Search className="h-5 w-5 text-slate-500" />
                   </div>
                   <input
                     type="text"
                     className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg bg-slate-950 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm transition-colors"
                     placeholder="Search for jobs..."
                   />
                 </div>
              </div>

              {isLoadingJobs ? (
                <div className="text-center py-10 text-slate-400">Loading open positions...</div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50">
                  <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">No active jobs found</h3>
                  <p className="text-slate-500">Check back later for new opportunities.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {jobs.map((job) => (
                    <motion.div 
                      key={job.id || job._id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{job.title}</h3>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-4">
                            <span className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                              <Building size={14} className="text-indigo-400" /> 
                              Company Name : {job.company_name}
                            </span>
                            <span className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                              <MapPin size={14} className="text-rose-400" /> 
                              {Array.isArray(job.location) ? job.location.join(', ') : job.location}
                            </span>
                            <span className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                              <Briefcase size={14} className="text-emerald-400" /> 
                              {job.experience} years exp.
                            </span>
                            <span className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-full border border-emerald-500/20 text-emerald-400">
                              <CheckCircle2 size={14} />
                              {job.status}
                            </span>
                          </div>
                          
                          <p className="text-slate-400 leading-relaxed mb-4">Job Description : {job.description}</p>
                          
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(job.skills) ? job.skills.map((skill, idx) => (
                              <span key={idx} className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-md text-xs font-medium">
                                {skill}
                              </span>
                            )) : (
                              <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-md text-xs font-medium">{job.skills}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="shrink-0 flex items-center md:items-end flex-col justify-center">
                           <button 
                             onClick={() => handleOpenApplyModal(job)}
                             className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-indigo-600/20 transition-all font-medium"
                           >
                             Apply Now
                           </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'applications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">Your Submissions</h2>
                <p className="text-slate-400 text-sm">Track the status of all your job applications.</p>
              </div>

              {isLoadingApps ? (
                <div className="text-center py-10 text-slate-400">Loading your applications...</div>
              ) : applications.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50">
                  <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">No applications yet</h3>
                  <p className="text-slate-500">You haven't applied to any jobs yet. Start exploring!</p>
                  <button onClick={() => setActiveTab('jobs')} className="mt-4 px-4 py-2 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors">
                    Explore Jobs
                  </button>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-800/50 border-b border-slate-800 text-sm text-slate-400">
                          <th className="px-6 py-4 font-medium">Job Title</th>
                          <th className="px-6 py-4 font-medium">Applied Date</th>
                          <th className="px-6 py-4 font-medium">Status</th>
                          <th className="px-6 py-4 font-medium text-right">Resume</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {applications.map((app) => {
                          const jobData = app.job_details || app.job || {};
                          const matchedJob = getJobFromId(jobData.id || app.job);
                          const jobTitle = jobData.title || matchedJob?.title || `Job #${jobData.id || app.job}`;
                          const companyName = jobData.company_name || matchedJob?.company_name || 'Company';
                          
                          return (
                          <tr key={app.id} className="hover:bg-slate-800/20 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-medium text-white">
                                {jobTitle}
                              </div>
                              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                <Building size={12} /> {companyName}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-300">
                              {new Date(app.applied_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                app.status === 'APPLIED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                app.status === 'SHORTLISTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                app.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                'bg-slate-800 text-slate-400 border-slate-700'
                              }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {app.resume ? (
                                <a 
                                  href={typeof app.resume === 'string' && app.resume.startsWith('http') ? app.resume : `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${app.resume}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-400 transition-colors"
                                  title="View Uploaded Resume"
                                >
                                  <div className="p-2 bg-slate-800 rounded-md group-hover:bg-indigo-500/10">
                                     <FileText size={16} />
                                  </div>
                                </a>
                              ) : (
                                <span className="text-slate-600 text-sm">No resume</span>
                              )}
                            </td>
                          </tr>
                        )})}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'interviews' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">Interview Schedules</h2>
                <p className="text-slate-400 text-sm">Review invitations and choose your preferred interview slots.</p>
              </div>

              {isLoadingInterviews ? (
                <div className="text-center py-10 text-slate-400">Loading interviews...</div>
              ) : interviews.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50">
                  <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">No interview invites yet</h3>
                  <p className="text-slate-500">Your scheduled interviews will appear here once an employer invites you.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                   {interviews.map((interview) => {
                     const appData = interview.application || interview.application_details || {};
                     const jobData = appData.job || appData.job_details || {};
                     const matchedJob = getJobFromId(jobData.id || interview.job_id);
                     
                     const jobTitle = jobData.title || matchedJob?.title || 'Job Interview';
                     const companyName = jobData.company_name || matchedJob?.company_name || 'Hiring Company';
                     
                     return (
                    <motion.div 
                      key={interview.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-sm"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                              {interview.mode === 'ONLINE' ? <Video size={20} /> : <Home size={20} />}
                            </div>
                            <div>
                               <h3 className="text-lg font-bold text-white">{jobTitle}</h3>
                               <p className="text-sm text-slate-400">{companyName}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                               <div className="flex items-center gap-2 text-slate-400">
                                 <Calendar size={14} className="text-indigo-400" />
                                 <span>{new Date(interview.start_date).toLocaleDateString()} - {new Date(interview.end_date).toLocaleDateString()}</span>
                               </div>
                               <div className="flex items-center gap-2 text-slate-400">
                                 <Clock size={14} className="text-indigo-400" />
                                 <span>{interview.start_time.substring(0, 5)} - {interview.end_time.substring(0, 5)} Daily</span>
                               </div>
                            </div>
                            <div className="space-y-2">
                               <div className="flex items-center gap-2">
                                 <span className="text-slate-400">Mode:</span>
                                 <span className={`px-2 py-0.5 rounded text-xs font-semibold ${interview.mode === 'ONLINE' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                   {interview.mode}
                                 </span>
                               </div>
                               <div className="flex items-center gap-2">
                                 <span className="text-slate-400">Status:</span>
                                 <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                   interview.status === 'SCHEDULE_PENDING' ? 'bg-amber-500/10 text-amber-400' :
                                   interview.status === 'SCHEDULED' ? 'bg-emerald-500/10 text-emerald-400' : 
                                   'bg-slate-800 text-slate-400'
                                 }`}>
                                   {interview.status.replace('_', ' ')}
                                 </span>
                               </div>
                            </div>
                          </div>

                          {interview.status === 'SCHEDULED' && interview.selected_slot && (
                            <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                               <p className="text-xs text-emerald-400 font-medium mb-1">Confirmed Time Slot:</p>
                               <div className="text-sm text-emerald-300 font-semibold flex items-center gap-2">
                                 <CheckCircle2 size={14} />
                                 {new Date(interview.selected_slot).toLocaleString(undefined, {
                                   dateStyle: 'full',
                                   timeStyle: 'short'
                                 })}
                               </div>
                               {interview.meeting_link && (
                                 <a 
                                   href={interview.meeting_link} 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="mt-2 inline-flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium border-b border-indigo-400/30 pb-0.5"
                                 >
                                    <Video size={12} /> Join Meeting
                                 </a>
                               )}
                            </div>
                          )}
                        </div>

                        <div className="shrink-0">
                          {interview.status === 'SCHEDULE_PENDING' ? (
                            <button 
                              onClick={() => handleOpenSlotModal(interview)}
                              className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                            >
                              <Calendar size={18} /> Choose Time Slot
                            </button>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-2 px-4 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-400">
                               <CheckCircle2 size={24} className="mb-1 text-emerald-500" />
                               <span className="text-xs font-medium uppercase tracking-wider text-emerald-500/80">Confirmed</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )})}
                </div>
              )}

            </motion.div>
          )}
        </div>

        {/* Slot Selection Modal */}
       <AnimatePresence>
  {isSlotModalOpen && activeInterview && (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
      >

        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">
              Choose Time Slot
            </h2>
            <p className="text-slate-400 text-sm">
              Pick a convenient time for your interview.
            </p>
          </div>

          <button
            onClick={handleCloseSlotModal}
            className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-1.5 rounded-md"
          >
            <X size={18}/>
          </button>
        </div>

        <form onSubmit={handleSelectSlot} className="p-6">

          <div className="mb-6 space-y-4">

            {/* Interview Window */}
            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-3">

              <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1">
                <span>Available Window:</span>
                <span className="text-indigo-400 uppercase tracking-tighter">
                  Employer Specified
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-200">
                <Calendar size={16} className="text-indigo-400"/>
                <span>
                  {activeInterview.start_date} to {activeInterview.end_date}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-200">
                <Clock size={16} className="text-indigo-400"/>
                <span>
                  Between {activeInterview.start_time.substring(0,5)}
                  {" "}and{" "}
                  {activeInterview.end_time.substring(0,5)}
                </span>
              </div>

            </div>


            {/* Slot Picker */}
            <div>

              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select Date & Time *
              </label>

              <div className="relative">

                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-4 w-4 text-indigo-400"/>
                </div>

                <DatePicker
                  selected={selectedSlot}
                  onChange={(date) => setSelectedSlot(date)}
                  showTimeSelect
                  timeIntervals={15}
                  dateFormat="yyyy-MM-dd HH:mm"
                  minDate={minDateTime}
                  maxDate={maxDateTime}
                  placeholderText="Select interview slot"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-lg bg-slate-950 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                />

              </div>

              <p className="mt-2 text-[11px] text-slate-500 leading-tight">
                Note: Please pick a time within the window shown above.
              </p>

            </div>

          </div>


          {/* Actions */}
          <div className="pt-2 flex flex-col-reverse md:flex-row justify-end gap-3">

            <button
              type="button"
              onClick={handleCloseSlotModal}
              className="px-5 py-2.5 rounded-lg font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-center"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSelectingSlot || !selectedSlot}
              className="px-5 py-2.5 flex justify-center items-center gap-2 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {isSelectingSlot ? (
                <>Processing...</>
              ) : (
                <>Confirm Interview</>
              )}
            </button>

          </div>

        </form>
      </motion.div>
    </div>
  )}
</AnimatePresence>

        {/* Apply Job Modal */}

        <AnimatePresence>
          {isApplyModalOpen && selectedJob && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
              >
                <div className="sticky top-0 bg-slate-800/50 border-b border-slate-800 p-6 flex justify-between items-start z-10">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Apply for Role</h2>
                    <p className="text-slate-400 text-sm">{selectedJob.title}</p>
                  </div>
                  <button onClick={handleCloseApplyModal} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-1.5 rounded-md">
                    <X size={18} />
                  </button>
                </div>
                
                <form onSubmit={handleApply} className="p-6">
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-3">Upload your Resume *</label>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                    />
                    
                    {!resumeFile ? (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-500 hover:bg-slate-800/50 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                          <UploadCloud size={24} className="text-slate-400 group-hover:text-indigo-400" />
                        </div>
                        <p className="text-sm text-slate-300 font-medium mb-1">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-500">PDF, DOC, DOCX up to 5MB</p>
                      </div>
                    ) : (
                      <div className="w-full border border-indigo-500/30 bg-indigo-500/5 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg shrink-0">
                            <FileText size={20} />
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-medium text-slate-200 truncate">{resumeFile.name}</p>
                            <p className="text-xs text-slate-500">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setResumeFile(null)}
                          className="shrink-0 p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg mb-6">
                    <p className="text-xs text-slate-400 flex items-start gap-2">
                       <AlertCircle size={14} className="text-slate-500 shrink-0 mt-0.5" />
                       Make sure your resume is up to date and highlights the skills relevant to this specific role.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col-reverse md:flex-row justify-end gap-3">
                    <button 
                      type="button" 
                      onClick={handleCloseApplyModal}
                      className="px-5 py-2.5 rounded-lg font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-center"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isApplying || !resumeFile}
                      className="px-5 py-2.5 flex justify-center items-center gap-2 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isApplying ? (
                        <>Uploading...</>
                      ) : (
                        <>Submit Application</>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
};

export default CandidateDashboard;
