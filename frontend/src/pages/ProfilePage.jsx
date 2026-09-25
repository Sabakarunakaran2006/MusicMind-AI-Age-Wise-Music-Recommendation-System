import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Globe, Sparkles, Sliders, Shield, Trash2, Check, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

const GENRE_LIST = [
  'Pop', 'Rock', 'Hip-Hop', 'Indie', 'EDM', 'R&B',
  'Classic Rock', 'Jazz', 'Classical', 'Acoustic', 'Bollywood', 'Synthwave', 'Lo-Fi', 'Latin'
];

function getCohort(age) {
  const n = parseInt(age, 10);
  if (isNaN(n) || n <= 0) return 'Unknown';
  if (n <= 19) return 'Teen (13-19)';
  if (n <= 29) return 'Young Adult (20-29)';
  if (n <= 45) return 'Adult (30-45)';
  if (n <= 60) return 'Middle-aged (46-60)';
  return 'Senior (61+)';
}

export default function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [age, setAge] = useState(24);
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState('English');
  const [mood, setMood] = useState('Energetic');
  const [listeningPurpose, setListeningPurpose] = useState('Relaxation');
  const [explicitContent, setExplicitContent] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAge(user.age || 24);
      if (user.preference) {
        setLanguage(user.preference.preferred_language || 'English');
        setMood(user.preference.mood || 'Energetic');
        setListeningPurpose(user.preference.listening_purpose || 'Relaxation');
        setExplicitContent(user.preference.explicit_content || false);
        setSelectedGenres(user.preference.preferred_genres || []);
      }
    }
  }, [user]);

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Update basic profile info
      await api.updateProfile({
        name: name.trim(),
        age: parseInt(age, 10),
        password: password.trim() ? password.trim() : undefined,
      });

      // 2. Update preferences
      await api.updatePreferences({
        preferred_language: language,
        mood,
        listening_purpose: listeningPurpose,
        explicit_content: explicitContent,
        preferred_genres: selectedGenres,
      });

      await refreshUser();
      showToast('Profile and recommendation preferences updated!', 'success');
      setPassword('');
    } catch (err) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you absolutely certain? This will delete your profile, playlists, and favorites.')) return;
    try {
      await api.deleteAccount();
      logout(false);
      showToast('Your account was deleted', 'info');
      navigate('/login');
    } catch (err) {
      showToast(err.message || 'Failed to delete account', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-black text-white flex items-center space-x-2.5">
          <User className="w-7 h-7 text-purple-400" />
          <span>Profile & Listening Preferences</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Adjust demographic parameters and audio style affinities to tune your personalized model.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Basic Profile Card */}
        <div className="p-6 rounded-3xl bg-[#11131e]/90 border border-white/10 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <User className="w-4 h-4 text-purple-400" />
            <span>Listener Demographics</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#181b2a] border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-[#181b2a]/50 border border-white/5 rounded-xl px-3 py-2.5 text-slate-400 cursor-not-allowed"
              />
            </div>

            {/* Age Input & Live Cohort Badge */}
            <div className="md:col-span-2 p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>Age: <span className="text-purple-300 font-bold">{age} years</span></span>
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/40">
                  Target Cohort: {getCohort(age)}
                </span>
              </div>

              <input
                type="range"
                min="13"
                max="90"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <p className="text-[11px] text-slate-400">
                Updating your age dynamically shifts the demographic baseline in the AI recommender.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                New Password (leave blank to keep current)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#181b2a] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Music Preferences Card */}
        <div className="p-6 rounded-3xl bg-[#11131e]/90 border border-white/10 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>AI Model Preference Weights</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Preferred Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-[#181b2a] border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Spanish">Spanish</option>
                <option value="Instrumental">Instrumental</option>
                <option value="All">All Languages</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Default Mood</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full bg-[#181b2a] border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="Energetic">Energetic</option>
                <option value="Happy">Happy</option>
                <option value="Chill">Chill</option>
                <option value="Melancholic">Melancholic</option>
                <option value="Focus">Focus</option>
                <option value="Party">Party</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Primary Purpose</label>
              <select
                value={listeningPurpose}
                onChange={(e) => setListeningPurpose(e.target.value)}
                className="w-full bg-[#181b2a] border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="Relaxation">Relaxation</option>
                <option value="Work/Study">Work / Study</option>
                <option value="Workout">Workout / Fitness</option>
                <option value="Daily Drive">Commute / Drive</option>
                <option value="Party">Party / Social</option>
              </select>
            </div>
          </div>

          {/* Favorite Genres Chips */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Favorite Genres
            </label>
            <div className="flex flex-wrap gap-2">
              {GENRE_LIST.map((g) => {
                const isSelected = selectedGenres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'bg-[#181b2a] text-slate-400 border border-white/5 hover:text-white'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="px-4 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center space-x-2 transition disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
