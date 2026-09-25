import React, { useState, useEffect } from 'react';
import { History, Trash2, Play, Music, Clock } from 'lucide-react';
import { api } from '../services/api';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { useToast } from '../context/ToastContext';

function formatDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const { playSong } = useAudioPlayer();
  const { showToast } = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getHistory(50);
      setHistory(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your listening history?')) return;
    try {
      await api.clearHistory();
      showToast('Listening history cleared', 'info');
      setHistory([]);
    } catch (err) {
      showToast(err.message || 'Failed to clear history', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white flex items-center space-x-2.5">
            <History className="w-7 h-7 text-cyan-400" />
            <span>Listening History</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tracks you played and explored. Used by the recommendation engine for warm-start personalization.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/5 text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-[#121420] border border-white/5 text-slate-400 text-xs">
          No listening events logged yet. Start playing recommendations to populate your history!
        </div>
      ) : (
        <div className="bg-[#11131e]/90 border border-white/10 rounded-3xl p-4 sm:p-6 space-y-2">
          {history.map((item) => (
            <div
              key={item.id}
              className="group flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition border border-transparent hover:border-white/5"
            >
              <div className="flex items-center space-x-3 truncate">
                <img
                  src={item.song.cover_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80'}
                  alt={item.song.title}
                  className="w-11 h-11 rounded-xl object-cover shrink-0"
                />
                <div className="truncate">
                  <div
                    onClick={() => playSong(item.song)}
                    className="text-xs sm:text-sm font-bold text-white group-hover:text-purple-400 truncate cursor-pointer"
                  >
                    {item.song.title}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{item.song.artist}</div>
                </div>
              </div>

              <div className="flex items-center space-x-4 shrink-0 text-xs">
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 text-[10px]">
                  {item.song.genre}
                </span>

                <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{formatDate(item.played_at)}</span>
                </div>

                <button
                  onClick={() => playSong(item.song)}
                  className="p-2 rounded-full bg-purple-600/10 hover:bg-purple-600 text-purple-400 hover:text-white transition"
                  title="Play again"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
