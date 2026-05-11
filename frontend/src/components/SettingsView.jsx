import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Bell, Shield, Cpu, Zap, 
  Eye, Globe, LogOut, ChevronRight, Camera
} from 'lucide-react';
import { useUser } from '../context/UserContext';

const SettingToggle = ({ icon: Icon, title, desc, enabled, onToggle }) => (
  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
    <div className="flex gap-4 items-center">
      <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-400">
        <Icon size={20} />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </div>
    <button 
      onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-primary-500' : 'bg-slate-700'}`}
    >
      <motion.div 
        animate={{ x: enabled ? 26 : 2 }}
        className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </button>
  </div>
);

const SettingsView = () => {
  const { user, updateUser, logout, aiSettings, updateAiSettings } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({ ...user });

  const [systemSettings, setSystemSettings] = useState({
    notifications: true,
    publicProfile: false
  });

  const toggleSystemSetting = (key) => {
    setSystemSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    updateUser(tempProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempProfile({ ...user });
    setIsEditing(false);
  };

  return (
    <div className="h-full flex flex-col gap-8 overflow-y-auto pr-2 custom-scrollbar">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Settings & Preferences</h2>
        <p className="text-slate-400 mt-1">Manage your account, AI preferences, and security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Section */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-card p-6 flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary-600 to-purple-600 p-[3px]">
                <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center overflow-hidden">
                  {tempProfile.avatar ? (
                    <img src={tempProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-primary-400" />
                  )}
                </div>
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-primary-500 text-white rounded-full border-4 border-[#0f172a] opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={14} />
              </button>
            </div>
            
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div 
                  key="edit-form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full mt-4 space-y-4"
                >
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Full Name</label>
                    <input 
                      type="text"
                      value={tempProfile.name}
                      onChange={(e) => setTempProfile(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-sm"
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Role / Headline</label>
                    <input 
                      type="text"
                      value={tempProfile.role}
                      onChange={(e) => setTempProfile(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-sm"
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Email Address</label>
                    <input 
                      type="email"
                      value={tempProfile.email}
                      onChange={(e) => setTempProfile(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-sm"
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Avatar URL</label>
                    <input 
                      type="text"
                      placeholder="https://example.com/avatar.jpg"
                      value={tempProfile.avatar || ''}
                      onChange={(e) => setTempProfile(prev => ({ ...prev, avatar: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-sm"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={handleSave}
                      className="flex-1 py-2 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-primary-900/40"
                    >
                      Save
                    </button>
                    <button 
                      onClick={handleCancel}
                      className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="static-view"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full"
                >
                  <h3 className="text-xl font-bold text-white mt-4">{user.name}</h3>
                  <p className="text-sm text-slate-500 mb-6">{user.role} Since {user.since}</p>
                  
                  <div className="w-full space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-sm">
                      <Mail size={16} className="text-slate-500" />
                      <span className="text-slate-300">{user.email}</span>
                    </div>
                    <button 
                      onClick={() => {
                        setTempProfile({ ...user });
                        setIsEditing(true);
                      }}
                      className="w-full py-2 text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      Edit Profile
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="glass-card p-6">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Account Tier</h4>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-600 to-purple-700">
              <div className="flex items-center justify-between mb-4">
                <Zap className="text-white" size={24} />
                <span className="px-2 py-1 bg-white/20 rounded text-[10px] font-bold text-white uppercase">Active</span>
              </div>
              <p className="text-lg font-bold text-white">Academic Pro</p>
              <p className="text-xs text-white/70 mt-1">Unlimited PDF uploads & advanced NLP insights.</p>
            </div>
          </div>
        </div>

        {/* Configurations Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* AI Settings */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Cpu className="text-primary-400" size={20} />
              <h3 className="text-lg font-bold text-white">AI Configuration</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingToggle 
                icon={Zap}
                title="Deep RAG Analysis"
                desc="Higher accuracy search through knowledge base."
                enabled={aiSettings.deepRag}
                onToggle={() => updateAiSettings({ deepRag: !aiSettings.deepRag })}
              />
              <SettingToggle 
                icon={Eye}
                title="Auto-Summarize"
                desc="Generate summaries for uploaded PDFs."
                enabled={aiSettings.autoSummarize}
                onToggle={() => updateAiSettings({ autoSummarize: !aiSettings.autoSummarize })}
              />
            </div>
          </div>

          {/* System Settings */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="text-emerald-400" size={20} />
              <h3 className="text-lg font-bold text-white">Security & Privacy</h3>
            </div>
            <div className="space-y-4">
              <SettingToggle 
                icon={Bell}
                title="Smart Notifications"
                desc="Receive alerts for query answers and insights."
                enabled={systemSettings.notifications}
                onToggle={() => toggleSystemSetting('notifications')}
              />
              <SettingToggle 
                icon={Globe}
                title="Public Profile"
                desc="Allow others to see your academic progress."
                enabled={systemSettings.publicProfile}
                onToggle={() => toggleSystemSetting('publicProfile')}
              />
            </div>
          </div>

          <button 
            onClick={logout}
            className="w-full glass-card p-4 flex items-center justify-between group hover:bg-rose-500/10 transition-all border-rose-500/10"
          >
            <div className="flex items-center gap-3 text-rose-500">
              <LogOut size={20} />
              <span className="font-semibold">Sign Out Account</span>
            </div>
            <ChevronRight size={18} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
