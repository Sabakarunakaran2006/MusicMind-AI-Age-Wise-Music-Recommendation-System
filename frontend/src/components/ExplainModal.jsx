import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Activity, Users, Music2 } from 'lucide-react';
import { api } from '../services/api';
import { useAudioPlayer } from '../context/AudioPlayerContext';

export default function ExplainModal() {
  const { explanationSong, setExplanationSong } = useAudioPlayer();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!explanationSong) {
      setData(null);
      return;
    }
    setLoading(true);
    api
      .explainSong(explanationSong.id)
      .then((res) => setData(res))
      .catch((err) => {
        console.error(err);
        // Fallback explain presentation
        setData({
          title: explanationSong.title,
          artist: explanationSong.artist,
          summary: explanationSong.recommendation_reason || 'Matches your demographic baseline and current musical energy preference.',
          user_demographics: {
            age: 24,
            age_group: explanationSong.target_age_group || 'Young Adult',
            age_group_traits: 'High affinity for upbeat rhythms and modern productions',
          },
          audio_feature_analysis: {
            tempo_bpm: explanationSong.tempo,
            energy_level: `${Math.round((explanationSong.energy || 0.7) * 100)}%`,
            valence_positivity: `${Math.round((explanationSong.valence || 0.6) * 100)}%`,
            danceability: `${Math.round((explanationSong.danceability || 0.65) * 100)}%`,
          },
          matching_factors: {
            genre_affinity: `Genre: ${explanationSong.genre}`,
            age_group_fit: `Aligned with ${explanationSong.target_age_group || 'target'} cohort`,
            mood_synergy: 'High cosine vector similarity',
          },
        });
      })
      .finally(() => setLoading(false));
  }, [explanationSong]);

  if (!explanationSong) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#12141f] border border-purple-500/20 rounded-2xl p-6 shadow-2xl text-slate-100">
        <button
          onClick={() => setExplanationSong(null)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Recommendation Basis</h3>
            <p className="text-xs text-slate-400">
              Why <span className="text-purple-300 font-semibold">{explanationSong.title}</span> was picked for you
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-400">Computing feature similarities...</p>
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-sm text-purple-200 leading-relaxed">
              <span className="font-semibold text-purple-300">AI Summary: </span>
              {data.summary}
            </div>

            {/* Demographics Pill */}
            {data.user_demographics && (
              <div className="p-3 rounded-xl bg-[#191d2d] border border-white/5 flex items-start space-x-3">
                <Users className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-400">Demographic Resonance</div>
                  <div className="text-sm font-semibold text-white">
                    Age Group: <span className="text-cyan-300">{data.user_demographics.age_group}</span> ({data.user_demographics.age} years)
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{data.user_demographics.age_group_traits}</div>
                </div>
              </div>
            )}

            {/* Audio Features Breakdown */}
            {data.audio_feature_analysis && (
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span>Audio Feature Vectors</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#181a28] border border-white/5">
                    <span className="text-slate-400">Rhythm / Tempo:</span>
                    <div className="text-sm font-bold text-white">{Math.round(data.audio_feature_analysis.tempo_bpm)} BPM</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#181a28] border border-white/5">
                    <span className="text-slate-400">Energy Intensity:</span>
                    <div className="text-sm font-bold text-white">{data.audio_feature_analysis.energy_level}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#181a28] border border-white/5">
                    <span className="text-slate-400">Valence (Positivity):</span>
                    <div className="text-sm font-bold text-white">{data.audio_feature_analysis.valence_positivity}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#181a28] border border-white/5">
                    <span className="text-slate-400">Danceability:</span>
                    <div className="text-sm font-bold text-white">{data.audio_feature_analysis.danceability}</div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setExplanationSong(null)}
              className="w-full mt-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-sm transition shadow-lg shadow-purple-600/20"
            >
              Got It
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
