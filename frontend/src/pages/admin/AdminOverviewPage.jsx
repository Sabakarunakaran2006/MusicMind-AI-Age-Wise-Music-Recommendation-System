import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Shield, Users, Music, Library, Heart, MessageSquare,
  Cpu, ArrowRight, CheckCircle2, Activity, BarChart2, Sliders
} from 'lucide-react';
import { api } from '../../services/api';

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAdminOverview()
      .then((data) => setOverview(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Registered Users', val: overview?.total_users ?? '-', icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Library Songs', val: overview?.total_songs ?? '-', icon: Music, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'User Playlists', val: overview?.total_playlists ?? '-', icon: Library, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Saved Favorites', val: overview?.total_favorites ?? '-', icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'Feedback Logs', val: overview?.total_feedback ?? '-', icon: MessageSquare, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/40 text-indigo-300 text-xs font-semibold mb-2">
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          <span>Platform Administration</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-black text-white">System & Model Overview</h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time database statistics, recommendation model status, and administrative controls.
        </p>
      </div>

      {/* Real Database Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="p-5 rounded-3xl bg-[#11131e]/90 border border-white/5 flex flex-col justify-between shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400">{s.label}</span>
                <div className={`p-2.5 rounded-xl ${s.bg} ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-white tracking-tight">
                {loading ? '...' : s.val}
              </div>
            </div>
          );
        })}
      </div>

      {/* Model Engine Information Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/20 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Active Recommendation Pipeline:</span>
                <span className="text-purple-300 font-extrabold">{overview?.active_model_name}</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Version <span className="text-cyan-300 font-mono font-semibold">{overview?.active_model_version}</span> • Content-Based Vector Space + Demographic Priors
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/40 self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4" />
            <span>Operational (Postgres/SQLite DB)</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          The engine computes high-dimensional cosine similarity across normalized tempo (BPM), audio energy, valence, and danceability vectors, dynamically modulated by non-overlapping demographic baseline priors (Teen 13–19, Young Adult 20–29, Adult 30–45, Middle-aged 46–60, Senior 61+).
        </p>

        <div className="pt-2 flex flex-wrap gap-3">
          <NavLink
            to="/admin/analytics"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center space-x-1.5 transition"
          >
            <BarChart2 className="w-4 h-4" />
            <span>View ML Performance Metrics (Precision@K, Recall, Coverage)</span>
          </NavLink>
        </div>
      </div>

      {/* Navigation Quick Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NavLink
          to="/admin/users"
          className="p-6 rounded-3xl bg-[#11131e]/90 border border-white/5 hover:border-purple-500/30 transition group flex flex-col justify-between"
        >
          <div>
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 inline-block mb-4 group-hover:scale-105 transition">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">User & Role Management</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inspect registered listeners, toggle account activation, and manage administrative privileges.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-purple-400">
            <span>Manage Users</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </NavLink>

        <NavLink
          to="/admin/songs"
          className="p-6 rounded-3xl bg-[#11131e]/90 border border-white/5 hover:border-cyan-500/30 transition group flex flex-col justify-between"
        >
          <div>
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 inline-block mb-4 group-hover:scale-105 transition">
              <Music className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Song Catalog Management</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Add new tracks, update acoustic features (tempo, energy, valence, danceability), and edit metadata.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-cyan-400">
            <span>Manage Catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </NavLink>

        <NavLink
          to="/admin/taxonomy"
          className="p-6 rounded-3xl bg-[#11131e]/90 border border-white/5 hover:border-emerald-500/30 transition group flex flex-col justify-between"
        >
          <div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 inline-block mb-4 group-hover:scale-105 transition">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Age Groups & Taxonomy</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Configure age group boundaries, define genres, and inspect distribution matrices.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-emerald-400">
            <span>Manage Taxonomy</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </NavLink>
      </div>
    </div>
  );
}
