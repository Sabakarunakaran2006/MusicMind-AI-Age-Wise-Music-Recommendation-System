import React from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Heart, Sparkles, Music2, ExternalLink
} from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    togglePlay,
    playNext,
    playPrevious,
    setVolume,
    toggleMute,
    seekTo,
    setExplanationSong,
  } = useAudioPlayer();

  const { showToast } = useToast();

  if (!currentSong) return null;

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    seekTo(Math.max(0, Math.min(1, pos)));
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d0f18]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Song Info */}
        <div className="flex items-center space-x-3 w-1/4 min-w-[200px]">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 shadow-md">
            <img
              src={currentSong.cover_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80'}
              alt={currentSong.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="truncate">
            <div className="text-sm font-bold text-white truncate flex items-center space-x-1.5">
              <span>{currentSong.title}</span>
              {currentSong.target_age_group && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 font-medium">
                  {currentSong.target_age_group}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 truncate">{currentSong.artist}</div>
          </div>

          <button
            onClick={() => setExplanationSong(currentSong)}
            className="p-1.5 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition shrink-0"
            title="Why this song was recommended"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Controls & Progress */}
        <div className="flex flex-col items-center flex-1 max-w-xl">
          <div className="flex items-center space-x-4 mb-1">
            <button
              onClick={playPrevious}
              className="p-1 text-slate-400 hover:text-white transition"
              title="Previous song"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={togglePlay}
              className="p-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition transform hover:scale-105"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
            </button>
            <button
              onClick={playNext}
              className="p-1 text-slate-400 hover:text-white transition"
              title="Next song"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full flex items-center space-x-2 text-[11px] text-slate-400">
            <span>{formatTime(progress * (duration || 180))}</span>
            <div
              onClick={handleSeek}
              className="relative flex-1 h-1.5 bg-slate-800 rounded-full cursor-pointer group"
            >
              <div
                className="h-full bg-purple-500 rounded-full group-hover:bg-purple-400 transition-all relative"
                style={{ width: `${Math.max(0, Math.min(100, progress * 100))}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow"></div>
              </div>
            </div>
            <span>{formatTime(duration || 180)}</span>
          </div>
        </div>

        {/* Right: Volume & External Link */}
        <div className="flex items-center justify-end space-x-3 w-1/4 min-w-[160px]">
          {currentSong.external_url && (
            <a
              href={currentSong.external_url}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-white/5 transition"
              title="Open in Spotify"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <button
            onClick={toggleMute}
            className="p-1.5 text-slate-400 hover:text-white transition"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>
      </div>
    </footer>
  );
}
