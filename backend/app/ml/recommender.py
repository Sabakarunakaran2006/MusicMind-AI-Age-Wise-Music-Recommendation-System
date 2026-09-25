import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
from sqlalchemy.orm import Session
from app.models.models import Song, User, UserPreference, Favorite, ListeningHistory, Feedback, AgeGroup
from typing import List, Dict, Any, Tuple

# Mood target audio feature profiles (tempo, energy, valence, danceability)
MOOD_PROFILES = {
    "Energetic": {"tempo": 132.0, "energy": 0.88, "valence": 0.75, "danceability": 0.82},
    "Happy": {"tempo": 122.0, "energy": 0.75, "valence": 0.90, "danceability": 0.78},
    "Chill": {"tempo": 92.0, "energy": 0.38, "valence": 0.55, "danceability": 0.50},
    "Melancholic": {"tempo": 84.0, "energy": 0.32, "valence": 0.22, "danceability": 0.42},
    "Focus": {"tempo": 105.0, "energy": 0.42, "valence": 0.50, "danceability": 0.48},
    "Party": {"tempo": 128.0, "energy": 0.92, "valence": 0.85, "danceability": 0.90},
}

# Age-group baseline genre affinities and feature tendencies
AGE_GROUP_PREFERENCES = {
    "Teen": {
        "preferred_genres": ["Pop", "Hip-Hop", "EDM", "Trap", "K-Pop"],
        "min_release_year": 2016,
        "energy_bias": 0.80,
        "danceability_bias": 0.78,
        "description": "Dynamic beats, trending modern pop & hip-hop hits"
    },
    "Young Adult": {
        "preferred_genres": ["Indie", "Alternative", "EDM", "R&B", "Pop", "Synthwave", "Rock"],
        "min_release_year": 2010,
        "energy_bias": 0.72,
        "danceability_bias": 0.70,
        "description": "Eclectic mix of indie, modern alternative, R&B, and electronic anthems"
    },
    "Adult": {
        "preferred_genres": ["Rock", "Alternative", "Pop", "Acoustic", "R&B", "Blues"],
        "min_release_year": 1995,
        "energy_bias": 0.65,
        "danceability_bias": 0.60,
        "description": "Melodic rock, acoustic balance, thoughtful lyrics and 2000s classics"
    },
    "Middle-aged": {
        "preferred_genres": ["Classic Rock", "Jazz", "Soul", "Blues", "Country", "80s Pop"],
        "min_release_year": 1975,
        "energy_bias": 0.58,
        "danceability_bias": 0.55,
        "description": "Timeless rock legends, soul, blues, jazz, and retro favorites"
    },
    "Senior": {
        "preferred_genres": ["Classical", "Golden Oldies", "Folk", "Jazz", "Instrumental"],
        "min_release_year": 1950,
        "energy_bias": 0.42,
        "danceability_bias": 0.45,
        "description": "Orchestral masterpieces, golden era vocals, nostalgic acoustic melodies"
    }
}

class MusicRecommenderEngine:
    """
    Advanced Content-Based & Age-Group Baseline Music Recommendation Engine.
    Handles cold-start (new listeners) and warm-start (listeners with interactions).
    """

    def __init__(self):
        self.scaler = MinMaxScaler()
        self.model_name = "MusicMind Content+Demographic Hybrid"
        self.version = "2.1.0"

    def get_age_group_for_age(self, age: int, db: Session) -> Tuple[str, str]:
        """Classify user's age into the configured AgeGroup."""
        age_groups = db.query(AgeGroup).all()
        for ag in age_groups:
            if ag.min_age <= age <= ag.max_age:
                return ag.name, ag.description

        # Fallback defaults if DB has custom gaps
        if age <= 19:
            return "Teen", "High energy, trending pop, hip-hop, dynamic beats"
        elif age <= 29:
            return "Young Adult", "Diverse genres, EDM, indie, R&B, modern pop"
        elif age <= 45:
            return "Adult", "Melodic pop, rock classics, acoustic depth"
        elif age <= 60:
            return "Middle-aged", "Classic rock, jazz, soul, retro favorites"
        else:
            return "Senior", "Classical, golden oldies, relaxing acoustic"

    def recommend(
        self,
        db: Session,
        user: User | None = None,
        age: int | None = None,
        mood: str | None = None,
        preferred_genres: List[str] | None = None,
        preferred_language: str | None = None,
        min_energy: float | None = None,
        max_energy: float | None = None,
        min_tempo: float | None = None,
        max_tempo: float | None = None,
        limit: int = 10,
    ) -> Dict[str, Any]:
        """
        Generate personalized recommendations using content similarity and demographic baselines.
        """
        # Resolve Age & Age Group
        effective_age = age if age is not None else (user.age if user else 22)
        age_group_name, _ = self.get_age_group_for_age(effective_age, db)
        age_baseline = AGE_GROUP_PREFERENCES.get(age_group_name, AGE_GROUP_PREFERENCES["Young Adult"])

        # Resolve Mood & Preferences
        user_pref = user.preference if user else None
        effective_mood = mood or (user_pref.mood if user_pref else "Energetic")
        if effective_mood not in MOOD_PROFILES:
            effective_mood = "Energetic"

        effective_genres = preferred_genres or (user_pref.preferred_genres if user_pref else [])
        if not effective_genres:
            effective_genres = age_baseline["preferred_genres"]

        effective_language = preferred_language or (user_pref.preferred_language if user_pref else None)

        # Retrieve all candidate songs from DB
        query = db.query(Song)
        if min_energy is not None:
            query = query.filter(Song.energy >= min_energy)
        if max_energy is not None:
            query = query.filter(Song.energy <= max_energy)
        if min_tempo is not None:
            query = query.filter(Song.tempo >= min_tempo)
        if max_tempo is not None:
            query = query.filter(Song.tempo <= max_tempo)

        all_songs: List[Song] = query.all()
        if not all_songs:
            return {
                "user_age": effective_age,
                "detected_age_group": age_group_name,
                "mood": effective_mood,
                "strategy_used": "Empty Catalog Fallback",
                "count": 0,
                "recommendations": []
            }

        # Check for warm-start interactions
        user_favorites_song_ids = set()
        user_history_song_ids = set()
        user_ratings_map = {}

        if user:
            favs = db.query(Favorite.song_id).filter(Favorite.user_id == user.id).all()
            user_favorites_song_ids = {f[0] for f in favs}
            
            hist = db.query(ListeningHistory.song_id).filter(ListeningHistory.user_id == user.id).all()
            user_history_song_ids = {h[0] for h in hist}

            fb = db.query(Feedback).filter(Feedback.user_id == user.id).all()
            user_ratings_map = {f.song_id: f.rating for f in fb}

        is_warm_start = bool(user_favorites_song_ids or user_history_song_ids or user_ratings_map)
        strategy_used = "Hybrid Warm-Start (Interactions + Demographic Priors)" if is_warm_start else "Content-Based Cold-Start (Demographic Prior + Explicit Preferences)"

        # Prepare feature matrix for candidate songs
        # Features: [tempo (norm), energy, valence, danceability, year_norm]
        tempos = np.array([s.tempo for s in all_songs])
        min_t, max_t = 50.0, 200.0
        norm_tempos = np.clip((tempos - min_t) / (max_t - min_t), 0.0, 1.0)

        years = np.array([s.release_year for s in all_songs])
        min_y, max_y = 1960.0, 2026.0
        norm_years = np.clip((years - min_y) / (max_y - min_y), 0.0, 1.0)

        energies = np.array([s.energy for s in all_songs])
        valences = np.array([s.valence for s in all_songs])
        danceabilities = np.array([s.danceability for s in all_songs])

        feature_matrix = np.column_stack([norm_tempos, energies, valences, danceabilities, norm_years])

        # Construct Ideal Target Vector
        mood_target = MOOD_PROFILES[effective_mood]
        target_norm_tempo = np.clip((mood_target["tempo"] - min_t) / (max_t - min_t), 0.0, 1.0)
        target_energy = mood_target["energy"]
        target_valence = mood_target["valence"]
        target_dance = mood_target["danceability"]
        
        # Approximate target release year from demographic baseline
        target_year = np.clip((age_baseline.get("min_release_year", 2005) - min_y) / (max_y - min_y), 0.0, 1.0)

        target_vector = np.array([target_norm_tempo, target_energy, target_valence, target_dance, target_year])

        # If warm start, blend with user's top-rated or favorite songs' audio profile
        if is_warm_start and user:
            engaged_songs = [s for s in all_songs if s.id in user_favorites_song_ids or user_ratings_map.get(s.id, 0) >= 4]
            if engaged_songs:
                engaged_t = np.mean([s.tempo for s in engaged_songs])
                engaged_e = np.mean([s.energy for s in engaged_songs])
                engaged_v = np.mean([s.valence for s in engaged_songs])
                engaged_d = np.mean([s.danceability for s in engaged_songs])
                engaged_y = np.mean([s.release_year for s in engaged_songs])

                engaged_vec = np.array([
                    np.clip((engaged_t - min_t) / (max_t - min_t), 0.0, 1.0),
                    engaged_e,
                    engaged_v,
                    engaged_d,
                    np.clip((engaged_y - min_y) / (max_y - min_y), 0.0, 1.0)
                ])
                # 60% user preference vector, 40% current mood/context
                target_vector = 0.60 * engaged_vec + 0.40 * target_vector

        # Calculate Cosine Similarity with all songs
        sim_scores = cosine_similarity([target_vector], feature_matrix)[0]

        # Candidate scoring
        ranked_candidates = []
        for idx, song in enumerate(all_songs):
            base_sim = float(sim_scores[idx])

            # 1. Genre alignment bonus (0 to 0.35)
            genre_bonus = 0.0
            song_genre_lower = song.genre.lower()
            if any(g.lower() in song_genre_lower or song_genre_lower in g.lower() for g in effective_genres):
                genre_bonus = 0.35
            elif any(g.lower() in song_genre_lower for g in age_baseline["preferred_genres"]):
                genre_bonus = 0.20

            # 2. Demographic / Target Age Group bonus (0 to 0.25)
            age_bonus = 0.0
            if song.target_age_group:
                if song.target_age_group.lower() == age_group_name.lower():
                    age_bonus = 0.25
                elif age_group_name in ["Young Adult", "Adult"] and song.target_age_group in ["Young Adult", "Adult"]:
                    age_bonus = 0.15
            else:
                # Estimate from release year & energy
                if song.release_year >= age_baseline["min_release_year"]:
                    age_bonus = 0.15

            # 3. Language alignment bonus
            lang_bonus = 0.0
            if effective_language:
                if song.language.lower() == effective_language.lower():
                    lang_bonus = 0.15
                elif effective_language.lower() == "all":
                    lang_bonus = 0.05
                else:
                    lang_bonus = -0.10  # Mild penalty for non-matching language

            # 4. User feedback / interaction penalty or boost
            interaction_bonus = 0.0
            if song.id in user_ratings_map:
                r = user_ratings_map[song.id]
                interaction_bonus = (r - 3) * 0.08  # 5-star => +0.16, 1-star => -0.16
            
            # Penalize songs played recently to encourage serendipity and discovery
            if song.id in user_history_song_ids and song.id not in user_favorites_song_ids:
                interaction_bonus -= 0.08

            # Calculate composite score (normalized 0.0 to 1.0)
            composite_score = (
                0.40 * base_sim +
                0.28 * genre_bonus +
                0.20 * age_bonus +
                0.12 * max(0.0, lang_bonus) +
                interaction_bonus
            )
            # Clip between 0.10 and 0.99
            final_score = float(np.clip(composite_score, 0.10, 0.99))

            # Generate natural language explainability reasoning
            reasons = []
            if genre_bonus >= 0.30:
                reasons.append(f"Matches your '{song.genre}' genre taste")
            if age_bonus >= 0.15:
                reasons.append(f"Popular among {age_group_name}s ({effective_age} yrs)")
            if abs(song.energy - mood_target["energy"]) < 0.20:
                reasons.append(f"Fits your '{effective_mood}' mood")
            if abs(song.tempo - mood_target["tempo"]) < 15:
                reasons.append(f"Rhythmic tempo (~{int(song.tempo)} BPM)")

            if not reasons:
                reasons.append(f"High audio harmony with {effective_mood} mood")

            recommendation_reason = " • ".join(reasons)

            ranked_candidates.append({
                "song": song,
                "similarity_score": round(final_score * 100, 1),
                "recommendation_reason": recommendation_reason,
                "age_alignment": f"Optimal for {age_group_name} ({age_baseline['description'].split(',')[0]})",
                "is_favorite": song.id in user_favorites_song_ids
            })

        # Sort descending by similarity score
        ranked_candidates.sort(key=lambda x: x["similarity_score"], reverse=True)
        top_candidates = ranked_candidates[:limit]

        # Format output
        results = []
        for item in top_candidates:
            s = item["song"]
            results.append({
                "id": s.id,
                "title": s.title,
                "artist": s.artist,
                "genre": s.genre,
                "language": s.language,
                "release_year": s.release_year,
                "tempo": s.tempo,
                "energy": s.energy,
                "valence": s.valence,
                "danceability": s.danceability,
                "target_age_group": s.target_age_group,
                "cover_image": s.cover_image,
                "audio_url": s.audio_url,
                "external_url": s.external_url,
                "created_at": s.created_at,
                "is_favorite": item["is_favorite"],
                "similarity_score": item["similarity_score"],
                "recommendation_reason": item["recommendation_reason"],
                "age_alignment": item["age_alignment"]
            })

        return {
            "user_age": effective_age,
            "detected_age_group": age_group_name,
            "mood": effective_mood,
            "strategy_used": strategy_used,
            "count": len(results),
            "recommendations": results
        }

recommender_engine = MusicRecommenderEngine()
