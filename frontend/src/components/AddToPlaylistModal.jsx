import React, { useState, useEffect } from 'react';
import { X, Plus, Music, Check } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function AddToPlaylistModal({ song, isOpen, onClose }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadPlaylists();
    }
  }, [isOpen]);

  const loadPlaylists = async () => {
    setLoading(true);
    try {
      const data = await api.getPlaylists();
      setPlaylists(data || []);
    } catch (err) {
      showToast('Failed to load playlists', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !song) return null;

  const handleAddToPlaylist = async (playlistId) => {
    try {
      await api.addSongToPlaylist(playlistId, song.id);
      showToast(`Added '${song.title}' to playlist!`, 'success');
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to add to playlist', 'error');
    }
  };

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    try {
      const created = await api.createPlaylist({
        name: newPlaylistName.trim(),
        description: 'Created with MusicMind AI',
        is_private: true,
      });
      await api.addSongToPlaylist(created.id, song.id);
      showToast(`Playlist created and '${song.title}' added!`, 'success');
      setNewPlaylistName('');
      setShowCreate(false);
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to create playlist', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-[#131522] border border-white/10 rounded-2xl p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-white mb-1">Add to Playlist</h3>
        <p className="text-xs text-slate-400 mb-4 truncate">
          Select playlist for <span className="text-purple-300 font-semibold">{song.title}</span>
        </p>

        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {playlists.length === 0 && !showCreate && (
              <p className="text-xs text-slate-500 py-3 text-center">No playlists found. Create one below!</p>
            )}

            {playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => handleAddToPlaylist(pl.id)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-purple-600/20 hover:border-purple-500/30 border border-transparent transition text-left group"
              >
                <div className="flex items-center space-x-3 truncate">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                    <Music className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-semibold text-slate-200 group-hover:text-white truncate">
                      {pl.name}
                    </div>
                    <div className="text-[11px] text-slate-400">{pl.song_count || 0} songs</div>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-slate-400 group-hover:text-purple-400 shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* Create Playlist inline form */}
        {showCreate ? (
          <form onSubmit={handleCreateAndAdd} className="mt-4 pt-4 border-t border-white/5 space-y-3">
            <input
              type="text"
              placeholder="New playlist name..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full bg-[#1b1e2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              autoFocus
            />
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-md shadow-purple-600/30"
              >
                Create & Add
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            className="w-full mt-4 py-2.5 rounded-xl border border-dashed border-white/20 hover:border-purple-500/50 hover:bg-purple-500/5 flex items-center justify-center space-x-2 text-xs font-medium text-slate-300 hover:text-white transition"
          >
            <Plus className="w-4 h-4 text-purple-400" />
            <span>Create New Playlist</span>
          </button>
        )}
      </div>
    </div>
  );
}
