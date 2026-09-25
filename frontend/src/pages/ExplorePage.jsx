import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import SongCard from '../components/SongCard';

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  const [query, setQuery] = useState(initialQuery);
  const [genre, setGenre] = useState('All');
  const [language, setLanguage] = useState('All');
  const [sortBy, setSortBy] = useState('title');
  const [order, setOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [songs, setSongs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [availableGenres, setAvailableGenres] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);

  useEffect(() => {
    api.getGenres().then((res) => setAvailableGenres(['All', ...(res || [])]));
    api.getLanguages().then((res) => setAvailableLanguages(['All', ...(res || [])]));
  }, []);

  useEffect(() => {
    if (initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    fetchSongs();
  }, [query, genre, language, sortBy, order, page]);

  const fetchSongs = async () => {
    setLoading(true);
    try {
      const res = await api.getSongs({
        query: query.trim() || undefined,
        genre: genre !== 'All' ? genre : undefined,
        language: language !== 'All' ? language : undefined,
        sort_by: sortBy,
        order,
        page,
        limit,
      });
      setSongs(res.songs || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-black text-white flex items-center space-x-2.5">
          <Compass className="w-7 h-7 text-cyan-400" />
          <span>Explore Music Catalog</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Browse the full library of tracks across eras, demographics, and acoustic profiles.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-2xl bg-[#11131e]/90 border border-white/10 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search song or artist..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#181b2a] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Genre Filter */}
          <div>
            <select
              value={genre}
              onChange={(e) => {
                setGenre(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#181b2a] border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="All">All Genres</option>
              {availableGenres.filter((g) => g !== 'All').map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#181b2a] border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="All">All Languages</option>
              {availableLanguages.filter((l) => l !== 'All').map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 bg-[#181b2a] border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="title">Sort by Title</option>
              <option value="release_year">Sort by Year</option>
              <option value="tempo">Sort by Tempo</option>
              <option value="energy">Sort by Energy</option>
            </select>
            <button
              onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
              className="p-2 bg-[#181b2a] border border-white/10 rounded-xl text-slate-300 hover:text-white transition"
              title={`Order: ${order}`}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
          <span>Found {total} songs in catalog</span>
          <span>Page {page} of {totalPages}</span>
        </div>
      </div>

      {/* Songs Grid */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : songs.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-[#121420] border border-white/5 text-slate-400 text-xs">
          No songs matched your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} queueList={songs} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-3 pt-4 text-xs font-semibold">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="p-2 rounded-xl bg-[#181b2a] border border-white/10 hover:border-purple-500 disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-slate-300">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="p-2 rounded-xl bg-[#181b2a] border border-white/10 hover:border-purple-500 disabled:opacity-40 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
