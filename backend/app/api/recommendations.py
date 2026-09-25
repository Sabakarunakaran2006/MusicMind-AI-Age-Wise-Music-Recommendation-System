from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Song, User
from app.schemas.schemas import RecommendationRequest, RecommendationResponse
from app.api.deps import get_optional_user, get_current_user
from app.ml.recommender import recommender_engine

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("", response_model=RecommendationResponse)
def get_user_recommendations(
    limit: int = Query(10, ge=1, le=50),
    mood: str | None = Query(None),
    genre: str | None = Query(None),
    language: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate personalized recommendations for the logged-in user based on age, saved profile, and listening history.
    """
    genres = [genre] if genre else None
    result = recommender_engine.recommend(
        db=db,
        user=current_user,
        mood=mood,
        preferred_genres=genres,
        preferred_language=language,
        limit=limit
    )
    return result

@router.post("/generate", response_model=RecommendationResponse)
def generate_custom_recommendations(
    req: RecommendationRequest,
    user = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Interactive recommendation endpoint allowing listeners to customize age, mood, audio feature sliders.
    Works for both logged in listeners and guests.
    """
    result = recommender_engine.recommend(
        db=db,
        user=user,
        age=req.age,
        mood=req.mood,
        preferred_genres=req.preferred_genres,
        preferred_language=req.preferred_language,
        min_energy=req.min_energy,
        max_energy=req.max_energy,
        min_tempo=req.min_tempo,
        max_tempo=req.max_tempo,
        limit=req.limit or 10
    )
    return result

@router.get("/explain/{song_id}")
def explain_song_recommendation(
    song_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Explain the mathematical & demographic basis for recommending a song to the user.
    """
    song = db.query(Song).filter(Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Song not found")

    age_group, group_desc = recommender_engine.get_age_group_for_age(user.age, db)
    user_mood = user.preference.mood if user.preference else "Energetic"
    user_genres = user.preference.preferred_genres if user.preference else []

    genre_match = any(g.lower() in song.genre.lower() for g in user_genres)
    age_align = (song.target_age_group == age_group) or (song.release_year >= 2010 if age_group == "Young Adult" else True)

    breakdown = {
        "song_id": song.id,
        "title": song.title,
        "artist": song.artist,
        "user_demographics": {
            "age": user.age,
            "age_group": age_group,
            "age_group_traits": group_desc
        },
        "audio_feature_analysis": {
            "tempo_bpm": song.tempo,
            "energy_level": f"{round(song.energy * 100)}%",
            "valence_positivity": f"{round(song.valence * 100)}%",
            "danceability": f"{round(song.danceability * 100)}%"
        },
        "matching_factors": {
            "genre_affinity": "Direct match" if genre_match else "Complementary genre",
            "age_group_fit": f"Optimal resonance with {age_group} cohort",
            "mood_synergy": f"Audio attributes match '{user_mood}' profile"
        },
        "summary": f"Recommended because '{song.title}' matches your {user_mood} listening preference with {round(song.energy*100)}% energy, aligning with popular tracks for listeners aged {user.age} ({age_group})."
    }

    return breakdown
