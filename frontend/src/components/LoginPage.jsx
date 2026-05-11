import { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, ArrowRight, Shield, Globe } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const LoginPage = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState('kushal.p@university.edu');
  const [password, setPassword] = useState('password123');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    const result = await login({ email, password });
    
    if (result.success) {
      toast.success('Welcome back, ' + email.split('@')[0] + '!', {
        duration: 3000,
        style: { background: '#1e293b', color: '#fff', border: '1px solid #ffffff10' }
      });
    } else {
      toast.error(result.error || 'Login failed', {
        style: { background: '#1e293b', color: '#fff', border: '1px solid #ffffff10' }
      });
      setIsLoggingIn(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    const toastId = toast.loading(`Initiating ${provider} login...`, {
      style: { background: '#1e293b', color: '#fff', border: '1px solid #ffffff10' }
    });
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/auth/${provider.toLowerCase()}`);
      const data = await response.json();
      
      if (data.error === "not_configured") {
        toast.dismiss(toastId);
        toast((t) => (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium">{data.message}</p>
            <button 
              onClick={() => {
                toast.dismiss(t.id);
                // Mock a successful login for demo
                login({ email: `demo.${provider.toLowerCase()}@eduquery.ai`, password: 'password123' });
                toast.success(`Simulated ${provider} login success!`);
              }}
              className="bg-primary-600 hover:bg-primary-500 text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors"
            >
              Simulate Success (Demo)
            </button>
          </div>
        ), {
          duration: 6000,
          style: { background: '#1e293b', color: '#fff', border: '1px solid #ffffff10', padding: '16px' }
        });
      } else if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Social login error:', error);
      toast.error('Auth service unavailable', { id: toastId });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-emerald-500 flex items-center justify-center shadow-2xl shadow-primary-500/20 mb-4">
            <GraduationCap className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-slate-400 mt-2 text-center">Enter your academic credentials to continue your AI-powered learning journey.</p>
        </div>

        <div className="glass-card p-8 border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">University Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all text-sm"
                  placeholder="name@university.edu"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
                <button type="button" className="text-[10px] text-primary-400 hover:text-primary-300 font-bold uppercase tracking-wider">Forgot?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold rounded-xl transition-all shadow-xl shadow-primary-900/40 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoggingIn ? 'Signing In...' : 'Sign In'}
              {!isLoggingIn && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative flex items-center mb-6">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">Or continue with</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleSocialLogin('Google')}
                className="flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-semibold hover:bg-white/10 transition-colors"
              >
                <Globe size={16} />
                Google
              </button>
              <button 
                onClick={() => handleSocialLogin('GitHub')}
                className="flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-semibold hover:bg-white/10 transition-colors"
              >
                <Shield size={16} />
                GitHub
              </button>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Don't have an account? {' '}
          <button 
            onClick={() => navigate('/request-access')}
            className="text-primary-400 font-bold hover:text-primary-300"
          >
            Request Access
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
