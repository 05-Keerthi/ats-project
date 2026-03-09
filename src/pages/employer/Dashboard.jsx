import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Users, LayoutDashboard, LogOut, Plus, X, Building, MapPin, Trash2, Edit, ChevronLeft, FileText, Clock, CheckCircle, XCircle, Eye, CalendarClock, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { employerService } from '../../services/employer.service';
import { toast } from 'sonner';
import ConfirmModal from '../../components/shared/ConfirmModal';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [jobs, setJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  // Interview state
  const [allInterviews, setAllInterviews] = useState([]);
  const [isLoadingInterviews, setIsLoadingInterviews] = useState(false);
  
  // Job Creation / Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [newJob, setNewJob] = useState({
    title: '',
    company_name: '',
    description: '',
    skills: '', // Will split by comma
    location: '', // Will split by comma
    experience: 0,
    status: 'ACTIVE'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Applicants State
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);

  // Delete Confirmation State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, jobId: null });

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const profileData = await authService.getProfile();
        setProfile(profileData?.data || profileData);
        await Promise.all([fetchJobs(), fetchInterviews()]);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
        toast.error("Session expired. Please log in again.");
        // handleLogout(); // Assuming handleLogout is defined elsewhere or will be added
      }
    };
    fetchInitialData();
  }, []);

  const fetchJobs = async () => {
    setIsLoadingJobs(true);
    try {
      const data = await employerService.getJobs();
      setJobs(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const getJobDetail = (jobId) => {
    const job = jobs.find(j => (j.id || j._id) === jobId);
    return job || { title: 'Unknown Position', company_name: 'Unknown Company' };
  };

  const fetchInterviews = async () => {
    setIsLoadingInterviews(true);
    try {
      const data = await employerService.getScheduledInterviews();
      setAllInterviews(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      toast.error("Failed to fetch interviews");
    } finally {
      setIsLoadingInterviews(false);
    }
  };

  const handleSelectJob = async (job) => {
    setSelectedJob(job);
    setIsLoadingApplicants(true);
    try {
      const data = await employerService.getJobApplications(job.id || job._id);
      setApplicants(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      toast.error('Failed to load applicants');
      setApplicants([]);
    } finally {
      setIsLoadingApplicants(false);
    }
  };

  const handleBackToJobs = () => {
    setSelectedJob(null);
    setApplicants([]);
  };

  const STATUS_OPTIONS = [
    { value: 'APPLIED',              label: 'Applied',              color: 'blue' },
    { value: 'REVIEWING',            label: 'Reviewing',            color: 'yellow' },
    { value: 'SHORTLISTED',          label: 'Shortlisted',          color: 'purple' },
    { value: 'INTERVIEW_SCHEDULED',  label: 'Interview Scheduled',  color: 'indigo' },
    { value: 'SELECTED',             label: 'Selected',             color: 'emerald' },
    { value: 'REJECTED',             label: 'Rejected',             color: 'red' },
  ];

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPLIED':             return <Clock size={14} className="text-blue-400" />;
      case 'REVIEWING':           return <Eye size={14} className="text-yellow-400" />;
      case 'SHORTLISTED':         return <CheckCircle size={14} className="text-purple-400" />;
      case 'INTERVIEW_SCHEDULED': return <Clock size={14} className="text-indigo-400" />;
      case 'SELECTED':            return <CheckCircle size={14} className="text-emerald-400" />;
      case 'REJECTED':            return <XCircle size={14} className="text-red-400" />;
      default:                    return <Clock size={14} className="text-slate-400" />;
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPLIED':             return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'REVIEWING':           return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'SHORTLISTED':         return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'INTERVIEW_SCHEDULED': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'SELECTED':            return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'REJECTED':            return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:                    return 'bg-slate-800 text-slate-400';
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    // Optimistic update
    setApplicants(prev =>
      prev.map(app => app.id === applicationId ? { ...app, status: newStatus } : app)
    );
    try {
      await employerService.updateApplicationStatus(applicationId, newStatus);
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      toast.error('Failed to update status. Please try again.');
      // Re-fetch to restore accurate state on failure
      if (selectedJob) {
        const data = await employerService.getJobApplications(selectedJob.id || selectedJob._id);
        setApplicants(Array.isArray(data) ? data : data?.data || []);
      }
    }
  };

  // ── Interview Scheduling State ──────────────────────────────────────────
  const [intJobSelected, setIntJobSelected] = useState(null);
  const [intApplicants, setIntApplicants]   = useState([]);
  const [isLoadingInt, setIsLoadingInt]     = useState(false);
  const [schedModal, setSchedModal]         = useState({ isOpen: false, application: null });
  const [schedForm, setSchedForm]           = useState({
    mode: 'ONLINE',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
  });
  const [isScheduling, setIsScheduling]     = useState(false);

  const handleIntJobSelect = async (job) => {
    setIntJobSelected(job);
    setIsLoadingInt(true);
    try {
      const data = await employerService.getJobApplications(job.id || job._id);
      const allApps = Array.isArray(data) ? data : data?.data || [];
      // Show only shortlisted + interview_scheduled candidates
      setIntApplicants(allApps.filter(a =>
        ['SHORTLISTED', 'INTERVIEW_SCHEDULED'].includes(a.status?.toUpperCase())
      ));
    } catch {
      toast.error('Failed to load applicants');
      setIntApplicants([]);
    } finally {
      setIsLoadingInt(false);
    }
  };

  const openSchedModal = (app) => {
    setSchedForm({ mode: 'ONLINE', start_date: '', end_date: '', start_time: '', end_time: '' });
    setSchedModal({ isOpen: true, application: app });
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setIsScheduling(true);
    try {
      // 1. Create the interview schedule
      await employerService.scheduleInterview({
        application: schedModal.application.id,
        mode: schedForm.mode,
        start_date: schedForm.start_date,
        end_date: schedForm.end_date,
        start_time: schedForm.start_time + ':00',
        end_time: schedForm.end_time + ':00',
      });

      // 2. Auto-update candidate status → INTERVIEW_SCHEDULED
      try {
        await employerService.updateApplicationStatus(
          schedModal.application.id,
          'INTERVIEW_SCHEDULED'
        );
      } catch {
        // status update failure is non-critical, don't block the flow
      }

      toast.success('Interview scheduled! The candidate will receive an email to pick their slot.');
      setSchedModal({ isOpen: false, application: null });
      // Refresh the shortlisted list
      if (intJobSelected) await handleIntJobSelect(intJobSelected);
    } catch (error) {
      const msg = typeof error === 'string' ? error : error?.detail || 'Failed to schedule interview';
      toast.error(msg);
    } finally {
      setIsScheduling(false);
    }
  };


  const handleOpenCreateModal = () => {
    setNewJob({ title: '', company_name: '', description: '', skills: '', location: '', experience: 0, status: 'ACTIVE' });
    setIsEditMode(false);
    setEditingJobId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job) => {
    const formatArray = (arr) => Array.isArray(arr) ? arr.join(', ') : arr;
    setNewJob({
      title: job.title || '',
      company_name: job.company_name || '',
      description: job.description || '',
      skills: formatArray(job.skills) || '',
      location: formatArray(job.location) || '',
      experience: job.experience || 0,
      status: job.status || 'ACTIVE'
    });
    setIsEditMode(true);
    setEditingJobId(job.id || job._id);
    setIsModalOpen(true);
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...newJob,
        skills: typeof newJob.skills === 'string' ? newJob.skills.split(',').map(s => s.trim()).filter(Boolean) : newJob.skills,
        location: typeof newJob.location === 'string' ? newJob.location.split(',').map(l => l.trim()).filter(Boolean) : newJob.location,
        experience: Number(newJob.experience)
      };
      
      if (isEditMode) {
        await employerService.updateJob(editingJobId, payload);
        toast.success('Job updated successfully!');
      } else {
        await employerService.createJob(payload);
        toast.success('Job created successfully!');
      }

      setIsModalOpen(false);
      await fetchJobs();
    } catch (error) {
      toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} job`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteJob = async () => {
    if (!deleteModal.jobId) return;
    try {
      await employerService.deleteJob(deleteModal.jobId);
      toast.success("Job deleted successfully!");
      setDeleteModal({ isOpen: false, jobId: null });
      await fetchJobs();
    } catch (error) {
      toast.error(error.message || "Failed to delete job");
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/signin');
  };

  const getUserInitials = () => {
    if (!profile?.username) return 'EM';
    return profile.username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg">
            <Building className="w-5 h-5 text-white" />
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
            <Briefcase size={18} /> Job Postings
          </button>
          <button 
            onClick={() => setActiveTab('applicants')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'applicants' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Users size={18} /> Manage Applicants
          </button>
          <button 
            onClick={() => { setIntJobSelected(null); setIntApplicants([]); setActiveTab('interviews'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'interviews' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <CalendarClock size={18} /> Schedule Interviews
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
            {activeTab === 'dashboard' && 'Employer Dashboard'}
            {activeTab === 'jobs' && 'Job Postings'}
            {activeTab === 'applicants' && 'Applicants'}
            {activeTab === 'interviews' && 'Schedule Interviews'}
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
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-sm font-medium mb-2">Active Jobs</div>
                  <div className="text-3xl font-bold text-white">{jobs.length}</div>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-sm font-medium mb-2">Total Applicants</div>
                  <div className="text-3xl font-bold text-white">0</div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'jobs' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Your Postings</h2>
                <button 
                  onClick={handleOpenCreateModal}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm shadow-lg shadow-indigo-600/20"
                >
                  <Plus size={16} /> Create Job
                </button>
              </div>

              {isLoadingJobs ? (
                <div className="text-center py-10 text-slate-400">Loading jobs...</div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50">
                  <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">No jobs posted yet</h3>
                  <p className="text-slate-500">Create your first job posting to start receiving applications.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {jobs.map((job) => (
                    <motion.div 
                      key={job.id || job._id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                          {job.company_name && (
                            <p className="text-sm text-indigo-400 font-medium mt-0.5 flex items-center gap-1"><Building size={13} /> {job.company_name}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-slate-400 mt-2">
                            <span className="flex items-center gap-1"><MapPin size={14} /> {Array.isArray(job.location) ? job.location.join(', ') : job.location}</span>
                            <span className="flex items-center gap-1"><Briefcase size={14} /> {job.experience} years exp</span>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${job.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : job.status === 'INACTIVE' ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                          {job.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mb-4 line-clamp-2">{job.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {Array.isArray(job.skills) ? job.skills.map((skill, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded text-xs">
                            {skill}
                          </span>
                        )) : (
                          <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded text-xs">{job.skills}</span>
                        )}
                      </div>

                      <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                        <button 
                          onClick={() => handleOpenEditModal(job)}
                          className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                        >
                          <Edit size={14} /> Edit
                        </button>
                        <button 
                          onClick={() => setDeleteModal({ isOpen: true, jobId: job.id || job._id })} 
                          className="text-sm text-red-400 hover:text-red-300 font-medium flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'applicants' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {!selectedJob ? (
                /* ── Job List View ── */
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-white">Select a Job to View Applicants</h2>
                    <p className="text-sm text-slate-400 mt-1">Click on any job posting to see who has applied.</p>
                  </div>

                  {isLoadingJobs ? (
                    <div className="text-center py-10 text-slate-400">Loading jobs...</div>
                  ) : jobs.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50">
                      <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-300 mb-2">No jobs posted yet</h3>
                      <p className="text-slate-500">Post a job first to start receiving applications.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {jobs.map((job) => (
                        <motion.button
                          key={job.id || job._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => handleSelectJob(job)}
                          className="text-left p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/60 transition-all group"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">{job.title}</h3>
                              {job.company_name && (
                                <p className="text-sm text-indigo-400 mt-0.5 flex items-center gap-1">
                                  <Building size={13} /> {job.company_name}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                                <span className="flex items-center gap-1"><MapPin size={12} /> {Array.isArray(job.location) ? job.location.join(', ') : job.location}</span>
                                <span className="flex items-center gap-1"><Briefcase size={12} /> {job.experience} yrs</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 ml-4 shrink-0">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                job.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' :
                                job.status === 'INACTIVE' ? 'bg-red-500/10 text-red-400' :
                                'bg-slate-800 text-slate-400'
                              }`}>{job.status}</span>
                              <span className="flex items-center gap-1 text-xs text-slate-300 bg-slate-800 px-2.5 py-1 rounded-full">
                                <Users size={12} /> View Applicants
                              </span>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* ── Applicant Detail View ── */
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      onClick={handleBackToJobs}
                      className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      <ChevronLeft size={16} /> Back to Jobs
                    </button>
                    <div className="h-4 w-px bg-slate-700" />
                    <div>
                      <h2 className="text-xl font-semibold text-white">{selectedJob.title}</h2>
                      {selectedJob.company_name && (
                        <p className="text-sm text-indigo-400 flex items-center gap-1 mt-0.5">
                          <Building size={13} /> {selectedJob.company_name}
                        </p>
                      )}
                    </div>
                    <span className="ml-auto px-3 py-1.5 rounded-full bg-indigo-600/15 text-indigo-300 text-sm font-semibold border border-indigo-500/20">
                      {applicants.length} Applicant{applicants.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {isLoadingApplicants ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mr-3" />
                      <span className="text-slate-400">Loading applicants...</span>
                    </div>
                  ) : applicants.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50">
                      <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-300 mb-2">No applications yet</h3>
                      <p className="text-slate-500">No one has applied for this job. Share the posting to attract candidates.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applicants.map((app, idx) => {
                        const candidate = app.candidate_details || {};
                        return (
                          <motion.div
                            key={app.id || idx}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              {/* Candidate Info */}
                              <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                  {candidate.username ? candidate.username.substring(0, 2).toUpperCase() : 'CA'}
                                </div>
                                <div>
                                  <p className="text-white font-semibold text-sm">{candidate.username || `Applicant #${app.candidate}`}</p>
                                  <p className="text-slate-400 text-xs mt-0.5">{candidate.email || '—'}</p>
                                  <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                                    <Clock size={11} />
                                    Applied {app.applied_at ? new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                  </p>
                                </div>
                              </div>

                              {/* Status Updater + Resume */}
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
                                {/* Current Status Badge */}
                                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusStyle(app.status)}`}>
                                  {getStatusIcon(app.status)}
                                  {app.status?.replace('_', ' ') || 'APPLIED'}
                                </span>

                                {/* Status Dropdown */}
                                <div className="flex items-center gap-2">
                                  <select
                                    value={app.status || 'APPLIED'}
                                    onChange={e => {
                                      const newStatus = e.target.value;
                                      if (newStatus !== app.status) {
                                        handleStatusUpdate(app.id, newStatus);
                                      }
                                    }}
                                    className="text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                  >
                                    {STATUS_OPTIONS.map(opt => (
                                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                  </select>
                                </div>

                                {/* Resume Link */}
                                {app.resume ? (
                                  <a
                                    href={app.resume}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
                                  >
                                    <FileText size={13} /> View Resume
                                  </a>
                                ) : (
                                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 text-slate-500 text-xs">
                                    <FileText size={13} /> No Resume
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ── INTERVIEWS TAB ─────────────────────────────────────── */}
          {activeTab === 'interviews' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {!intJobSelected ? (
                /* Initial View: Job Selection + Upcoming Interviews */
                <>
                  {/* Upcoming Interviews Section */}
                  <div className="mb-10">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Clock size={22} className="text-indigo-400" /> Upcoming Interviews
                    </h2>
                    {isLoadingInterviews ? (
                      <div className="py-8 text-center text-slate-500">Loading interviews...</div>
                    ) : allInterviews.filter(inv => inv.status === 'SCHEDULED' || inv.selected_slot).length === 0 ? (
                      <div className="py-12 border border-dashed border-slate-800 rounded-xl bg-slate-900/40 text-center">
                        <Calendar size={32} className="text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">No interviews have been confirmed by candidates yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {allInterviews.filter(inv => inv.status === 'SCHEDULED' || inv.selected_slot).map((inv) => {
                          const job = getJobDetail(inv.application_details?.job || inv.job_id);
                          const candidate = inv.application_details?.candidate_details || {};
                          return (
                            <div key={inv.id} className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/30 transition-all">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                                    {candidate.username ? candidate.username.substring(0, 2).toUpperCase() : 'C'}
                                  </div>
                                  <div>
                                    <h4 className="text-white font-semibold text-sm">{candidate.username || 'Candidate'}</h4>
                                    <p className="text-slate-400 text-xs">for {job.title}</p>
                                  </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${inv.mode === 'ONLINE' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                  {inv.mode}
                                </span>
                              </div>
                              
                              <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10 space-y-2">
                                <div className="flex items-center gap-2 text-xs text-indigo-300 font-medium">
                                  <CheckCircle size={14} /> Confirmed Slot:
                                </div>
                                <div className="text-sm text-slate-200 font-semibold">
                                  {inv.selected_slot ? new Date(inv.selected_slot).toLocaleString(undefined, {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                  }) : 'Waiting for candidate to pick...'}
                                </div>
                              </div>

                              {inv.meeting_link && (
                                <a 
                                  href={inv.meeting_link} target="_blank" rel="noreferrer"
                                  className="mt-4 flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-semibold transition-colors"
                                >
                                  <Eye size={14} /> View Meeting Link
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-slate-800 mb-10" />

                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                      <Plus size={22} className="text-indigo-400" /> New Interview Schedule
                    </h2>
                    <p className="text-slate-400 text-sm">Select a job to start scheduling interviews for shortlisted candidates.</p>
                  </div>

                  {isLoadingJobs ? (
                    <div className="text-center py-10 text-slate-400">Loading jobs...</div>
                  ) : jobs.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50">
                      <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-300 mb-2">No jobs posted yet</h3>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {jobs.map((job) => (
                        <motion.button
                          key={job.id || job._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => handleIntJobSelect(job)}
                          className="text-left p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/60 transition-all group"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">{job.title}</h3>
                              {job.company_name && (
                                <p className="text-sm text-indigo-400 mt-0.5 flex items-center gap-1">
                                  <Building size={13} /> {job.company_name}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                                <span className="flex items-center gap-1"><MapPin size={12} /> {Array.isArray(job.location) ? job.location.join(', ') : job.location}</span>
                              </div>
                            </div>
                            <span className="flex items-center gap-1 text-xs text-slate-300 bg-slate-800 px-2.5 py-1 rounded-full mt-1 ml-4 shrink-0">
                              <CalendarClock size={12} /> Schedule
                            </span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* Shortlisted Candidates */
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      onClick={() => { setIntJobSelected(null); setIntApplicants([]); }}
                      className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      <ChevronLeft size={16} /> Back to Jobs
                    </button>
                    <div className="h-4 w-px bg-slate-700" />
                    <div>
                      <h2 className="text-xl font-semibold text-white">{intJobSelected.title}</h2>
                      {intJobSelected.company_name && (
                        <p className="text-sm text-indigo-400 flex items-center gap-1 mt-0.5">
                          <Building size={13} /> {intJobSelected.company_name}
                        </p>
                      )}
                    </div>
                    <span className="ml-auto px-3 py-1.5 rounded-full bg-purple-600/15 text-purple-300 text-sm font-semibold border border-purple-500/20">
                      {intApplicants.length} Shortlisted
                    </span>
                  </div>

                  {isLoadingInt ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mr-3" />
                      <span className="text-slate-400">Loading shortlisted candidates...</span>
                    </div>
                  ) : intApplicants.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50">
                      <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-300 mb-2">No shortlisted candidates</h3>
                      <p className="text-slate-500">Mark candidates as <span className="text-purple-400 font-medium">Shortlisted</span> in Manage Applicants first.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {intApplicants.map((app, idx) => {
                        const candidate = app.candidate_details || {};
                        return (
                          <motion.div
                            key={app.id || idx}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                  {candidate.username ? candidate.username.substring(0, 2).toUpperCase() : 'CA'}
                                </div>
                                <div>
                                  <p className="text-white font-semibold text-sm">{candidate.username || `Applicant #${app.candidate}`}</p>
                                  <p className="text-slate-400 text-xs mt-0.5">{candidate.email || '—'}</p>
                                  <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(app.status)}`}>
                                    {getStatusIcon(app.status)} {app.status?.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                              {app.status?.toUpperCase() === 'INTERVIEW_SCHEDULED' ? (
                                <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium shrink-0">
                                  <CheckCircle size={15} /> Interview Scheduled
                                </span>
                              ) : (
                                <button
                                  onClick={() => openSchedModal(app)}
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20 shrink-0"
                                >
                                  <CalendarClock size={15} /> Schedule Interview
                                </button>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </div>

        {/* ── INTERVIEW SCHEDULE MODAL ──────────────────────────────── */}
        <AnimatePresence>
  {schedModal.isOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl"
      >

        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CalendarClock size={20} className="text-indigo-400"/>
              Schedule Interview
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              For:
              <span className="text-white font-medium ml-1">
                {schedModal.application?.candidate_details?.username ||
                  `Applicant #${schedModal.application?.candidate}`}
              </span>
            </p>
          </div>

          <button
            onClick={() => setSchedModal({ isOpen: false, application: null })}
            className="text-slate-400 hover:text-white transition-colors mt-1"
          >
            <X size={20}/>
          </button>
        </div>

        <form onSubmit={handleScheduleSubmit} className="p-6 space-y-5">

          {/* Interview Mode */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Interview Mode
            </label>

            <div className="grid grid-cols-2 gap-3">
              {["ONLINE", "IN_PERSON"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() =>
                    setSchedForm((f) => ({ ...f, mode: m }))
                  }
                  className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    schedForm.mode === m
                      ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                      : "bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                  }`}
                >
                  {m === "ONLINE" ? "🌐 Online" : "🏢 In Person"}
                </button>
              ))}
            </div>
          </div>


          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Start Date
              </label>

              <DatePicker
                selected={startDate}
                onChange={(date) => {
                  setStartDate(date)

                  const formatted = date.toISOString().split("T")[0]

                  setSchedForm((f) => ({
                    ...f,
                    start_date: formatted
                  }))
                }}
                minDate={new Date()}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select date"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>


            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                End Date
              </label>

              <DatePicker
                selected={endDate}
                onChange={(date) => {
                  setEndDate(date)

                  const formatted = date.toISOString().split("T")[0]

                  setSchedForm((f) => ({
                    ...f,
                    end_date: formatted
                  }))
                }}
                minDate={startDate || new Date()}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select date"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

          </div>


          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">

            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Daily Start Time
              </label>

              <DatePicker
                selected={startTime}
                onChange={(time) => {
                  setStartTime(time)

                  const formatted = time.toTimeString().slice(0,5)

                  setSchedForm((f) => ({
                    ...f,
                    start_time: formatted
                  }))
                }}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                dateFormat="HH:mm"
                placeholderText="Select time"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>


            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Daily End Time
              </label>

              <DatePicker
                selected={endTime}
                onChange={(time) => {
                  setEndTime(time)

                  const formatted = time.toTimeString().slice(0,5)

                  setSchedForm((f) => ({
                    ...f,
                    end_time: formatted
                  }))
                }}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                dateFormat="HH:mm"
                placeholderText="Select time"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

          </div>


          <p className="text-xs text-slate-500 bg-slate-800/60 rounded-lg px-3 py-2">
            📧 After scheduling, the candidate will receive an email to pick
            their preferred interview slot within this window.
          </p>


          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">

            <button
              type="button"
              onClick={() =>
                setSchedModal({ isOpen: false, application: null })
              }
              className="px-5 py-2.5 rounded-lg font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isScheduling}
              className="px-5 py-2.5 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              {isScheduling ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"/>
                  Scheduling...
                </>
              ) : (
                <>
                  <CalendarClock size={16}/>
                  Confirm Schedule
                </>
              )}
            </button>

          </div>

        </form>
      </motion.div>
    </div>
  )}
</AnimatePresence>
        {/* Create / Edit Job Modal */}

        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 flex justify-between items-center z-10">
                  <h2 className="text-xl font-bold text-white">
                    {isEditMode ? 'Edit Job Posting' : 'Create New Job Posting'}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleSaveJob} className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Job Title</label>
                      <input 
                        type="text" required
                        value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. Backend Developer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Company Name</label>
                      <input 
                        type="text" required
                        value={newJob.company_name} onChange={e => setNewJob({...newJob, company_name: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. Acme Corp"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                    <textarea 
                      required rows={4}
                      value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Describe the role and responsibilities..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Skills (comma separated)</label>
                      <input 
                        type="text" required
                        value={newJob.skills} onChange={e => setNewJob({...newJob, skills: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Python, Django, PostgreSQL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Locations (comma separated)</label>
                      <input 
                        type="text" required
                        value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Chennai, Remote"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Experience Required (Years)</label>
                      <input 
                        type="number" required min="0" step="0.5"
                        value={newJob.experience} onChange={e => setNewJob({...newJob, experience: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. 3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                      <select 
                        value={newJob.status} onChange={e => setNewJob({...newJob, status: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="CLOSED">CLOSED</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2.5 rounded-lg font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                    >
                      {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Job Posting')}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <ConfirmModal 
          isOpen={deleteModal.isOpen}
          title="Delete Job Posting"
          message="Are you sure you want to delete this job posting? This action cannot be undone."
          confirmText="Delete Job"
          cancelText="Cancel"
          isDestructive={true}
          onConfirm={confirmDeleteJob}
          onCancel={() => setDeleteModal({ isOpen: false, jobId: null })}
        />

      </main>
    </div>
  );
};

export default EmployerDashboard;
