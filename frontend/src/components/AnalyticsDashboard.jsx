import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { 
  Activity, MessageSquare, Target, Hash, TrendingUp, Clock, 
  Zap, PieChart as PieIcon, RefreshCw 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getAnalytics, getRecentQueries } from '../utils/api';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-card p-4 flex flex-col gap-2 relative overflow-hidden group"
  >
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-${color}-500/10 blur-2xl group-hover:bg-${color}-500/20 transition-all`} />
    <div className="flex justify-between items-center relative z-10">
      <div className={`p-2 rounded-lg bg-${color}-500/20 text-${color}-400`}>
        <Icon size={20} />
      </div>
      {trend && (
        <span className={`text-xs font-medium ${trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend}
        </span>
      )}
    </div>
    <div className="mt-2 relative z-10">
      <h3 className="text-sm text-slate-400 font-medium">{title}</h3>
      <p className="text-2xl font-bold text-slate-100">{value}</p>
    </div>
  </motion.div>
);

const AnalyticsDashboard = ({ refreshTrigger, onTopicClick }) => {
  const [data, setData] = useState(null);
  const [recentQueries, setRecentQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [analytics, recent] = await Promise.all([
        getAnalytics(),
        getRecentQueries()
      ]);
      setData(analytics);
      setRecentQueries(recent);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  if (loading || !data) return (
    <div className="h-full flex items-center justify-center">
      <RefreshCw className="animate-spin text-primary-500" size={32} />
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pr-2 scroll-hide">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Performance Dashboard</h1>
          <p className="text-sm text-slate-400">Insights into academic query patterns</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-slate-400">
          <Clock size={14} />
          Real-time updates active
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Queries" 
          value={data.total_queries} 
          icon={MessageSquare} 
          color="primary" 
          trend="+12%" 
        />
        <StatCard 
          title="Avg Confidence" 
          value={`${(data.avg_confidence * 100).toFixed(0)}%`} 
          icon={Target} 
          color="emerald" 
          trend="+5.2%" 
        />
        <StatCard 
          title="Topics Covered" 
          value={data.most_searched_topics.length} 
          icon={Hash} 
          color="amber" 
        />
        <StatCard 
          title="Avg Latency" 
          value="42ms" 
          icon={Zap} 
          color="purple" 
          trend="-8%" 
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Searched Topics */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-primary-400" />
            <h3 className="font-semibold text-slate-200">Most Searched Topics</h3>
          </div>
          <div className="h-64 w-full" style={{ minHeight: '256px' }}>
            <ResponsiveContainer width="100%" height="100%" minHeight={256} minWidth={100}>
              <BarChart data={data.most_searched_topics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="url(#colorBar)" 
                  radius={[4, 4, 0, 0]}
                  onClick={(data) => onTopicClick && onTopicClick(data.name)}
                  cursor="pointer"
                >
                  {data.most_searched_topics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fillOpacity={0.8} />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Activity Trend */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={18} className="text-emerald-400" />
            <h3 className="font-semibold text-slate-200">User Activity Trends</h3>
          </div>
          <div className="h-64 w-full" style={{ minHeight: '256px' }}>
            <ResponsiveContainer width="100%" height="100%" minHeight={256} minWidth={100}>
              <AreaChart data={data.activity_trends}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area type="monotone" dataKey="count" stroke="#10b981" fillOpacity={1} fill="url(#colorTrend)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="glass-card p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} className="text-amber-400" />
          <h3 className="font-semibold text-slate-200">Live Query Monitoring</h3>
        </div>
        <div className="space-y-3">
          {recentQueries.map((q, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              onClick={() => onTopicClick && onTopicClick(q.query)}
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary-500/30 hover:bg-white/10 transition-all cursor-pointer group/query"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${q.confidence > 0.8 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <div>
                  <p className="text-sm text-slate-200 font-medium truncate max-w-xs group-hover/query:text-primary-400 transition-colors">{q.query}</p>
                  <p className="text-[10px] text-slate-500">Topic: {q.topic} • Confidence: {(q.confidence * 100).toFixed(0)}%</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{q.time}</span>
            </motion.div>
          ))}
          {recentQueries.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-8">No queries logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
