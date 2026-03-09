import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, LayoutDashboard, LogOut, ShieldCheck, Calendar, UserCheck, UserX, Search, Building, User, Briefcase, FileText, Video, ChevronRight, TrendingUp,  BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { adminService } from '../../services/admin.service';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'users'

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [profileData, kpiData, userData] = await Promise.all([
          authService.getProfile(),
          adminService.getKPIs(),
          adminService.getUsers()
        ]);
        
        setProfile(profileData?.data || profileData);
        // Handle both old and new KPI structures
        setKpis(kpiData?.data || kpiData);
        setUsers(Array.isArray(userData) ? userData : userData?.data || []);
      } catch (error) {
        console.error("Failed to fetch admin data", error);
        toast.error("Session expired or unauthorized access.");
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      navigate('/signin');
    }
  };

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Get values from nested structure with fallbacks
  const stats = {
    users: kpis?.users?.total || kpis?.total_users || 0,
    candidates: kpis?.users?.candidates || kpis?.total_candidates || 0,
    employers: kpis?.users?.employers || kpis?.total_employers || 0,
    jobs: kpis?.jobs?.total || kpis?.total_jobs || 0,
    apps: kpis?.applications?.total || kpis?.total_applications || 0,
    interviews: kpis?.interviews?.total || 0
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/20">A</div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Admin Hub</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl transition-all ${
              activeTab === 'overview' 
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard size={20} /> Platform Overview
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl transition-all ${
              activeTab === 'users' 
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Users size={20} /> User Management
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {activeTab === 'overview' ? 'Dashboard Overview' : 'User Directory'}
            </h1>
            <p className="text-slate-400 mt-1">
              {activeTab === 'overview' 
                ? 'Consolidated platform performance metrics.' 
                : 'Manage system users and their permissions.'}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-slate-900/50 p-2 pl-4 rounded-2xl border border-slate-800">
            <div className="text-right">
              <p className="text-sm font-bold text-white leading-none mb-1">{profile?.username || 'Administrator'}</p>
              <p className="text-[10px] text-slate-500 flex items-center gap-1 justify-end uppercase tracking-wider font-bold">
                <ShieldCheck size={10} className="text-emerald-500" /> Super Admin
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-inner">
              {profile?.username?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              {/* Primary KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Total Users', value: stats.users, icon: Users, color: 'indigo', trend: '+12%' },
                  { label: 'Total Candidates', value: stats.candidates, icon: User, color: 'blue', trend: '+8%' },
                  { label: 'Total Employers', value: stats.employers, icon: Building, color: 'purple', trend: '+5%' },
                ].map((stat, idx) => (
                  <motion.div 
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative overflow-hidden p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/30 transition-all group shadow-sm"
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-${stat.color}-500/10 transition-colors`} />
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-4 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-400`}>
                        <stat.icon size={24} />
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                        <TrendingUp size={10} /> {stat.trend}
                      </span>
                    </div>
                    <div className="relative z-10">
                       <p className="text-4xl font-black text-white tracking-tighter mb-1">{stat.value}</p>
                       <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">{stat.label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Secondary Metrics & Graph */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visual Graph Section */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col h-[400px]">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <BarChart3 size={20} className="text-indigo-400" /> Platform Distribution
                    </h2>
                    <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                       <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-indigo-500"></div> Value</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex items-end justify-around gap-2 px-4">
                    {[
                      { l: 'Jobs', v: stats.jobs, c: 'indigo' },
                      { l: 'Apps', v: stats.apps, c: 'blue' },
                      { l: 'Scheduled', v: kpis?.interviews?.scheduled || 0, c: 'purple' },
                      { l: 'Admins', v: kpis?.users?.admins || 0, c: 'emerald' },
                    ].map(item => {
                      const maxVal = Math.max(stats.jobs, stats.apps, stats.interviews, kpis?.users?.admins || 1);
                      const height = (item.v / maxVal) * 100;
                      return (
                        <div key={item.l} className="flex flex-col items-center gap-4 w-16 group">
                          <div className="relative w-full flex flex-col items-center justify-end h-48">
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${height}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                              className={`w-10 bg-gradient-to-t from-${item.c}-600 to-${item.c}-400 rounded-t-lg shadow-lg shadow-${item.c}-500/20 group-hover:brightness-125 transition-all relative`}
                            >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md font-bold whitespace-nowrap">
                                {item.v} Units
                              </div>
                            </motion.div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.l}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Additional KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="p-6 rounded-2xl bg-indigo-600/5 border border-indigo-500/10 flex flex-col justify-center">
                      <Briefcase className="text-indigo-400 mb-3" size={24} />
                      <p className="text-2xl font-bold text-white">{stats.jobs}</p>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">Total Active Jobs</p>
                   </div>
                   <div className="p-6 rounded-2xl bg-blue-600/5 border border-blue-500/10 flex flex-col justify-center">
                      <FileText className="text-blue-400 mb-3" size={24} />
                      <p className="text-2xl font-bold text-white">{stats.apps}</p>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">Job Applications</p>
                   </div>
                   <div className="p-6 rounded-2xl bg-purple-600/5 border border-purple-500/10 flex flex-col justify-center">
                      <Video className="text-purple-400 mb-3" size={24} />
                      <p className="text-2xl font-bold text-white">{stats.interviews}</p>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">Interviews Conducted</p>
                   </div>
                   <div className="p-6 rounded-2xl bg-emerald-600/5 border border-emerald-500/10 flex flex-col justify-center">
                      <LayoutDashboard className="text-emerald-400 mb-3" size={24} />
                      <p className="text-2xl font-bold text-white">{kpis?.jobs?.active || 0}</p>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">Platform Uptime Status</p>
                   </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="users"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users size={20} className="text-indigo-400" /> User Directory
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Showing {filteredUsers.length} total users registered on the platform.</p>
                </div>
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search by username, email or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-2xl pl-12 pr-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-200 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/30 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                      <th className="px-8 py-5">User Identity</th>
                      <th className="px-8 py-5">Access Level</th>
                      <th className="px-8 py-5">Security</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5">Registration Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-8 py-20 text-center text-slate-500">
                          <div className="flex flex-col items-center gap-2 opacity-50">
                             <Search size={40} />
                             <p className="text-sm">No results found for "{searchTerm}"</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user, idx) => (
                        <motion.tr 
                          key={user.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.02 }}
                          className="hover:bg-indigo-500/5 transition-colors group cursor-default"
                        >
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-slate-300 group-hover:border-indigo-500/50 transition-colors">
                                {user.username?.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{user.username}</p>
                                <p className="text-[11px] text-slate-500 font-medium">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                              user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                              user.role === 'EMPLOYER' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                              'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            {user.is_verified ? (
                              <div className="flex items-center gap-2 text-[11px] text-emerald-500 font-bold uppercase tracking-tighter">
                                <ShieldCheck size={14} /> Verified
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold uppercase tracking-tighter">
                                <UserX size={14} /> Unverified
                              </div>
                            )}
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse"></div>
                              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Online</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                              <Calendar size={14} className="text-slate-600" />
                              {new Date(user.date_joined).toLocaleDateString(undefined, {
                                year: 'numeric', month: 'short', day: 'numeric'
                              })}
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex justify-center">
                <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-2">
                   View Full System Logs <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminDashboard;
