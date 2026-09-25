import React, { useState, useEffect } from 'react';
import { Heart, Play, Search, Music } from 'lucide-react';
import { api } from '../services/api';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import SongCard from '../components/SongCard';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const { playSong } = useAudioPlayer();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const data = await api.getFavorites();
      setFavorites(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = favorites.filter((s) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q) || s.genre.toLowerCase().includes(q);
  });

  const handlePlayAll = () => {
    if (filtered.length > 0) {
      playSong(filtered[0], filtered);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white flex items-center space-x-2.5">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
            <span>Liked Songs & Favorites</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Your collection of saved tracks ({favorites.length} songs saved)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePlayAll}
            disabled={filtered.length === 0}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-lg shadow-purple-600/30 flex items-center space-x-2 transition disabled:opacity-40"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Play Favorites</span>
          </button>
        </div>
      </div>

      {/* Filter search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter saved favorites..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="w-full bg-[#141624] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Songs Grid */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-[#121420] border border-white/5 text-slate-400 text-xs">
          {filterQuery ? 'No favorites matched your search.' : 'You have not favorited any songs yet. Click the heart icon on any song card to save it!'}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((song) => (
            <SongCard key={song.id} song={{ ...song, is_favorite: true }} queueList={filtered} />
          ))}
        </div>
      )}
    </div>
  );
}
