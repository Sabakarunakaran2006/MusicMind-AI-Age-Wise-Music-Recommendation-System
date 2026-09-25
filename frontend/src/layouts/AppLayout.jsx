import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles, Compass, Library, Heart, History, User, Settings,
  LogOut, Shield, Music, Menu, X, Search, Sliders, Camera, BarChart2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PlayerBar from '../components/PlayerBar';
import ExplainModal from '../components/ExplainModal';

export default function AppLayout() {
  const { user, isAdmin, logout, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navItems = [
    { label: 'Home', path: '/', icon: Music },
    { label: 'AI Recommendations', path: '/recommendations', icon: Sparkles },
    { label: 'Explore Music', path: '/explore', icon: Compass },
    { label: 'My Playlists', path: '/playlists', icon: Library },
    { label: 'Favorites', path: '/favorites', icon: Heart },
    { label: 'Listening History', path: '/history', icon: History },
    { label: 'AI Age Estimator', path: '/age-detector', icon: Camera },
    { label: 'Profile & Preferences', path: '/profile', icon: User },
  ];

  const adminNavItems = [
    { label: 'Admin Overview', path: '/admin', icon: Shield },
    { label: 'Users & Roles', path: '/admin/users', icon: User },
    { label: 'Song Management', path: '/admin/songs', icon: Music },
    { label: 'Age & Genres', path: '/admin/taxonomy', icon: Sliders },
    { label: 'ML Analytics', path: '/admin/analytics', icon: BarChart2 },
  ];

  // Quick Viva presentation role switchers
  const switchToListener = async () => {
    await login('listener@musicmind.ai', 'ListenerPassword123!');
    navigate('/');
  };

  const switchToAdmin = async () => {
    await login('admin@musicmind.ai', 'AdminPassword123!');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-[#090a10] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-[#0d0f18]/90 backdrop-blur-md border-b border-white/5 px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <NavLink to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/30 group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                MusicMind AI
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 font-semibold border border-purple-800/40">
                Age-Tailored Engine
              </span>
            </div>
          </NavLink>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search songs, artists, or genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141624] border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition placeholder:text-slate-500"
            />
          </div>
        </form>

        {/* Header Right: User Status & Demo Switchers */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="hidden xl:flex items-center space-x-2 bg-white/5 border border-white/5 rounded-full px-3 py-1">
            <span className="text-[11px] text-slate-400">Demo Profiles:</span>
            <button
              onClick={switchToListener}
              className="text-[11px] px-2 py-0.5 rounded-full bg-purple-900/60 hover:bg-purple-800 text-purple-200 font-medium transition"
            >
              Listener (24)
            </button>
            <button
              onClick={switchToAdmin}
              className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 font-medium transition"
            >
              Admin (Vance)
            </button>
          </div>

          {user && (
            <div className="flex items-center space-x-2 pl-2">
              <div className="hidden sm:block text-right">
                <div className="font-semibold text-xs text-slate-200 truncate max-w-[120px]">{user.name}</div>
                <div className="text-[10px] text-purple-400 font-medium">
                  {user.age} yrs • {user.age_group || 'Listener'}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center font-bold text-xs text-white shadow">
                {user.name.charAt(0)}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[#0d0f18] lg:bg-[#0a0b12] border-r border-white/5 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } pt-16 lg:pt-0`}
        >
          <div className="p-4 space-y-6 overflow-y-auto">
            {/* Listener Menu */}
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
                Discover
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-purple-600/15 text-purple-300 border border-purple-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Admin Menu (visible if user is admin) */}
            {isAdmin && (
              <div>
                <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
                  <span>Admin Portal</span>
                  <Shield className="w-3 h-3 text-indigo-400" />
                </div>
                <nav className="space-y-1">
                  {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                          isActive
                            ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            )}
          </div>

          {/* Sidebar Footer User Card */}
          <div className="p-4 border-t border-white/5">
            {user ? (
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div className="truncate">
                  <div className="text-xs font-semibold text-white truncate">{user.name}</div>
                  <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                    <span className="capitalize">{user.role}</span>
                    <span>•</span>
                    <span className="text-purple-300 font-medium">{user.age_group}</span>
                  </div>
                </div>
                <button
                  onClick={() => logout()}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center transition shadow-lg shadow-purple-600/20"
              >
                Sign In
              </NavLink>
            )}
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto pb-28 px-4 lg:px-8 py-6">
          <Outlet />
        </main>
      </div>

      {/* Persistent Audio Player & Explainability Modal */}
      <PlayerBar />
      <ExplainModal />
    </div>
  );
}
