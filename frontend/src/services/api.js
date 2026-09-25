const API_ROOT = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') : '';
const API_BASE = `${API_ROOT}/api`;

function getAuthHeader() {
  const token = localStorage.getItem('musicmind_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.detail || (typeof data === 'string' ? data : 'Request failed');
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  // Auth
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (payload) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getMe: () => request('/auth/me'),
  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),

  // Users & Preferences
  updateProfile: (payload) =>
    request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  updatePreferences: (payload) =>
    request('/users/me/preferences', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteAccount: () =>
    request('/users/me', {
      method: 'DELETE',
    }),
  estimateAge: async (formData) => {
    const token = localStorage.getItem('musicmind_token');
    const res = await fetch(`${API_BASE}/users/me/estimate-age`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Age estimation failed');
    }
    return res.json();
  },

  // Songs
  getSongs: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return request(`/songs?${query.toString()}`);
  },
  getSong: (id) => request(`/songs/${id}`),
  getGenres: () => request('/songs/meta/genres'),
  getLanguages: () => request('/songs/meta/languages'),
  getMoods: () => request('/songs/meta/moods'),

  // Recommendations
  getRecommendations: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return request(`/recommendations?${query.toString()}`);
  },
  generateCustomRecommendations: (payload) =>
    request('/recommendations/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  explainSong: (songId) => request(`/recommendations/explain/${songId}`),

  // Favorites
  getFavorites: () => request('/favorites'),
  addFavorite: (songId) =>
    request(`/favorites/${songId}`, {
      method: 'POST',
    }),
  removeFavorite: (songId) =>
    request(`/favorites/${songId}`, {
      method: 'DELETE',
    }),

  // Playlists
  getPlaylists: () => request('/playlists'),
  createPlaylist: (payload) =>
    request('/playlists', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getPlaylist: (id) => request(`/playlists/${id}`),
  updatePlaylist: (id, payload) =>
    request(`/playlists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deletePlaylist: (id) =>
    request(`/playlists/${id}`, {
      method: 'DELETE',
    }),
  addSongToPlaylist: (playlistId, songId) =>
    request(`/playlists/${playlistId}/songs`, {
      method: 'POST',
      body: JSON.stringify({ song_id: songId }),
    }),
  removeSongFromPlaylist: (playlistId, songId) =>
    request(`/playlists/${playlistId}/songs/${songId}`, {
      method: 'DELETE',
    }),

  // History
  getHistory: (limit = 50) => request(`/history?limit=${limit}`),
  recordHistory: (songId, eventType = 'play') =>
    request('/history', {
      method: 'POST',
      body: JSON.stringify({ song_id: songId, event_type: eventType }),
    }),
  clearHistory: () =>
    request('/history', {
      method: 'DELETE',
    }),

  // Feedback
  submitFeedback: (payload) =>
    request('/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getMyFeedback: () => request('/feedback/me'),
  getSongFeedback: (songId) => request(`/feedback/song/${songId}`),

  // Admin
  getAdminOverview: () => request('/admin/overview'),
  getAdminUsers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/users${q ? `?${q}` : ''}`);
  },
  updateUserStatus: (userId, payload) =>
    request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  createSong: (payload) =>
    request('/admin/songs', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateSong: (songId, payload) =>
    request(`/admin/songs/${songId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteSong: (songId) =>
    request(`/admin/songs/${songId}`, {
      method: 'DELETE',
    }),
  getAgeGroups: () => request('/admin/age-groups'),
  createAgeGroup: (payload) =>
    request('/admin/age-groups', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateAgeGroup: (id, payload) =>
    request(`/admin/age-groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  getAdminGenres: () => request('/admin/genres'),
  createAdminGenre: (payload) =>
    request('/admin/genres', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getModelMetrics: (k = 10) => request(`/admin/model-metrics?k=${k}`),
  evaluateModel: (k = 10) =>
    request(`/admin/evaluate-model?k=${k}`, {
      method: 'POST',
    }),
  getAllFeedback: (limit = 100) => request(`/admin/feedback?limit=${limit}`),
};
