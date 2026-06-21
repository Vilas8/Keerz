import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseMock } from '../utils/supabaseClient';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  Users, Star, MapPin, TrendingUp, Plane, RefreshCw, 
  AlertCircle, GraduationCap, Calendar, Laptop, Clock, X 
} from 'lucide-react';

const COLORS = ['#D4AF37', '#0EA5E9', '#079992', '#535C91', '#E11D48', '#10B981', '#F59E0B', '#8B5CF6'];

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Admin record viewer states
  const [viewMode, setViewMode] = useState('charts'); // 'charts' or 'leads'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterScore, setFilterScore] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLeadProfile, setSelectedLeadProfile] = useState(null);

  // States for delete and reply options
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase.from('aviation_leads').select('*').order('created_at', { ascending: false });
      
      if (error) throw error;
      setLeads(data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Could not retrieve analytics data from server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this candidate record?")) {
      return;
    }
    try {
      setIsDeleting(true);
      const { error } = await supabase.from('aviation_leads').delete().eq('id', id);
      if (error) throw error;

      // Update local leads state
      setLeads(prevLeads => prevLeads.filter(l => l.id !== id));
      setSelectedLeadProfile(null);
      alert("Candidate record deleted successfully!");
    } catch (err) {
      console.error("Error deleting lead:", err);
      alert("Failed to delete the lead from the database.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendReply = async (email, name) => {
    if (!replySubject.trim() || !replyBody.trim()) {
      alert("Please fill in both the subject and the message body.");
      return;
    }

    try {
      setIsSendingReply(true);
      const response = await fetch('/api/send-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          subject: replySubject,
          body: replyBody,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      alert("Reply email sent successfully!");
      setReplySubject('');
      setReplyBody('');
      setShowReplyForm(false);
    } catch (err) {
      console.error("Error sending reply email:", err);
      alert(`Failed to send reply email: ${err.message}`);
    } finally {
      setIsSendingReply(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // calculations
  const safeLeads = Array.isArray(leads) ? leads : [];
  const totalLeads = safeLeads.length;
  
  // Seriousness score average
  const avgSeriousness = totalLeads > 0 
    ? (safeLeads.reduce((acc, curr) => acc + (Number(curr?.seriousness_score) || 3), 0) / totalLeads).toFixed(1) 
    : 0;

  // Immediate joiners percentage (Immediately 0-1 month)
  const immediateJoiners = safeLeads.filter(l => l && l.joining_timeline && l.joining_timeline.includes('Immediately')).length;
  const immediatePercent = totalLeads > 0 
    ? Math.round((immediateJoiners / totalLeads) * 100) 
    : 0;

  // Top state and top city demand
  const stateCounts = {};
  const cityCounts = {};
  safeLeads.forEach(l => {
    if (!l) return;
    if (l.state) stateCounts[l.state] = (stateCounts[l.state] || 0) + 1;
    if (l.preferred_training_city) cityCounts[l.preferred_training_city] = (cityCounts[l.preferred_training_city] || 0) + 1;
  });

  const topState = Object.entries(stateCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';
  const topCity = Object.entries(cityCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // 1. Chart: State demand
  const stateChartData = Object.entries(stateCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a,b) => b.value - a.value)
    .slice(0, 8);

  // 2. Chart: Timeline demand
  const timelineCounts = {};
  safeLeads.forEach(l => {
    if (!l) return;
    const t = l.joining_timeline || 'Exploring';
    timelineCounts[t] = (timelineCounts[t] || 0) + 1;
  });
  const timelineChartData = Object.entries(timelineCounts).map(([name, value]) => ({ name, value }));

  // 3. Chart: Training Mode
  const modeCounts = {};
  safeLeads.forEach(l => {
    if (!l) return;
    const m = l.training_mode || 'Hybrid';
    modeCounts[m] = (modeCounts[m] || 0) + 1;
  });
  const modeChartData = Object.entries(modeCounts).map(([name, value]) => ({ name, value }));

  // 4. Chart: Top Topics
  const topicCounts = {};
  safeLeads.forEach(l => {
    if (!l) return;
    let topics = [];
    if (Array.isArray(l.selected_training_topics)) {
      topics = l.selected_training_topics;
    } else if (typeof l.selected_training_topics === 'string') {
      try {
        const parsed = JSON.parse(l.selected_training_topics);
        if (Array.isArray(parsed)) topics = parsed;
      } catch {
        if (l.selected_training_topics.startsWith('{') && l.selected_training_topics.endsWith('}')) {
          topics = l.selected_training_topics.slice(1, -1).split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        } else {
          topics = l.selected_training_topics.split(',').map(s => s.trim());
        }
      }
    }
    topics.forEach(t => {
      if (t) topicCounts[t] = (topicCounts[t] || 0) + 1;
    });
  });
  const topicChartData = Object.entries(topicCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a,b) => b.value - a.value);

  // 5. Chart: Age Distribution
  const ageCounts = {};
  safeLeads.forEach(l => {
    if (!l) return;
    const a = l.age_group || '18-20';
    ageCounts[a] = (ageCounts[a] || 0) + 1;
  });
  const ageChartData = Object.entries(ageCounts).map(([name, value]) => ({ name, value }));

  // 6. Chart: Qualification Distribution
  const qualCounts = {};
  safeLeads.forEach(l => {
    if (!l) return;
    const q = l.qualification || '12th Pass';
    qualCounts[q] = (qualCounts[q] || 0) + 1;
  });
  const qualChartData = Object.entries(qualCounts).map(([name, value]) => ({ name, value }));

  // 7. Chart: Seriousness score distribution
  const scoreCounts = { 1:0, 2:0, 3:0, 4:0, 5:0 };
  safeLeads.forEach(l => {
    if (!l) return;
    const s = l.seriousness_score || 3;
    scoreCounts[s] = (scoreCounts[s] || 0) + 1;
  });
  const scoreChartData = Object.entries(scoreCounts).map(([name, value]) => ({ name: `Score ${name}`, value }));

  // Loading indicator
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-300">
        <RefreshCw className="w-8 h-8 animate-spin text-gold-main" />
        <p className="font-medium">Syncing flight analytics dashboard...</p>
      </div>
    );
  }

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      
      {/* Top row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-semibold tracking-widest text-gold-main uppercase block mb-1">
            Real-Time Analysis
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Plane className="w-6 h-6 text-gold-main transform -rotate-45" />
            Academy Feasibility Dashboard
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Validating demand indicators, localization concentrations, and training preferences across India.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-navy-dark/80 p-1 rounded-xl border border-white/10 shrink-0">
            <button
              onClick={() => setViewMode('charts')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${viewMode === 'charts' ? 'bg-gold-main text-navy-dark shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Analytics Charts
            </button>
            <button
              onClick={() => setViewMode('leads')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${viewMode === 'leads' ? 'bg-gold-main text-navy-dark shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Candidate Records
            </button>
          </div>

          {isSupabaseMock && (
            <span className="px-3 py-1 rounded bg-gold-main/10 border border-gold-main/30 text-gold-main text-[10px] font-mono uppercase tracking-wider">
              Preview Mode (Demo Seed Data)
            </span>
          )}
          
          <button 
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-navy-medium hover:bg-navy-light text-white rounded-lg border border-white/5 hover:border-sky-light/35 transition-all text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-950/60 border border-red-500/30 text-red-200 text-sm">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Leads */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Leads</span>
            <Users className="w-4 h-4 text-sky-light" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white font-display">
              {totalLeads}
            </span>
            <span className="block text-[10px] text-slate-500 mt-1 font-semibold">Interest Submissions</span>
          </div>
        </div>

        {/* Card 2: Avg Seriousness */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Commitment Score</span>
            <Star className="w-4 h-4 text-gold-main" />
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-white font-display">{avgSeriousness}</span>
              <span className="text-xs text-slate-500 font-bold">/ 5.0</span>
            </div>
            <span className="block text-[10px] text-slate-500 mt-1 font-semibold">Avg Seriousness Scale</span>
          </div>
        </div>

        {/* Card 3: Top State */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Top State</span>
            <MapPin className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-4">
            <span className="text-lg font-bold text-white font-display truncate block">
              {topState}
            </span>
            <span className="block text-[10px] text-slate-500 mt-2 font-semibold">Highest Survey Volume</span>
          </div>
        </div>

        {/* Card 4: Top City */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Top City</span>
            <MapPin className="w-4 h-4 text-gold-light" />
          </div>
          <div className="mt-4">
            <span className="text-lg font-bold text-white font-display truncate block">
              {topCity}
            </span>
            <span className="block text-[10px] text-slate-500 mt-2 font-semibold">Highest Local Interest</span>
          </div>
        </div>

        {/* Card 5: Immediate Joiners */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between shadow-lg col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Immediate Joiners</span>
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-white font-display">{immediatePercent}%</span>
            </div>
            <span className="block text-[10px] text-slate-500 mt-1 font-semibold">Join within 0-1 month</span>
          </div>
        </div>

      </div>

      {totalLeads === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/5 text-slate-400">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h4 className="text-white font-bold text-lg mb-1">No Leads Registered Yet</h4>
          <p className="text-sm font-light">Submissions to the interest form will automatically update this feasibility panel.</p>
        </div>
      ) : viewMode === 'charts' ? (
        <div className="space-y-8">
          
          {/* Row 1 Charts: Geography & Joining Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Chart 1: State Demand */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-md space-y-4">
              <h3 className="text-sm font-bold tracking-wide uppercase text-slate-300 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-light" /> State Feasibility Distribution (Top 8)
              </h3>
              <div className="h-64 sm:h-72 w-full text-xs">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={stateChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#070F2B', borderColor: 'rgba(255,255,255,0.1)', color: '#ffffff' }} />
                    <Bar dataKey="value" fill="#0EA5E9" radius={[4, 4, 0, 0]}>
                      {stateChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Joining Timeline */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-md space-y-4">
              <h3 className="text-sm font-bold tracking-wide uppercase text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-main" /> Enrollment Timeline Preferences
              </h3>
              <div className="h-64 sm:h-72 w-full text-xs flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="h-48 sm:h-full w-full sm:w-[60%] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={timelineChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {timelineChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#070F2B', borderColor: 'rgba(255,255,255,0.1)', color: '#ffffff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Legend list */}
                <div className="w-full sm:w-[40%] flex flex-col gap-2.5 text-xs text-slate-400">
                  {timelineChartData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-left">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="truncate">{item.name}: <strong>{item.value}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Row 2 Charts: Requested Training Topics & Mode Preference */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Chart 3: Top Topics of Interest */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-md space-y-4">
              <h3 className="text-sm font-bold tracking-wide uppercase text-slate-300 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-400" /> Syllabus Modules Demand Rank
              </h3>
              <div className="h-72 sm:h-80 w-full text-xs">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart 
                    data={topicChartData} 
                    layout="vertical"
                    margin={{ top: 10, right: 10, left: 35, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                    <XAxis type="number" stroke="#94a3b8" />
                    <YAxis type="category" dataKey="name" stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#070F2B', borderColor: 'rgba(255,255,255,0.1)', color: '#ffffff' }} />
                    <Bar dataKey="value" fill="#D4AF37" radius={[0, 4, 4, 0]}>
                      {topicChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Training Mode */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-md space-y-4">
              <h3 className="text-sm font-bold tracking-wide uppercase text-slate-300 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-sky-light" /> Preferred Training Mode
              </h3>
              <div className="h-64 sm:h-72 w-full text-xs flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="h-48 sm:h-full w-full sm:w-[60%] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={modeChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={75}
                        dataKey="value"
                      >
                        {modeChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#070F2B', borderColor: 'rgba(255,255,255,0.1)', color: '#ffffff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Legend list */}
                <div className="w-full sm:w-[40%] flex flex-col gap-2.5 text-xs text-slate-400">
                  {modeChartData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-left">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[(index + 4) % COLORS.length] }} />
                      <span className="truncate">{item.name} Mode: <strong>{item.value}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Row 3 Charts: Demographics & Seriousness Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Chart 5: Age Group Distribution */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-md space-y-4">
              <h3 className="text-sm font-bold tracking-wide uppercase text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold-main" /> Age Groups
              </h3>
              <div className="h-56 w-full text-xs">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={ageChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#070F2B', borderColor: 'rgba(255,255,255,0.1)', color: '#ffffff' }} />
                    <Bar dataKey="value" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 6: Qualification Breakdown */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-md space-y-4">
              <h3 className="text-sm font-bold tracking-wide uppercase text-slate-300 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-sky-light" /> Qualifications
              </h3>
              <div className="h-56 w-full text-xs">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={qualChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#070F2B', borderColor: 'rgba(255,255,255,0.1)', color: '#ffffff' }} />
                    <Bar dataKey="value" fill="#079992" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 7: Candidate Seriousness Scores */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-md space-y-4">
              <h3 className="text-sm font-bold tracking-wide uppercase text-slate-300 flex items-center gap-2">
                <Star className="w-4 h-4 text-gold-main" /> Commitment Score Scale
              </h3>
              <div className="h-56 w-full text-xs">
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={scoreChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#070F2B', borderColor: 'rgba(255,255,255,0.1)', color: '#ffffff' }} />
                    <Area type="monotone" dataKey="value" stroke="#D4AF37" fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="space-y-6 animate-fade-in text-left">
          
          {/* Controls Bar */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search name, city, state..."
                  className="w-full pl-4 pr-10 py-2.5 bg-navy-dark/60 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-gold-main text-xs"
                />
              </div>

              {/* State Filter */}
              <select
                value={filterState}
                onChange={(e) => {
                  setFilterState(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-navy-dark/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-gold-main"
              >
                <option value="">All States</option>
                {Array.from(new Set(safeLeads.map(l => l?.state).filter(Boolean))).sort().map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>

              {/* Seriousness Filter */}
              <select
                value={filterScore}
                onChange={(e) => {
                  setFilterScore(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-navy-dark/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-gold-main"
              >
                <option value="">All Scores</option>
                {[5, 4, 3, 2, 1].map(sc => (
                  <option key={sc} value={sc}>Score {sc}.0</option>
                ))}
              </select>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={() => {
                const headers = [
                  'Name', 'Email', 'Mobile', 'WhatsApp', 'Age Group', 'Qualification', 
                  'State', 'City', 'Preferred Training City', 'Timeline', 'Training Mode', 
                  'Seriousness Score', 'Careers of Interest', 'Topics of Interest', 
                  'Biggest Challenge', 'Consent Granted', 'Submitted At'
                ];
                
                const rows = safeLeads.map(l => [
                  l.full_name || '',
                  l.email || '',
                  l.mobile || '',
                  l.whatsapp || '',
                  l.age_group || '',
                  l.qualification || '',
                  l.state || '',
                  l.city || '',
                  l.preferred_training_city || '',
                  l.joining_timeline || '',
                  l.training_mode || '',
                  l.seriousness_score || '',
                  Array.isArray(l.selected_careers) ? l.selected_careers.join('; ') : (l.selected_careers || ''),
                  Array.isArray(l.selected_training_topics) ? l.selected_training_topics.join('; ') : (l.selected_training_topics || ''),
                  (l.biggest_challenge || '').replace(/\r?\n|\r/g, ' '),
                  l.consent ? 'Yes' : 'No',
                  new Date(l.created_at || Date.now()).toLocaleString('en-IN')
                ]);
                
                const csvString = [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
                const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Keerz_Academy_Leads_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-main to-gold-light text-navy-dark font-bold rounded-xl text-xs hover:from-gold-light hover:to-white transition-all shadow-md cursor-pointer"
            >
              Export CSV List
            </button>

          </div>

          {/* Leads Table Container */}
          <div className="glass-panel rounded-2xl border border-white/5 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-navy-dark/40 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="p-4 sm:p-5">Name</th>
                    <th className="p-4 sm:p-5">Contact Details</th>
                    <th className="p-4 sm:p-5">Location</th>
                    <th className="p-4 sm:p-5">Preferences</th>
                    <th className="p-4 sm:p-5 text-center">Commitment</th>
                    <th className="p-4 sm:p-5">Submitted Date</th>
                    <th className="p-4 sm:p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs sm:text-sm text-slate-300">
                  {(() => {
                    const filtered = safeLeads.filter(l => {
                      if (!l) return false;
                      const query = searchQuery.toLowerCase().trim();
                      const matchesSearch = 
                        !query ||
                        (l.full_name && l.full_name.toLowerCase().includes(query)) ||
                        (l.email && l.email.toLowerCase().includes(query)) ||
                        (l.mobile && l.mobile.includes(query)) ||
                        (l.state && l.state.toLowerCase().includes(query)) ||
                        (l.city && l.city.toLowerCase().includes(query));
                      
                      const matchesState = !filterState || l.state === filterState;
                      const matchesScore = !filterScore || String(l.seriousness_score) === filterScore;
                      
                      return matchesSearch && matchesState && matchesScore;
                    });

                    const itemsPerPage = 10;
                    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan="7" className="p-10 text-center text-slate-500 font-light">
                            No candidate records found matching current search/filters.
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <>
                        {paginated.map((l) => (
                          <tr key={l.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 sm:p-5 font-bold text-white max-w-[12rem] truncate">
                              {l.full_name}
                            </td>
                            <td className="p-4 sm:p-5 font-light leading-relaxed">
                              <span className="block">{l.email}</span>
                              <span className="block text-slate-500 text-xs">{l.mobile}</span>
                            </td>
                            <td className="p-4 sm:p-5">
                              <span className="block font-semibold">{l.city}</span>
                              <span className="block text-slate-500 text-xs">{l.state}</span>
                            </td>
                            <td className="p-4 sm:p-5 text-xs">
                              <span className="block text-slate-400 font-semibold">{l.joining_timeline}</span>
                              <span className="block text-slate-500">{l.training_mode} Mode</span>
                            </td>
                            <td className="p-4 sm:p-5 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded font-bold font-mono text-[10px] ${
                                l.seriousness_score >= 4 
                                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' 
                                  : l.seriousness_score === 3 
                                    ? 'bg-gold-main/15 border border-gold-main/30 text-gold-main' 
                                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                              }`}>
                                {l.seriousness_score}.0 / 5.0
                              </span>
                            </td>
                            <td className="p-4 sm:p-5 text-xs text-slate-500">
                              {new Date(l.created_at).toLocaleDateString('en-IN')}
                            </td>
                            <td className="p-4 sm:p-5 text-right">
                              <button
                                onClick={() => setSelectedLeadProfile(l)}
                                className="px-3 py-1 bg-navy-medium border border-white/10 hover:border-gold-main/40 text-slate-200 hover:text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                        
                        {/* Table Footer / Pagination controls */}
                        {totalPages > 1 && (
                          <tr>
                            <td colSpan="7" className="p-4 sm:p-5 bg-navy-dark/20">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-light">
                                  Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length} Leads
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-2.5 py-1 bg-navy-medium text-slate-400 hover:text-white disabled:opacity-30 rounded text-xs cursor-pointer border border-white/5"
                                  >
                                    Previous
                                  </button>
                                  <span className="text-xs font-mono font-bold text-slate-300">
                                    {currentPage} / {totalPages}
                                  </span>
                                  <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-2.5 py-1 bg-navy-medium text-slate-400 hover:text-white disabled:opacity-30 rounded text-xs cursor-pointer border border-white/5"
                                  >
                                    Next
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* DETAIL MODAL OVERLAY */}
      {selectedLeadProfile && (
        <div className="fixed inset-0 z-50 bg-navy-dark/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-slate-900 border border-gold-main/30 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-gold-main font-bold uppercase block text-left">
                  Lead Profile Details
                </span>
                <h3 className="font-display text-lg sm:text-xl font-extrabold text-white mt-1 text-left">
                  {selectedLeadProfile.full_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLeadProfile(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Fields Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-left text-sm max-h-[60vh] overflow-y-auto pr-2">
              
              <div>
                <span className="block text-[10px] uppercase font-bold tracking-wide text-slate-500">Email Address</span>
                <span className="text-white break-all font-light">{selectedLeadProfile.email}</span>
              </div>

              <div>
                <span className="block text-[10px] uppercase font-bold tracking-wide text-slate-500">Contact Numbers</span>
                <span className="text-white block font-light">Mobile: {selectedLeadProfile.mobile}</span>
                {selectedLeadProfile.whatsapp && (
                  <span className="text-slate-400 text-xs block font-light">WhatsApp: {selectedLeadProfile.whatsapp}</span>
                )}
              </div>

              <div>
                <span className="block text-[10px] uppercase font-bold tracking-wide text-slate-500">Location Details</span>
                <span className="text-white block font-semibold">{selectedLeadProfile.city}, {selectedLeadProfile.state}</span>
                <span className="text-slate-500 text-xs block">Training Campus: {selectedLeadProfile.preferred_training_city}</span>
              </div>

              <div>
                <span className="block text-[10px] uppercase font-bold tracking-wide text-slate-500">Age & Qualification</span>
                <span className="text-white block font-light">Age: {selectedLeadProfile.age_group} Years</span>
                <span className="text-slate-400 text-xs block">Qual: {selectedLeadProfile.qualification}</span>
              </div>

              <div>
                <span className="block text-[10px] uppercase font-bold tracking-wide text-slate-500">Timeline & Mode</span>
                <span className="text-white block font-light">Timeline: {selectedLeadProfile.joining_timeline}</span>
                <span className="text-slate-400 text-xs block">Mode: {selectedLeadProfile.training_mode} Mode</span>
              </div>

              <div>
                <span className="block text-[10px] uppercase font-bold tracking-wide text-slate-500">Commitment Score</span>
                <span className="text-gold-main font-bold block">{selectedLeadProfile.seriousness_score}.0 / 5.0</span>
                <span className="text-slate-500 text-xs block">Career Interest: {selectedLeadProfile.career_interest}</span>
              </div>

              <div className="sm:col-span-2">
                <span className="block text-[10px] uppercase font-bold tracking-wide text-slate-500 mb-1">Careers of Interest</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(Array.isArray(selectedLeadProfile.selected_careers) 
                    ? selectedLeadProfile.selected_careers 
                    : String(selectedLeadProfile.selected_careers).split(',')
                  ).map((c, i) => (
                    <span key={i} className="px-2 py-0.5 bg-sky-main/15 border border-sky-main/30 text-sky-light text-[10px] font-semibold rounded">
                      {c.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <span className="block text-[10px] uppercase font-bold tracking-wide text-slate-500 mb-1">Requested Training Topics</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(Array.isArray(selectedLeadProfile.selected_training_topics) 
                    ? selectedLeadProfile.selected_training_topics 
                    : String(selectedLeadProfile.selected_training_topics).startsWith('{')
                      ? String(selectedLeadProfile.selected_training_topics).slice(1,-1).split(',')
                      : String(selectedLeadProfile.selected_training_topics).split(',')
                  ).map((t, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gold-main/15 border border-gold-main/30 text-gold-main text-[10px] font-medium rounded">
                      {t.trim().replace(/^"|"$/g, '')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <span className="block text-[10px] uppercase font-bold tracking-wide text-slate-500">Biggest Challenge</span>
                <p className="text-slate-300 font-light text-xs mt-1 bg-navy-dark/40 p-3 rounded-lg border border-white/5 leading-relaxed">
                  {selectedLeadProfile.biggest_challenge || 'No challenge shared.'}
                </p>
              </div>

              <div className="sm:col-span-2 text-slate-500 text-[10px] font-mono leading-relaxed pt-2 border-t border-white/5 flex justify-between">
                <span>Consent Granted: {selectedLeadProfile.consent ? 'Yes' : 'No'}</span>
                <span>Submitted At: {new Date(selectedLeadProfile.created_at).toLocaleString('en-IN')}</span>
              </div>

              {/* Reply Form */}
              {showReplyForm && (
                <div className="sm:col-span-2 bg-navy-dark/60 p-4 rounded-xl border border-white/10 space-y-3 mt-2">
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider">Compose Reply</h4>
                  
                  <div className="space-y-1 text-left">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase">Subject</label>
                    <input
                      type="text"
                      value={replySubject}
                      onChange={(e) => setReplySubject(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-gold-main"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase">Message Body</label>
                    <textarea
                      rows={5}
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      placeholder="Type your message here..."
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-gold-main"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setShowReplyForm(false)}
                      className="px-3 py-1.5 bg-navy-medium text-slate-400 hover:text-white rounded-lg text-xs font-semibold cursor-pointer transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSendReply(selectedLeadProfile.email, selectedLeadProfile.full_name)}
                      disabled={isSendingReply}
                      className="px-4 py-1.5 bg-gold-main hover:bg-gold-light text-navy-dark rounded-lg text-xs font-bold cursor-pointer transition-all disabled:opacity-50"
                    >
                      {isSendingReply ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => handleDeleteLead(selectedLeadProfile.id)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Lead"}
              </button>

              <div className="flex items-center gap-3">
                {!showReplyForm && (
                  <button
                    onClick={() => {
                      setReplySubject(`Re: Welcome Aboard! - Keerz Aviation Academy`);
                      setReplyBody(`Hi ${selectedLeadProfile.full_name},\n\n`);
                      setShowReplyForm(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    Reply to Candidate
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedLeadProfile(null);
                    setShowReplyForm(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-navy-medium border border-white/10 hover:border-white/20 text-slate-200 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  Close Profile
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
