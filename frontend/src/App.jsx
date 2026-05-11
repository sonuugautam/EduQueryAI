import { useState } from 'react';
import { 
  LayoutDashboard, MessageSquare, BookOpen, Settings, 
  Search, Bell, User, LogOut, GraduationCap, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, Navigate } from 'react-router-dom';
import ChatInterface from './components/ChatInterface';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import CurriculumView from './components/CurriculumView';
import SettingsView from './components/SettingsView';
import LoginPage from './components/LoginPage';
import RequestAccessPage from './components/RequestAccessPage';
import { useUser } from './context/UserContext';

const NOTIFICATIONS = [
  { id: 1, title: 'New Analysis Ready', description: 'Your RAG analysis for "Neural Networks" is complete.', time: '2m ago', read: false },
  { id: 2, title: 'Storage Warning', description: 'You have used 65% of your storage limit.', time: '1h ago', read: false },
  { id: 3, title: 'Welcome to EduQuery', description: 'Start by uploading a PDF or asking a question.', time: '2d ago', read: true },
];

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
      active 
        ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/40' 
        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
    {active && (
      <motion.div 
        layoutId="active-indicator"
        className="ml-auto"
      >
        <ChevronRight size={16} />
      </motion.div>
    )}
  </button>
);

function App() {
  const { user, isAuthenticated, logout } = useUser();
  const [activeTab, setActiveTab] = useState('explore');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleQuerySuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      setSearchQuery(e.target.value.trim());
      setActiveTab('explore');
      e.target.value = ''; // Clear search bar
    }
  };

  const handleContinuePath = (subjectOrTopic) => {
    const query = typeof subjectOrTopic === 'string' 
      ? `Tell me more about ${subjectOrTopic}` 
      : `Continue my learning path for ${subjectOrTopic.title}`;
    setSearchQuery(query);
    setActiveTab('explore');
  };

  return (
    <Routes>
      <Route path="/request-access" element={<RequestAccessPage />} />
      <Route 
        path="/" 
        element={
          !isAuthenticated ? (
            <LoginPage />
          ) : (
            <div className="flex h-screen w-full bg-[#0f172a] overflow-hidden font-sans relative">
              {/* Global Overlay for Notifications */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="fixed right-8 top-20 mt-2 w-80 glass-card p-4 shadow-2xl border-white/10 z-[100]"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-white">Notifications</h3>
                        <button 
                          onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))}
                          className="text-[10px] font-bold text-primary-400 uppercase tracking-wider hover:text-primary-300"
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="space-y-3">
                        {notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className={`p-3 rounded-xl transition-colors cursor-pointer ${notification.read ? 'bg-white/[0.02]' : 'bg-primary-500/10 border border-primary-500/20'}`}
                          >
                            <h4 className="text-xs font-bold text-white mb-1">{notification.title}</h4>
                            <p className="text-[10px] text-slate-400 line-clamp-2">{notification.description}</p>
                            <span className="text-[9px] text-slate-500 mt-2 block">{notification.time}</span>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => {
                          setActiveTab('dashboard');
                          setShowNotifications(false);
                        }}
                        className="w-full mt-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors border-t border-white/5 pt-4"
                      >
                        View all activity
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Sidebar */}
              <aside className="w-64 border-r border-white/5 p-6 flex flex-col gap-8 bg-[#0f172a]/50 backdrop-blur-xl relative z-50">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                    <GraduationCap className="text-white" size={24} />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-white">EduQuery</h1>
                    <p className="text-[10px] text-primary-400 font-bold tracking-widest uppercase">Intelligent AI</p>
                  </div>
                </div>

                <nav className="flex flex-col gap-2">
                  <SidebarItem 
                    icon={LayoutDashboard} 
                    label="Dashboard" 
                    active={activeTab === 'dashboard'} 
                    onClick={() => setActiveTab('dashboard')}
                  />
                  <SidebarItem 
                    icon={MessageSquare} 
                    label="Smart Chat" 
                    active={activeTab === 'explore'} 
                    onClick={() => setActiveTab('explore')}
                  />
                  <SidebarItem 
                    icon={BookOpen} 
                    label="Curriculum" 
                    active={activeTab === 'curriculum'} 
                    onClick={() => setActiveTab('curriculum')}
                  />
                  <SidebarItem 
                    icon={Settings} 
                    label="Settings" 
                    active={activeTab === 'settings'} 
                    onClick={() => setActiveTab('settings')}
                  />
                </nav>

                <div className="mt-auto glass-card p-4">
                  <p className="text-xs text-slate-400 mb-3">Storage Used</p>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                    <div className="w-[65%] h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full" />
                  </div>
                  <p className="text-[10px] text-slate-500">650MB of 1GB used</p>
                </div>

                <button 
                  onClick={logout}
                  className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-400 transition-colors w-full"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </aside>

              {/* Main Content */}
              <main className="flex-1 flex flex-col min-w-0 bg-white/[0.01] relative z-0">
                {/* Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0f172a]/20 backdrop-blur-md relative z-50">
                  <div className="flex-1 max-w-xl">
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors" size={18} />
                      <input 
                        type="text" 
                        placeholder="Search your knowledge base, notes, or AI chats..." 
                        onKeyDown={handleSearch}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-2.5 pl-12 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:bg-white/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all relative z-50"
                      >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#0f172a] shadow-sm animate-pulse" />
                        )}
                      </button>
                    </div>
                    
                    <div className="h-8 w-[1px] bg-white/5 mx-2" />
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-200">{user.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{user.role}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-purple-600 p-[2px]">
                        <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="text-primary-400" size={24} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </header>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden p-8 relative z-0" style={{ isolation: 'isolate' }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="h-full"
                    >
                      {activeTab === 'explore' && (
                        <ChatInterface 
                          onQuerySuccess={handleQuerySuccess} 
                          initialQuery={searchQuery}
                          onClearQuery={() => setSearchQuery('')}
                        />
                      )}
                      {activeTab === 'dashboard' && (
                        <AnalyticsDashboard 
                          refreshTrigger={refreshTrigger} 
                          onTopicClick={handleContinuePath}
                        />
                      )}
                      {activeTab === 'curriculum' && (
                        <CurriculumView onContinuePath={handleContinuePath} />
                      )}
                      {activeTab === 'settings' && <SettingsView />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </main>
            </div>
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
