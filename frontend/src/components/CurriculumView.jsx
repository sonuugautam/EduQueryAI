import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Brain, Atom, Calculator, CheckCircle2, 
  ChevronRight, Clock, Star, Trophy, Loader2
} from 'lucide-react';

const ICON_MAP = {
  'Atom': Atom,
  'Brain': Brain,
  'Calculator': Calculator,
  'BookOpen': BookOpen
};

const CurriculumView = ({ onContinuePath }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/curriculum')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch curriculum:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="text-primary-500 animate-spin" size={48} />
      </div>
    );
  }

  if (!data) return <div className="text-slate-500">Failed to load curriculum.</div>;

  return (
    <div className="h-full flex flex-col gap-8 overflow-y-auto pr-2 custom-scrollbar">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Academic Curriculum</h2>
          <p className="text-slate-400 mt-1">Track your personalized learning journey and knowledge milestones.</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <Trophy className="text-amber-400" size={20} />
            <span className="text-white font-semibold">{data.xp} XP</span>
          </div>
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <Star className="text-primary-400" size={20} />
            <span className="text-white font-semibold">Level {data.level}</span>
          </div>
        </div>
      </div>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.subjects.map((subject, index) => {
          const Icon = ICON_MAP[subject.icon_type] || BookOpen;
          return (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card group hover:bg-white/[0.08] transition-all duration-300 overflow-hidden"
            >
              <div className={`h-2 w-full bg-gradient-to-r ${subject.color}`} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${subject.color} shadow-lg shadow-black/20`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{subject.status}</span>
                    <p className="text-2xl font-bold text-white mt-1">{subject.progress}%</p>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{subject.title}</h3>
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
                  <BookOpen size={14} />
                  <span>{subject.lessons} modules found</span>
                </div>

                <div className="space-y-3 mb-6">
                  {subject.topics.map((topic, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="text-emerald-500" size={14} />
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => onContinuePath(subject)}
                  className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2 group-hover:border-primary-500/50"
                >
                  Continue Path
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Learning Roadmap */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-white">Learning Roadmap</h3>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Clock size={16} />
            <span>Last updated 2 hours ago</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-white/5" />
          
          {data.roadmap.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              onClick={() => onContinuePath(step.title)}
              className="relative pl-12 pb-8 last:pb-0 cursor-pointer group/item"
            >
              <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-[#0f172a] border-2 border-primary-500 flex items-center justify-center z-10 group-hover/item:scale-110 transition-transform">
                <div className="w-2 h-2 rounded-full bg-primary-500" />
              </div>
              <div className="group-hover/item:translate-x-1 transition-transform">
                <span className="text-[10px] font-bold uppercase text-primary-400 tracking-wider">{step.date} • {step.type}</span>
                <h4 className="text-lg font-bold text-white mt-1 group-hover/item:text-primary-400 transition-colors">{step.title}</h4>
                <p className="text-slate-400 text-sm mt-1">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CurriculumView;
