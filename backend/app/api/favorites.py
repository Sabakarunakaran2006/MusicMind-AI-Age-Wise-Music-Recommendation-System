from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Favorite, Song, User
from app.schemas.schemas import SongResponse
from app.api.deps import get_current_user
from typing import List

router = APIRouter(prefix="/favorites", tags=["Favorites"])

@router.get("", response_model=List[SongResponse])
def get_user_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    favs = (
        db.query(Favorite)
        .filter(Favorite.user_id == current_user.id)
        .order_by(Favorite.created_at.desc())
        .all()
    )
    result = []
    for f in favs:
        s = f.song
        result.append(SongResponse(
            id=s.id,
            title=s.title,
            artist=s.artist,
            genre=s.genre,
            language=s.language,
            release_year=s.release_year,
            tempo=s.tempo,
            energy=s.energy,
            valence=s.valence,
            danceability=s.danceability,
            target_age_group=s.target_age_group,
            cover_image=s.cover_image,
            audio_url=s.audio_url,
            external_url=s.external_url,
            created_at=s.created_at,
            is_favorite=True
        ))
    return result

@router.post("/{song_id}", status_code=status.HTTP_201_CREATED)
def add_favorite(
    song_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    song = db.query(Song).filter(Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Song not found")

    existing = db.query(Favorite).filter(Favorite.user_id == current_user.id, Favorite.song_id == song_id).first()
    if existing:
        return {"message": "Song is already in favorites", "song_id": song_id}

    fav = Favorite(user_id=current_user.id, song_id=song_id)
    db.add(fav)
    db.commit()
    return {"message": "Added to favorites", "song_id": song_id}

@router.delete("/{song_id}", status_code=status.HTTP_200_OK)
def remove_favorite(
    song_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    fav = db.query(Favorite).filter(Favorite.user_id == current_user.id, Favorite.song_id == song_id).first()
    if not fav:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Song not in favorites")

    db.delete(fav)
    db.commit()
    return {"message": "Removed from favorites", "song_id": song_id}
