import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Sparkles, Flame, Play, Clock, ArrowRight, Music2,
  Sliders, User, RefreshCw, Zap, Heart, Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { api } from '../services/api';
import SongCard from '../components/SongCard';

const MOODS = [
  { name: 'Energetic', icon: '⚡', color: 'from-amber-500/20 to-orange-500/20' },
  { name: 'Happy', icon: '😊', color: 'from-emerald-500/20 to-teal-500/20' },
  { name: 'Chill', icon: '🌙', color: 'from-blue-500/20 to-indigo-500/20' },
  { name: 'Melancholic', icon: '🌧️', color: 'from-purple-500/20 to-slate-500/20' },
  { name: 'Focus', icon: '🎯', color: 'from-cyan-500/20 to-blue-500/20' },
  { name: 'Party', icon: '🎉', color: 'from-pink-500/20 to-rose-500/20' },
];

export default function HomePage() {
  const { user } = useAuth();
  const { playSong } = useAudioPlayer();
  const navigate = useNavigate();

  const [currentMood, setCurrentMood] = useState('Energetic');
  const [recommendations, setRecommendations] = useState([]);
  const [popularSongs, setPopularSongs] = useState([]);
  const [recentHistory, setRecentHistory] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [recStrategy, setRecStrategy] = useState('');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    if (user?.preference?.mood) {
      setCurrentMood(user.preference.mood);
    }
  }, [user]);

  useEffect(() => {
    loadRecommendations(currentMood);
  }, [currentMood, user]);

  useEffect(() => {
    // Load popular songs & history
    api.getSongs({ limit: 6, sort_by: 'energy', order: 'desc' }).then((res) => {
      setPopularSongs(res.songs || []);
    });

    if (user) {
      api.getHistory(5).then((res) => {
        setRecentHistory(res || []);
      }).catch(() => {});
    }
  }, [user]);

  const loadRecommendations = async (mood) => {
    setLoadingRecs(true);
    try {
      const data = await api.getRecommendations({ mood, limit: 8 });
      setRecommendations(data.recommendations || []);
      setRecStrategy(data.strategy_used || 'Demographic Hybrid Engine');
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecs(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-slate-900 border border-purple-500/20 p-6 lg:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Demographic Music Intelligence</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
            {greeting}, {user?.name || 'Listener'}!
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Curated music based on your{' '}
            <span className="text-cyan-300 font-semibold">{user?.age_group || 'Young Adult'}</span> cohort (Age {user?.age || 24}),
            harmonized with audio danceability, tempo, and valence signatures.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <NavLink
              to="/recommendations"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-lg shadow-purple-600/30 transition flex items-center space-x-2"
            >
              <span>Explore AI Recommendations</span>
              <ArrowRight className="w-4 h-4" />
            </NavLink>

            <NavLink
              to="/age-detector"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 font-semibold text-xs text-slate-200 border border-white/10 transition flex items-center space-x-2"
            >
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>AI Age Estimator</span>
            </NavLink>
          </div>
        </div>

        {/* Ambient backdrop graphics */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-purple-500/10 to-transparent pointer-events-none"></div>
      </div>

      {/* Mood Selector Switcher */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>Filter by Current Mood</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-purple-300 border border-white/5 font-normal">
              Active: {currentMood}
            </span>
          </h2>
          <button
            onClick={() => loadRecommendations(currentMood)}
            className="text-xs text-slate-400 hover:text-purple-400 flex items-center space-x-1 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingRecs ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {MOODS.map((m) => {
            const isSelected = currentMood.toLowerCase() === m.name.toLowerCase();
            return (
              <button
                key={m.name}
                onClick={() => setCurrentMood(m.name)}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isSelected
                    ? 'bg-purple-600/25 border-purple-500/50 shadow-lg shadow-purple-900/20'
                    : 'bg-[#121420] border-white/5 hover:border-white/15'
                }`}
              >
                <div className="text-2xl mb-1">{m.icon}</div>
                <div className={`text-xs font-bold ${isSelected ? 'text-purple-300' : 'text-slate-300'}`}>
                  {m.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommended for You Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Recommended for You</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Strategy: <span className="text-purple-300">{recStrategy}</span>
            </p>
          </div>
          <NavLink
            to="/recommendations"
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>

        {loadingRecs ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400">Computing age-demographic affinity vectors...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#121420] border border-white/5 text-center text-slate-400 text-xs">
            No recommendations found for this mood filter. Try selecting another mood.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {recommendations.map((song) => (
              <SongCard key={song.id} song={song} queueList={recommendations} />
            ))}
          </div>
        )}
      </div>

      {/* Recently Played History (if available) */}
      {recentHistory.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span>Recently Played</span>
            </h2>
            <NavLink
              to="/history"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>Full History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {recentHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => playSong(item.song)}
                className="group p-2.5 rounded-xl bg-[#121420] border border-white/5 hover:border-purple-500/30 flex items-center space-x-3 cursor-pointer transition"
              >
                <img
                  src={item.song.cover_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80'}
                  alt={item.song.title}
                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                />
                <div className="truncate flex-1">
                  <div className="text-xs font-semibold text-white group-hover:text-purple-400 truncate">
                    {item.song.title}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{item.song.artist}</div>
                </div>
                <Play className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Hits Across Genres */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <span>High Energy Anthems</span>
          </h2>
          <NavLink
            to="/explore"
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center space-x-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {popularSongs.map((song) => (
            <SongCard key={song.id} song={song} queueList={popularSongs} />
          ))}
        </div>
      </div>
    </div>
  );
}
