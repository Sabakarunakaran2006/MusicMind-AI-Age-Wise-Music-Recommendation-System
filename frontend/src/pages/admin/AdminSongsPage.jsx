import React, { useState, useEffect } from 'react';
import { Music, Plus, Search, Edit2, Trash2, X, Check, Activity } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminSongsPage() {
  const [songs, setSongs] = useState([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('Pop');
  const [language, setLanguage] = useState('English');
  const [releaseYear, setReleaseYear] = useState(2023);
  const [tempo, setTempo] = useState(120.0);
  const [energy, setEnergy] = useState(0.7);
  const [valence, setValence] = useState(0.6);
  const [danceability, setDanceability] = useState(0.65);
  const [targetAgeGroup, setTargetAgeGroup] = useState('Young Adult');
  const [coverImage, setCoverImage] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    loadSongs();
  }, [page]);

  const loadSongs = async () => {
    setLoading(true);
    try {
      const data = await api.getSongs({
        query: query.trim() || undefined,
        page,
        limit: 25,
      });
      setSongs(data.songs || []);
      setTotal(data.total || 0);
    } catch (err) {
      showToast('Failed to load songs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadSongs();
  };

  const openAddModal = () => {
    setEditingSong(null);
    setTitle('');
    setArtist('');
    setGenre('Pop');
    setLanguage('English');
    setReleaseYear(2023);
    setTempo(120.0);
    setEnergy(0.7);
    setValence(0.6);
    setDanceability(0.65);
    setTargetAgeGroup('Young Adult');
    setCoverImage('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80');
    setAudioUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    setExternalUrl('https://open.spotify.com');
    setModalOpen(true);
  };

  const openEditModal = (s) => {
    setEditingSong(s);
    setTitle(s.title);
    setArtist(s.artist);
    setGenre(s.genre);
    setLanguage(s.language);
    setReleaseYear(s.release_year);
    setTempo(s.tempo);
    setEnergy(s.energy);
    setValence(s.valence);
    setDanceability(s.danceability);
    setTargetAgeGroup(s.target_age_group || 'Young Adult');
    setCoverImage(s.cover_image || '');
    setAudioUrl(s.audio_url || '');
    setExternalUrl(s.external_url || '');
    setModalOpen(true);
  };

  const handleSaveSong = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: title.trim(),
      artist: artist.trim(),
      genre: genre.trim(),
      language: language.trim(),
      release_year: parseInt(releaseYear, 10),
      tempo: parseFloat(tempo),
      energy: parseFloat(energy),
      valence: parseFloat(valence),
      danceability: parseFloat(danceability),
      target_age_group: targetAgeGroup,
      cover_image: coverImage.trim() || undefined,
      audio_url: audioUrl.trim() || undefined,
      external_url: externalUrl.trim() || undefined,
    };

    try {
      if (editingSong) {
        await api.updateSong(editingSong.id, payload);
        showToast(`Song '${payload.title}' updated successfully`, 'success');
      } else {
        await api.createSong(payload);
        showToast(`Song '${payload.title}' added to catalog!`, 'success');
      }
      setModalOpen(false);
      loadSongs();
    } catch (err) {
      showToast(err.message || 'Failed to save song', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSong = async (id, songTitle) => {
    if (!window.confirm(`Delete '${songTitle}' from the catalog permanently?`)) return;
    try {
      await api.deleteSong(id);
      showToast(`Song deleted`, 'info');
      loadSongs();
    } catch (err) {
      showToast(err.message || 'Failed to delete song', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white flex items-center space-x-2.5">
            <Music className="w-7 h-7 text-cyan-400" />
            <span>Song Catalog Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage songs, tune acoustic vectors, and map tracks to target demographic cohorts.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-lg shadow-purple-600/30 flex items-center space-x-2 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Song</span>
        </button>
      </div>

      {/* Search Header */}
      <div className="p-4 rounded-2xl bg-[#11131e]/90 border border-white/10 flex items-center justify-between text-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search catalog by title or artist..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#181b2a] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
          />
        </form>

        <div className="text-slate-400">Total tracks: <span className="font-bold text-white">{total}</span></div>
      </div>

      {/* Catalog Table */}
      <div className="rounded-3xl bg-[#11131e]/90 border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/5 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Track</th>
                <th className="py-3.5 px-4">Genre / Lang</th>
                <th className="py-3.5 px-4">Cohort Fit</th>
                <th className="py-3.5 px-4">Tempo</th>
                <th className="py-3.5 px-4">Energy</th>
                <th className="py-3.5 px-4">Valence</th>
                <th className="py-3.5 px-4">Danceability</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : songs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    No songs found.
                  </td>
                </tr>
              ) : (
                songs.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={s.cover_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80'}
                          alt={s.title}
                          className="w-9 h-9 rounded-lg object-cover shrink-0"
                        />
                        <div className="truncate max-w-xs">
                          <div className="font-bold text-white truncate">{s.title}</div>
                          <div className="text-[11px] text-slate-400 truncate">{s.artist} ({s.release_year})</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-200">{s.genre}</span>
                      <div className="text-[10px] text-slate-500">{s.language}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-300 text-[10px] font-semibold border border-purple-800/40">
                        {s.target_age_group || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{Math.round(s.tempo)} BPM</td>
                    <td className="py-3 px-4 font-mono text-amber-300">{Math.round(s.energy * 100)}%</td>
                    <td className="py-3 px-4 font-mono text-emerald-300">{Math.round(s.valence * 100)}%</td>
                    <td className="py-3 px-4 font-mono text-cyan-300">{Math.round(s.danceability * 100)}%</td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                        title="Edit song"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSong(s.id, s.title)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                        title="Delete song"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Song Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#131522] border border-white/10 rounded-3xl p-6 shadow-2xl text-slate-100 my-8">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              {editingSong ? 'Edit Song Metadata & Features' : 'Add New Song to Catalog'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Specify acoustic attributes used by the AI cosine vector engine.
            </p>

            <form onSubmit={handleSaveSong} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Song Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#181b2a] border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Artist Name</label>
                  <input
                    type="text"
                    required
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="w-full bg-[#181b2a] border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Genre</label>
                  <input
                    type="text"
                    required
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-[#181b2a] border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Language</label>
                  <input
                    type="text"
                    required
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-[#181b2a] border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Release Year</label>
                  <input
                    type="number"
                    required
                    min="1900"
                    max="2026"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(e.target.value)}
                    className="w-full bg-[#181b2a] border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Age Cohort</label>
                  <select
                    value={targetAgeGroup}
                    onChange={(e) => setTargetAgeGroup(e.target.value)}
                    className="w-full bg-[#181b2a] border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Teen">Teen (13-19)</option>
                    <option value="Young Adult">Young Adult (20-29)</option>
                    <option value="Adult">Adult (30-45)</option>
                    <option value="Middle-aged">Middle-aged (46-60)</option>
                    <option value="Senior">Senior (61+)</option>
                  </select>
                </div>
              </div>

              {/* Acoustic Vector Features */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                <div className="text-xs font-bold text-purple-300 flex items-center space-x-1.5 uppercase tracking-wider">
                  <Activity className="w-3.5 h-3.5 text-purple-400" />
                  <span>Acoustic Vectors (Cosine Similarity Weights)</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Tempo (BPM): {tempo}</label>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      step="1"
                      value={tempo}
                      onChange={(e) => setTempo(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Energy: {Math.round(energy * 100)}%</label>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={energy}
                      onChange={(e) => setEnergy(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Valence: {Math.round(valence * 100)}%</label>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={valence}
                      onChange={(e) => setValence(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Danceability: {Math.round(danceability * 100)}%</label>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={danceability}
                      onChange={(e) => setDanceability(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full bg-[#181b2a] border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Audio Stream / MP3 URL</label>
                  <input
                    type="url"
                    placeholder="https://...song.mp3"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    className="w-full bg-[#181b2a] border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Spotify / External Link</label>
                  <input
                    type="url"
                    placeholder="https://open.spotify.com/track/..."
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    className="w-full bg-[#181b2a] border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-lg shadow-purple-600/30 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingSong ? 'Update Track' : 'Create Track'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
