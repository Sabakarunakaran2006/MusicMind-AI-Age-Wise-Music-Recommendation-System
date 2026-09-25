import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Mail, Lock, Eye, EyeOff, Shield, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      // Handled in context toast
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail, userPass, targetPath) => {
    setEmail(userEmail);
    setPassword(userPass);
    setLoading(true);
    try {
      const loggedUser = await login(userEmail, userPass);
      if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(targetPath || '/');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080e] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient decorative glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-md bg-[#11131e]/90 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-xl shadow-purple-600/30 mb-3">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">MusicMind AI</h1>
          <p className="text-xs text-slate-400 mt-1">
            Age-Wise & Content-Based Intelligent Music Recommendation
          </p>
        </div>

        {/* Demo Quick Logins Box for Viva Evaluators */}
        <div className="mb-6 p-3.5 rounded-2xl bg-white/5 border border-purple-500/20">
          <div className="text-[11px] font-bold text-purple-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Evaluator Quick Sign-In</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/40">1-Click</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('listener@musicmind.ai', 'ListenerPassword123!', '/')}
              className="p-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-left transition group"
            >
              <div className="flex items-center space-x-1.5 text-purple-300 font-semibold mb-0.5">
                <User className="w-3.5 h-3.5" />
                <span>Listener Demo</span>
              </div>
              <div className="text-[10px] text-slate-400">Alex • Age 24</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@musicmind.ai', 'AdminPassword123!', '/admin')}
              className="p-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-left transition group"
            >
              <div className="flex items-center space-x-1.5 text-indigo-300 font-semibold mb-0.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Demo</span>
              </div>
              <div className="text-[10px] text-slate-400">Prof. Vance • Admin</div>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#181b2a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#181b2a] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-xl shadow-purple-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Sign In to MusicMind</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          New listener?{' '}
          <NavLink to="/register" className="text-purple-400 font-semibold hover:underline">
            Create an Account
          </NavLink>
        </div>
      </div>
    </div>
  );
}
