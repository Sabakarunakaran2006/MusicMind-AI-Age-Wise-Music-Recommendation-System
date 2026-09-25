import React, { useState, useEffect } from 'react';
import { Sliders, Plus, Edit2, Check, X, Layers, Music, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminTaxonomyPage() {
  const [ageGroups, setAgeGroups] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);

  // Edit Age Group Modal
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [minAge, setMinAge] = useState(13);
  const [maxAge, setMaxAge] = useState(19);
  const [description, setDescription] = useState('');

  // Add Genre Modal
  const [showAddGenre, setShowAddGenre] = useState(false);
  const [newGenreName, setNewGenreName] = useState('');
  const [newGenreDesc, setNewGenreDesc] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    loadTaxonomy();
  }, []);

  const loadTaxonomy = async () => {
    setLoading(true);
    try {
      const [agData, genreData] = await Promise.all([
        api.getAgeGroups(),
        api.getAdminGenres(),
      ]);
      setAgeGroups(agData || []);
      setGenres(genreData || []);
    } catch (err) {
      showToast('Failed to load taxonomy data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openEditGroup = (ag) => {
    setEditingGroup(ag);
    setGroupName(ag.name);
    setMinAge(ag.min_age);
    setMaxAge(ag.max_age);
    setDescription(ag.description || '');
  };

  const handleSaveGroup = async (e) => {
    e.preventDefault();
    if (minAge >= maxAge) {
      showToast('Minimum age must be less than maximum age', 'error');
      return;
    }

    try {
      await api.updateAgeGroup(editingGroup.id, {
        name: groupName.trim(),
        min_age: parseInt(minAge, 10),
        max_age: parseInt(maxAge, 10),
        description: description.trim(),
      });
      showToast(`Age group '${groupName}' updated!`, 'success');
      setEditingGroup(null);
      loadTaxonomy();
    } catch (err) {
      showToast(err.message || 'Failed to update age group', 'error');
    }
  };

  const handleCreateGenre = async (e) => {
    e.preventDefault();
    if (!newGenreName.trim()) return;
    try {
      await api.createAdminGenre({
        name: newGenreName.trim(),
        description: newGenreDesc.trim(),
      });
      showToast(`Genre '${newGenreName}' added!`, 'success');
      setNewGenreName('');
      setNewGenreDesc('');
      setShowAddGenre(false);
      loadTaxonomy();
    } catch (err) {
      showToast(err.message || 'Failed to add genre', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-black text-white flex items-center space-x-2.5">
          <Sliders className="w-7 h-7 text-emerald-400" />
          <span>Demographic Cohorts & Genre Taxonomy</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure demographic age boundaries, configure genre mappings, and review catalog representation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Age Groups */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-purple-400" />
              <span>Configured Age Groups</span>
            </h2>
          </div>

          <div className="space-y-3">
            {ageGroups.map((ag) => (
              <div
                key={ag.id}
                className="p-4 rounded-2xl bg-[#11131e]/90 border border-white/5 hover:border-purple-500/30 flex items-center justify-between transition"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">{ag.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 text-[10px] font-bold border border-purple-800/40">
                      {ag.min_age} – {ag.max_age} yrs
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{ag.description}</p>
                </div>

                <button
                  onClick={() => openEditGroup(ag)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                  title="Edit boundaries"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Genres with Song Counts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Music className="w-5 h-5 text-cyan-400" />
              <span>Genre Taxonomy & Distribution</span>
            </h2>

            <button
              onClick={() => setShowAddGenre(true)}
              className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Genre</span>
            </button>
          </div>

          <div className="p-4 rounded-3xl bg-[#11131e]/90 border border-white/5 space-y-2 max-h-[500px] overflow-y-auto">
            {genres.map((g) => (
              <div
                key={g.id}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white text-xs">{g.name}</div>
                  <div className="text-[10px] text-slate-400">{g.description || 'General genre tag'}</div>
                </div>
                <div className="px-2.5 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 font-bold border border-cyan-800/40 text-[11px]">
                  {g.song_count || 0} songs
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Age Group Modal */}
      {editingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#131522] border border-white/10 rounded-3xl p-6 shadow-2xl text-slate-100">
            <button
              onClick={() => setEditingGroup(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Edit Age Cohort</h3>
            <p className="text-xs text-slate-400 mb-4">Adjust age boundary limits and demographic description</p>

            <form onSubmit={handleSaveGroup} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cohort Name</label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full bg-[#181b2a] border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Minimum Age</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={minAge}
                    onChange={(e) => setMinAge(e.target.value)}
                    className="w-full bg-[#181b2a] border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Maximum Age</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={maxAge}
                    onChange={(e) => setMaxAge(e.target.value)}
                    className="w-full bg-[#181b2a] border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description / Tendencies</label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#181b2a] border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingGroup(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-lg shadow-purple-600/30"
                >
                  Save Boundaries
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Genre Modal */}
      {showAddGenre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-[#131522] border border-white/10 rounded-3xl p-6 shadow-2xl text-slate-100">
            <button
              onClick={() => setShowAddGenre(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Create New Genre</h3>
            <p className="text-xs text-slate-400 mb-4">Add a new category to the music classification catalog</p>

            <form onSubmit={handleCreateGenre} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Genre Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ambient Chill"
                  value={newGenreName}
                  onChange={(e) => setNewGenreName(e.target.value)}
                  className="w-full bg-[#181b2a] border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Acoustic description..."
                  value={newGenreDesc}
                  onChange={(e) => setNewGenreDesc(e.target.value)}
                  className="w-full bg-[#181b2a] border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGenre(false)}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-xs text-white shadow-lg shadow-cyan-600/30"
                >
                  Create Genre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
