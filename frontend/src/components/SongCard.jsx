import React, { useState } from 'react';
import { Play, Pause, Heart, Plus, Sparkles, MessageSquare, ExternalLink } from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import AddToPlaylistModal from './AddToPlaylistModal';
import FeedbackModal from './FeedbackModal';

export default function SongCard({ song, queueList = [] }) {
  const { currentSong, isPlaying, playSong, togglePlay, setExplanationSong } = useAudioPlayer();
  const { showToast } = useToast();

  const [isFavorite, setIsFavorite] = useState(song.is_favorite || false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const isCurrent = currentSong?.id === song.id;
  const isThisPlaying = isCurrent && isPlaying;

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, queueList.length > 0 ? queueList : [song]);
    }
  };

  const handleFavoriteToggle = async (e) => {
    e.stopPropagation();
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    try {
      if (nextState) {
        await api.addFavorite(song.id);
        showToast(`Saved '${song.title}' to Favorites`, 'success');
      } else {
        await api.removeFavorite(song.id);
        showToast(`Removed from Favorites`, 'info');
      }
    } catch (err) {
      setIsFavorite(!nextState); // Rollback
      showToast(err.message || 'Failed to update favorite', 'error');
    }
  };

  return (
    <>
      <div className="group relative bg-[#121420]/80 hover:bg-[#181b2c] border border-white/5 hover:border-purple-500/30 rounded-2xl p-3.5 transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/10 flex flex-col justify-between">
        {/* Cover Art Image */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 mb-3 shadow-md">
          <img
            src={song.cover_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80'}
            alt={song.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Similarity score pill if available */}
          {song.similarity_score !== undefined && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-950/80 backdrop-blur-md border border-purple-500/40 text-purple-200 flex items-center space-x-1 shadow-sm">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>{Math.round(song.similarity_score)}% Match</span>
            </div>
          )}

          {/* Quick Play/Pause button on hover or active */}
          <button
            onClick={handlePlayClick}
            className={`absolute bottom-2.5 right-2.5 p-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-xl shadow-purple-600/40 transition-all transform ${
              isThisPlaying ? 'scale-100 opacity-100' : 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
            }`}
          >
            {isThisPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>
        </div>

        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <h4
              onClick={handlePlayClick}
              className={`text-sm font-semibold truncate cursor-pointer hover:underline ${
                isCurrent ? 'text-purple-400' : 'text-slate-100'
              }`}
            >
              {song.title}
            </h4>
            <button
              onClick={handleFavoriteToggle}
              className={`p-1 rounded-full transition ${
                isFavorite ? 'text-rose-500' : 'text-slate-500 hover:text-slate-300'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          <p className="text-xs text-slate-400 truncate mb-2">{song.artist}</p>

          {/* Recommendation Reason Badge if present */}
          {song.recommendation_reason && (
            <div className="mb-2.5 px-2 py-1 rounded-md bg-purple-950/30 border border-purple-800/30 text-[10px] text-purple-300 leading-tight line-clamp-2">
              💡 {song.recommendation_reason}
            </div>
          )}

          {/* Metadata Tags */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-slate-300">
              {song.genre}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
              {song.release_year}
            </span>
            {song.target_age_group && (
              <span className="px-1.5 py-0.5 rounded bg-cyan-950/50 border border-cyan-800/40 text-cyan-300 font-medium">
                {song.target_age_group}
              </span>
            )}
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-slate-400 text-xs">
          <button
            onClick={() => setShowPlaylistModal(true)}
            className="flex items-center space-x-1 hover:text-purple-400 transition"
            title="Add to Playlist"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[11px]">Playlist</span>
          </button>

          <button
            onClick={() => setShowFeedbackModal(true)}
            className="flex items-center space-x-1 hover:text-amber-400 transition"
            title="Rate & Feedback"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="text-[11px]">Rate</span>
          </button>

          <button
            onClick={() => setExplanationSong(song)}
            className="flex items-center space-x-1 hover:text-cyan-400 transition"
            title="Explain recommendation"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[11px]">Why?</span>
          </button>
        </div>
      </div>

      <AddToPlaylistModal
        song={song}
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
      />

      <FeedbackModal
        song={song}
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </>
  );
}
