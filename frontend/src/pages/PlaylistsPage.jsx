import React, { useState, useEffect } from 'react';
import {
  Library, Plus, Play, Trash2, Lock, Globe, Music,
  MoreVertical, Clock, Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { useToast } from '../context/ToastContext';
import SongCard from '../components/SongCard';

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);

  const { playSong } = useAudioPlayer();
  const { showToast } = useToast();

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    setLoading(true);
    try {
      const data = await api.getPlaylists();
      setPlaylists(data || []);
      if (data && data.length > 0 && !selectedPlaylist) {
        loadPlaylistDetails(data[0].id);
      }
    } catch (err) {
      showToast('Failed to load playlists', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPlaylistDetails = async (id) => {
    try {
      const data = await api.getPlaylist(id);
      setSelectedPlaylist(data);
    } catch (err) {
      showToast('Failed to load playlist details', 'error');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const created = await api.createPlaylist({
        name: name.trim(),
        description: description.trim(),
        is_private: isPrivate,
      });
      showToast(`Playlist '${created.name}' created!`, 'success');
      setName('');
      setDescription('');
      setShowCreateModal(false);
      await loadPlaylists();
      loadPlaylistDetails(created.id);
    } catch (err) {
      showToast(err.message || 'Failed to create playlist', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;
    try {
      await api.deletePlaylist(id);
      showToast('Playlist deleted', 'info');
      setSelectedPlaylist(null);
      loadPlaylists();
    } catch (err) {
      showToast(err.message || 'Failed to delete playlist', 'error');
    }
  };

  const handleRemoveSong = async (songId) => {
    if (!selectedPlaylist) return;
    try {
      await api.removeSongFromPlaylist(selectedPlaylist.id, songId);
      showToast('Song removed from playlist', 'info');
      loadPlaylistDetails(selectedPlaylist.id);
    } catch (err) {
      showToast(err.message || 'Failed to remove song', 'error');
    }
  };

  const handlePlayAll = () => {
    if (selectedPlaylist && selectedPlaylist.songs && selectedPlaylist.songs.length > 0) {
      playSong(selectedPlaylist.songs[0], selectedPlaylist.songs);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white flex items-center space-x-2.5">
            <Library className="w-7 h-7 text-purple-400" />
            <span>My Playlists</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize and curate your favorite age-recommended anthems.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-lg shadow-purple-600/30 flex items-center space-x-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Main Grid: Left Playlist Navigation, Right Songs List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playlists List */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Your Playlists ({playlists.length})
          </h2>

          <div className="space-y-2">
            {playlists.map((pl) => {
              const isSelected = selectedPlaylist?.id === pl.id;
              return (
                <div
                  key={pl.id}
                  onClick={() => loadPlaylistDetails(pl.id)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? 'bg-purple-600/20 border-purple-500/50 shadow-md'
                      : 'bg-[#121420] border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                      <Music className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-bold text-white truncate">{pl.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
                        <span>{pl.song_count || 0} songs</span>
                        <span>•</span>
                        {pl.is_private ? (
                          <span className="flex items-center text-[10px] text-slate-500">
                            <Lock className="w-2.5 h-2.5 mr-0.5" /> Private
                          </span>
                        ) : (
                          <span className="flex items-center text-[10px] text-cyan-400">
                            <Globe className="w-2.5 h-2.5 mr-0.5" /> Public
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(pl.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 transition rounded-lg hover:bg-rose-500/10"
                    title="Delete Playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            {playlists.length === 0 && !loading && (
              <div className="p-8 rounded-2xl bg-[#121420] border border-white/5 text-center text-xs text-slate-400">
                You haven't created any playlists yet.
              </div>
            )}
          </div>
        </div>

        {/* Selected Playlist Content */}
        <div className="lg:col-span-2">
          {selectedPlaylist ? (
            <div className="rounded-3xl bg-[#11131e]/90 border border-white/10 p-6 space-y-6">
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/30 text-white shrink-0">
                    <Music className="w-10 h-10" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                      Playlist
                    </span>
                    <h2 className="text-2xl font-black text-white">{selectedPlaylist.name}</h2>
                    <p className="text-xs text-slate-400 mt-1 max-w-md">
                      {selectedPlaylist.description || 'Curated listening session'}
                    </p>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {selectedPlaylist.songs?.length || 0} songs in playlist
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePlayAll}
                    disabled={!selectedPlaylist.songs || selectedPlaylist.songs.length === 0}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center space-x-2 transition disabled:opacity-40"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Play All</span>
                  </button>

                  <button
                    onClick={() => handleDelete(selectedPlaylist.id)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/5 transition"
                    title="Delete Playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Songs List */}
              <div className="space-y-2">
                {selectedPlaylist.songs?.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-500">
                    This playlist is currently empty. Explore the catalog and click "+ Playlist" on any song to add it!
                  </div>
                ) : (
                  selectedPlaylist.songs?.map((song, index) => (
                    <div
                      key={song.id}
                      className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition border border-transparent hover:border-white/5"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <span className="w-5 text-center text-xs text-slate-500 font-semibold">
                          {index + 1}
                        </span>
                        <img
                          src={song.cover_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80'}
                          alt={song.title}
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                        <div className="truncate">
                          <div className="text-xs font-bold text-white group-hover:text-purple-400 truncate cursor-pointer"
                            onClick={() => playSong(song, selectedPlaylist.songs)}
                          >
                            {song.title}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">{song.artist}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded bg-white/5 text-slate-300">
                          {song.genre}
                        </span>
                        <span className="text-xs text-slate-500">{Math.round(song.tempo)} BPM</span>
                        <button
                          onClick={() => handleRemoveSong(song.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                          title="Remove from playlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="p-16 rounded-3xl bg-[#11131e]/90 border border-white/10 text-center text-xs text-slate-400">
              Select a playlist from the left or create a new one to view details.
            </div>
          )}
        </div>
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#131522] border border-white/10 rounded-2xl p-6 shadow-2xl text-slate-100">
            <h3 className="text-base font-bold text-white mb-1">Create Playlist</h3>
            <p className="text-xs text-slate-400 mb-4">Give your personalized mix a name and description</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Playlist Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Focus & Coding Waves"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#181b2a] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Brief description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#181b2a] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPrivateCheck"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded bg-slate-800 border-white/10 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="isPrivateCheck" className="text-xs text-slate-300 cursor-pointer">
                  Private Playlist (only visible to you)
                </label>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-lg shadow-purple-600/30"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
