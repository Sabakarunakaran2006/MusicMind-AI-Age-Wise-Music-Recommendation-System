import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, Calendar, Globe, Music2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const GENRE_OPTIONS = [
  'Pop', 'Rock', 'Hip-Hop', 'Indie', 'EDM', 'R&B',
  'Classic Rock', 'Jazz', 'Classical', 'Acoustic', 'Bollywood', 'Synthwave', 'Latin', 'Lo-Fi'
];

function calculateAgeGroup(age) {
  const n = parseInt(age, 10);
  if (isNaN(n) || n <= 0) return null;
  if (n <= 19) return { name: 'Teen', desc: 'High energy, trending pop, hip-hop, dynamic beats' };
  if (n <= 29) return { name: 'Young Adult', desc: 'Diverse genres, EDM, indie, R&B, modern pop' };
  if (n <= 45) return { name: 'Adult', desc: 'Melodic pop, rock classics, acoustic depth' };
  if (n <= 60) return { name: 'Middle-aged', desc: 'Classic rock, jazz, soul, retro favorites' };
  return { name: 'Senior', desc: 'Classical, golden oldies, relaxing acoustic' };
}

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState(21);
  const [language, setLanguage] = useState('English');
  const [selectedGenres, setSelectedGenres] = useState(['Pop', 'Indie']);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const ageGroup = calculateAgeGroup(age);

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        age: parseInt(age, 10),
        preferred_language: language,
        preferred_genres: selectedGenres,
      });
      navigate('/');
    } catch (err) {
      // Handled in context toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080e] flex items-center justify-center p-4 relative overflow-hidden font-sans py-12">
      {/* Background ambient decorative glows */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-lg bg-[#11131e]/90 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-xl shadow-purple-600/30 mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Join MusicMind AI</h1>
          <p className="text-xs text-slate-400 mt-1">
            Personalize recommendations tailored to your age demographic and taste
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full bg-[#181b2a] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#181b2a] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#181b2a] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#181b2a] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Age & Dynamic Demographic Classification */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>Your Age</span>
              </label>
              <span className="text-sm font-bold text-purple-300">{age} years</span>
            </div>

            <input
              type="range"
              min="13"
              max="90"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />

            {ageGroup && (
              <div className="mt-2 p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Classified Cohort: </span>
                  <span className="font-bold text-cyan-300">{ageGroup.name}</span>
                </div>
                <span className="text-[10px] text-purple-300 italic truncate max-w-[200px]">
                  {ageGroup.desc}
                </span>
              </div>
            )}
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Language</label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-[#181b2a] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (Bollywood)</option>
                <option value="Spanish">Spanish (Latin)</option>
                <option value="Instrumental">Instrumental / Ambient</option>
                <option value="All">All Languages</option>
              </select>
            </div>
          </div>

          {/* Preferred Genres Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Favorite Genres (Pick at least 1)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {GENRE_OPTIONS.map((g) => {
                const selected = selectedGenres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      selected
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'bg-[#181b2a] text-slate-400 hover:text-slate-200 border border-white/5'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-xl shadow-purple-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-slate-400">
          Already registered?{' '}
          <NavLink to="/login" className="text-purple-400 font-semibold hover:underline">
            Sign In
          </NavLink>
        </div>
      </div>
    </div>
  );
}
