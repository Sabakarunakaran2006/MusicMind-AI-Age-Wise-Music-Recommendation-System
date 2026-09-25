# MusicMind AI – REST API Documentation

Base URL: `http://localhost:8000/api`

Interactive Swagger UI: `http://localhost:8000/docs`  
Interactive ReDoc: `http://localhost:8000/redoc`

All protected endpoints require the HTTP Header:
```http
Authorization: Bearer <access_token>
```

---

## 1. Authentication Endpoints

### 1.1 Register Listener
* **Endpoint**: `POST /auth/register`
* **Access**: Public
* **Payload**:
```json
{
  "name": "Jordan Lee",
  "email": "jordan@example.com",
  "password": "Password123!",
  "age": 22,
  "preferred_language": "English",
  "preferred_genres": ["Indie", "Pop", "Synthwave"]
}
```
* **Response** `(201 Created)`:
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": {
    "id": 3,
    "name": "Jordan Lee",
    "email": "jordan@example.com",
    "role": "listener",
    "age": 22,
    "age_group": "Young Adult",
    "is_active": true,
    "created_at": "2026-09-25T10:30:00Z",
    "preference": {
      "preferred_genres": ["Indie", "Pop", "Synthwave"],
      "preferred_language": "English",
      "mood": "Energetic",
      "listening_purpose": "Relaxation",
      "explicit_content": false
    }
  }
}
```

### 1.2 Login
* **Endpoint**: `POST /auth/login`
* **Access**: Public
* **Payload**:
```json
{
  "email": "listener@musicmind.ai",
  "password": "ListenerPassword123!"
}
```

### 1.3 Current User Profile
* **Endpoint**: `GET /auth/me`
* **Access**: Protected (Listener / Admin)

---

## 2. Recommendation Endpoints

### 2.1 Get Personalized Recommendations
* **Endpoint**: `GET /recommendations?limit=10&mood=Energetic&genre=Pop`
* **Access**: Protected (Listener)
* **Response**:
```json
{
  "user_age": 24,
  "detected_age_group": "Young Adult",
  "mood": "Energetic",
  "strategy_used": "Hybrid Warm-Start (Interactions + Demographic Priors)",
  "count": 10,
  "recommendations": [
    {
      "id": 1,
      "title": "Blinding Lights",
      "artist": "The Weeknd",
      "genre": "Synthwave",
      "language": "English",
      "release_year": 2020,
      "tempo": 171.0,
      "energy": 0.73,
      "valence": 0.33,
      "danceability": 0.51,
      "target_age_group": "Young Adult",
      "cover_image": "https://images.unsplash.com/...",
      "audio_url": "https://...",
      "is_favorite": true,
      "similarity_score": 95.8,
      "recommendation_reason": "Matches your 'Synthwave' genre taste • Fits your 'Energetic' mood • Popular among Young Adults (24 yrs)",
      "age_alignment": "Optimal for Young Adult"
    }
  ]
}
```

### 2.2 Interactive Custom Recommendation Generator
* **Endpoint**: `POST /recommendations/generate`
* **Access**: Public or Protected (Optional user)
* **Payload**:
```json
{
  "age": 18,
  "mood": "Party",
  "preferred_genres": ["Pop", "Hip-Hop"],
  "min_energy": 0.6,
  "min_tempo": 120,
  "limit": 10
}
```

### 2.3 Explain Recommendation
* **Endpoint**: `GET /recommendations/explain/{song_id}`
* **Access**: Protected (Listener)
* **Response**:
```json
{
  "song_id": 1,
  "title": "Blinding Lights",
  "artist": "The Weeknd",
  "user_demographics": {
    "age": 24,
    "age_group": "Young Adult",
    "age_group_traits": "Diverse genres, EDM, indie, R&B, modern pop"
  },
  "audio_feature_analysis": {
    "tempo_bpm": 171.0,
    "energy_level": "73%",
    "valence_positivity": "33%",
    "danceability": "51%"
  },
  "matching_factors": {
    "genre_affinity": "Direct match",
    "age_group_fit": "Optimal resonance with Young Adult cohort",
    "mood_synergy": "Audio attributes match 'Energetic' profile"
  },
  "summary": "Recommended because 'Blinding Lights' matches your Energetic listening preference with 73% energy, aligning with popular tracks for listeners aged 24 (Young Adult)."
}
```

---

## 3. Songs & Exploration Endpoints

* `GET /songs`: List songs with pagination, search, genre filter, language filter, release year filter, sort order.
* `GET /songs/{id}`: Retrieve single track metadata with user favorite status.
* `GET /songs/meta/genres`: List distinct genres available in catalog.
* `GET /songs/meta/languages`: List distinct languages available in catalog.
* `GET /songs/meta/moods`: List supported mood presets.

---

## 4. Playlists & Library Endpoints

* `GET /playlists`: List current user's playlists with song counts.
* `POST /playlists`: Create new playlist.
* `GET /playlists/{id}`: Get playlist songs and details.
* `PUT /playlists/{id}`: Update playlist name, description, privacy.
* `DELETE /playlists/{id}`: Delete playlist.
* `POST /playlists/{id}/songs`: Add song to playlist.
* `DELETE /playlists/{id}/songs/{song_id}`: Remove song from playlist.

---

## 5. Favorites & History Endpoints

* `GET /favorites`: Retrieve user's saved favorite songs.
* `POST /favorites/{song_id}`: Add song to favorites.
* `DELETE /favorites/{song_id}`: Remove song from favorites.
* `GET /history?limit=50`: Retrieve chronological listening event history.
* `POST /history`: Record play event.
* `DELETE /history`: Clear user history.

---

## 6. Feedback Endpoints

* `POST /feedback`: Submit 1-5 star rating and category comment.
* `GET /feedback/me`: List feedback submitted by current user.
* `GET /feedback/song/{song_id}`: Get user's feedback for a specific song.

---

## 7. Admin Endpoints (RBAC: role == 'admin')

* `GET /admin/overview`: Real database metrics (user count, song count, playlists, feedback, active model).
* `GET /admin/users`: Search, filter, and inspect user accounts.
* `PUT /admin/users/{user_id}`: Update active status (suspend/activate) and role (listener/admin).
* `POST /admin/songs`: Add new song with full audio vector features.
* `PUT /admin/songs/{song_id}`: Edit song features and metadata.
* `DELETE /admin/songs/{song_id}`: Delete song from library.
* `GET /admin/age-groups`: List age cohort boundaries.
* `PUT /admin/age-groups/{id}`: Modify cohort boundary limits.
* `GET /admin/genres`: List genres with live catalog counts.
* `POST /admin/genres`: Create new genre tag.
* `GET /admin/model-metrics?k=10`: Retrieve empirical evaluation metrics (Precision@K, Recall@K, NDCG, Coverage, MRR).
* `POST /admin/evaluate-model?k=10`: Run live evaluation job against database test interactions.
