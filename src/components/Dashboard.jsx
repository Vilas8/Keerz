import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseMock } from '../utils/supabaseClient';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';

function CustomResponsiveContainer({ children, height = 300 }) {
  const containerRef = React.useRef(null);
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    if (!containerRef.current) return;
    
    setWidth(containerRef.current.getBoundingClientRect().width || 300);

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setWidth(entries[0].contentRect.width || 300);
      }
    });
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const renderedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        width: width,
        height: height
      });
    }
    return child;
  });

  return (
    <div ref={containerRef} className="w-full flex items-center justify-center" style={{ height: `${height}px` }}>
      {width > 0 ? renderedChildren : <div className="text-slate-500 text-xs font-mono">Drawing...</div>}
    </div>
  );
}
import { 
  Users, Star, MapPin, TrendingUp, Plane, RefreshCw, 
  AlertCircle, GraduationCap, Calendar, Laptop 
} from 'lucide-react';

const COLORS = ['#D4AF37', '#0EA5E9', '#079992', '#535C91', '#E11D48', '#10B981', '#F59E0B', '#8B5CF6'];

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // calculations
  const totalLeads = leads.length;
  
  // Seriousness score average
  const avgSeriousness = totalLeads > 0 
    ? (leads.reduce((acc, curr) => acc + curr.seriousness_score, 0) / totalLeads).toFixed(1) 
    : 0;

  // Immediate joiners percentage (Immediately 0-1 month)
  const immediateJoiners = leads.filter(l => l.joining_timeline && l.joining_timeline.includes('Immediately')).length;
  const immediatePercent = totalLeads > 0 
    ? Math.round((immediateJoiners / totalLeads) * 100) 
    : 0;

  // Top state and top city demand
  const stateCounts = {};
  const cityCounts = {};
  leads.forEach(l => {
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
  leads.forEach(l => {
    const t = l.joining_timeline || 'Exploring';
    timelineCounts[t] = (timelineCounts[t] || 0) + 1;
  });
  const timelineChartData = Object.entries(timelineCounts).map(([name, value]) => ({ name, value }));

  // 3. Chart: Training Mode
  const modeCounts = {};
  leads.forEach(l => {
    const m = l.training_mode || 'Hybrid';
    modeCounts[m] = (modeCounts[m] || 0) + 1;
  });
  const modeChartData = Object.entries(modeCounts).map(([name, value]) => ({ name, value }));

  // 4. Chart: Top Topics
  const topicCounts = {};
  leads.forEach(l => {
    const topics = l.selected_training_topics || [];
    topics.forEach(t => {
      topicCounts[t] = (topicCounts[t] || 0) + 1;
    });
  });
  const topicChartData = Object.entries(topicCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a,b) => b.value - a.value);

  // 5. Chart: Age Distribution
  const ageCounts = {};
  leads.forEach(l => {
    const a = l.age_group || '18-20';
    ageCounts[a] = (ageCounts[a] || 0) + 1;
  });
  const ageChartData = Object.entries(ageCounts).map(([name, value]) => ({ name, value }));

  // 6. Chart: Qualification Distribution
  const qualCounts = {};
  leads.forEach(l => {
    const q = l.qualification || '12th Pass';
    qualCounts[q] = (qualCounts[q] || 0) + 1;
  });
  const qualChartData = Object.entries(qualCounts).map(([name, value]) => ({ name, value }));

  // 7. Chart: Seriousness score distribution
  const scoreCounts = { 1:0, 2:0, 3:0, 4:0, 5:0 };
  leads.forEach(l => {
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

        <div className="flex items-center gap-3">
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
      ) : (
        <div className="space-y-8">
          
          {/* Row 1 Charts: Geography & Joining Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Chart 1: State Demand */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-md space-y-4">
              <h3 className="text-sm font-bold tracking-wide uppercase text-slate-300 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-light" /> State Feasibility Distribution (Top 8)
              </h3>
              <div className="h-64 sm:h-72 w-full text-xs">
                <CustomResponsiveContainer height={260}>
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
                </CustomResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Joining Timeline */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-md space-y-4">
              <h3 className="text-sm font-bold tracking-wide uppercase text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-main" /> Enrollment Timeline Preferences
              </h3>
              <div className="h-64 sm:h-72 w-full text-xs flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="h-48 sm:h-full w-full sm:w-[60%] flex items-center justify-center">
                  <CustomResponsiveContainer height={220}>
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
                  </CustomResponsiveContainer>
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
                <CustomResponsiveContainer height={280}>
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
                </CustomResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Training Mode */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-md space-y-4">
              <h3 className="text-sm font-bold tracking-wide uppercase text-slate-300 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-sky-light" /> Preferred Training Mode
              </h3>
              <div className="h-64 sm:h-72 w-full text-xs flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="h-48 sm:h-full w-full sm:w-[60%] flex items-center justify-center">
                  <CustomResponsiveContainer height={220}>
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
                  </CustomResponsiveContainer>
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
                <CustomResponsiveContainer height={220}>
                  <BarChart data={ageChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#070F2B', borderColor: 'rgba(255,255,255,0.1)', color: '#ffffff' }} />
                    <Bar dataKey="value" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </CustomResponsiveContainer>
              </div>
            </div>

            {/* Chart 6: Qualification Breakdown */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-md space-y-4">
              <h3 className="text-sm font-bold tracking-wide uppercase text-slate-300 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-sky-light" /> Qualifications
              </h3>
              <div className="h-56 w-full text-xs">
                <CustomResponsiveContainer height={220}>
                  <BarChart data={qualChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#070F2B', borderColor: 'rgba(255,255,255,0.1)', color: '#ffffff' }} />
                    <Bar dataKey="value" fill="#079992" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </CustomResponsiveContainer>
              </div>
            </div>

            {/* Chart 7: Candidate Seriousness Scores */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-md space-y-4">
              <h3 className="text-sm font-bold tracking-wide uppercase text-slate-300 flex items-center gap-2">
                <Star className="w-4 h-4 text-gold-main" /> Commitment Score Scale
              </h3>
              <div className="h-56 w-full text-xs">
                <CustomResponsiveContainer height={220}>
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
                </CustomResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

    </section>
  );
}
