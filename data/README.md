# MusicMind AI – Dataset Documentation

## Overview
This folder contains the seed dataset used by the recommendation engine and database initialization process.

* **File**: `sample_songs.csv`
* **Total Records**: 64 curated tracks
* **Genres Represented**: Pop, Rock, Classic Rock, Hip-Hop, Indie, EDM, R&B, Classical, Jazz, Folk, Soul, Bollywood, Synthwave, Acoustic, Lo-Fi, Latin, Electronic, Ambient
* **Eras Covered**: 1680s (Baroque classical) through 2024 (Modern Pop/EDM)

---

## Dataset Schema

| Column | Type | Range / Format | Description |
|---|---|---|---|
| `title` | String | - | Title of the track |
| `artist` | String | - | Performing artist or composer |
| `genre` | String | - | Musical genre classification |
| `language` | String | English, Hindi, Spanish, Instrumental | Song lyrics language |
| `release_year` | Integer | 1680 – 2026 | Original track release year |
| `tempo` | Float | 50.0 – 200.0 BPM | Musical tempo in beats per minute |
| `energy` | Float | 0.0 – 1.0 | Perceptual measure of acoustic intensity and activity |
| `valence` | Float | 0.0 – 1.0 | Musical positiveness and cheerfulness conveyed |
| `danceability` | Float | 0.0 – 1.0 | Suitability for dancing based on tempo, rhythm stability, beat strength |
| `target_age_group` | String | Teen, Young Adult, Adult, Middle-aged, Senior | Primary demographic cohort resonance |
| `cover_image` | URL | High-res Unsplash album image | Curated album art graphic |
| `audio_url` | URL | Audio stream link / MP3 preview | Audio stream link for playback |
| `external_url` | URL | Spotify link | External Spotify / streaming platform URL |

---

## Expanding or Replacing with External Datasets

To replace or expand this dataset with real-world datasets:
1. **Spotify Million Playlist Dataset / Spotify Web API**:
   - Extract audio features (`tempo`, `energy`, `valence`, `danceability`, `speechiness`) using Spotify's `/v1/audio-features` endpoint.
   - Map Spotify track IDs to `external_url` (`https://open.spotify.com/track/{id}`).
2. **Million Song Dataset (MSD)**:
   - Normalize tempo and energy attributes to standard $[0, 1]$ intervals.
3. Save the resulting CSV as `data/sample_songs.csv` adhering to the column headers above and run `python -m app.db.seed` in the backend directory.
