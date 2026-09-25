import React, { useState, useEffect } from 'react';
import {
  Sparkles, SlidersHorizontal, RefreshCw, Filter, Music,
  Calendar, Zap, Volume2, Globe, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import SongCard from '../components/SongCard';

const MOODS = ['Energetic', 'Happy', 'Chill', 'Melancholic', 'Focus', 'Party'];

function getAgeGroupDetails(age) {
  const n = parseInt(age, 10);
  if (n <= 19) return { name: 'Teen', tag: '13-19', desc: 'Pop, Hip-Hop, Fast Beats, Dynamic' };
  if (n <= 29) return { name: 'Young Adult', tag: '20-29', desc: 'EDM, Indie, R&B, Modern Pop' };
  if (n <= 45) return { name: 'Adult', tag: '30-45', desc: 'Rock, Melodic Pop, Acoustic' };
  if (n <= 60) return { name: 'Middle-aged', tag: '46-60', desc: 'Classic Rock, Jazz, Retro Hits' };
  return { name: 'Senior', tag: '61+', desc: 'Classical, Golden Oldies, Acoustic' };
}

export default function RecommendationsPage() {
  const { user } = useAuth();

  const [age, setAge] = useState(user?.age || 24);
  const [mood, setMood] = useState('Energetic');
  const [language, setLanguage] = useState('All');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [availableGenres, setAvailableGenres] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [minEnergy, setMinEnergy] = useState(0.0);
  const [minTempo, setMinTempo] = useState(50);
  const [limit, setLimit] = useState(12);

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const ageGroup = getAgeGroupDetails(age);

  useEffect(() => {
    // Load metadata
    api.getGenres().then((res) => setAvailableGenres(res || []));
    api.getLanguages().then((res) => setAvailableLanguages(['All', ...(res || [])]));

    if (user?.preference) {
      if (user.preference.mood) setMood(user.preference.mood);
      if (user.preference.preferred_genres) setSelectedGenres(user.preference.preferred_genres);
      if (user.preference.preferred_language) setLanguage(user.preference.preferred_language);
    }
  }, [user]);

  useEffect(() => {
    handleGenerate();
  }, [age, mood]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await api.generateCustomRecommendations({
        age: parseInt(age, 10),
        mood,
        preferred_genres: selectedGenres.length > 0 ? selectedGenres : undefined,
        preferred_language: language !== 'All' ? language : undefined,
        min_energy: minEnergy > 0 ? minEnergy : undefined,
        min_tempo: minTempo > 50 ? minTempo : undefined,
        limit,
      });
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white flex items-center space-x-2.5">
            <Sparkles className="w-7 h-7 text-purple-400" />
            <span>AI Music Recommendations</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Multimodal recommendation blending your age cohort, mood vectors, and audio feature cosine similarities.
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="self-start md:self-auto px-4 py-2 rounded-xl bg-[#141624] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-2 transition"
        >
          <SlidersHorizontal className="w-4 h-4 text-purple-400" />
          <span>{showFilters ? 'Hide Advanced Controls' : 'Show Advanced Audio Controls'}</span>
        </button>
      </div>

      {/* Main Interactive Tuning Dashboard */}
      <div className="p-6 rounded-3xl bg-[#11131e]/90 border border-purple-500/20 shadow-xl space-y-6">
        {/* Row 1: Age Demographic Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-slate-200">Target Listener Age:</span>
              <span className="text-sm font-extrabold text-purple-300">{age} years old</span>
            </div>

            <div className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/50 text-xs font-bold text-cyan-300">
              {ageGroup.name} Cohort ({ageGroup.tag})
            </div>
          </div>

          <input
            type="range"
            min="13"
            max="85"
            value={age}
            onChange={(e) => setAge(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />

          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Demographic Baseline: <span className="text-slate-300 font-medium">{ageGroup.desc}</span></span>
            <span className="text-slate-500">Slide to test different age groups</span>
          </div>
        </div>

        {/* Row 2: Mood Buttons */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-2">Target Musical Mood</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {MOODS.map((m) => {
              const isSelected = mood === m;
              return (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                      : 'bg-[#181b2a] text-slate-300 border-white/5 hover:border-white/20'
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced Filters Expandable */}
        {showFilters && (
          <div className="pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {/* Preferred Language */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Language Preference</span>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-[#181b2a] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                {availableLanguages.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Energy Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                <span>Minimum Energy:</span>
                <span className="text-purple-300">{Math.round(minEnergy * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.9"
                step="0.05"
                value={minEnergy}
                onChange={(e) => setMinEnergy(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Min Tempo BPM */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                <span>Minimum Tempo:</span>
                <span className="text-purple-300">{minTempo} BPM</span>
              </div>
              <input
                type="range"
                min="50"
                max="160"
                step="5"
                value={minTempo}
                onChange={(e) => setMinTempo(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Genre Filter Pills */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Genre Filter (Leave blank to use age group defaults)
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                {availableGenres.map((g) => {
                  const selected = selectedGenres.includes(g);
                  return (
                    <button
                      key={g}
                      onClick={() => toggleGenre(g)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                        selected
                          ? 'bg-purple-600 text-white'
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
        )}

        {/* Generate / Refresh Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center space-x-2 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Generate Recommendations</span>
          </button>
        </div>
      </div>

      {/* Results Header */}
      {results && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-slate-300">
              Generated {results.count} songs for{' '}
              <span className="text-purple-300 font-bold">{results.detected_age_group}</span> cohort
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">
              Mood: <span className="text-cyan-300 font-medium">{results.mood}</span>
            </span>
          </div>

          <div className="px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/40 text-purple-300 text-[11px] font-medium">
            Engine: {results.strategy_used}
          </div>
        </div>
      )}

      {/* Recommended Songs Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400">Computing multidimensional cosine similarities...</p>
        </div>
      ) : results && results.recommendations.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {results.recommendations.map((song) => (
            <SongCard key={song.id} song={song} queueList={results.recommendations} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-[#121420] border border-white/5 text-slate-400 text-xs">
          No songs matched all the selected filters. Try loosening the energy or tempo constraints.
        </div>
      )}
    </div>
  );
}
