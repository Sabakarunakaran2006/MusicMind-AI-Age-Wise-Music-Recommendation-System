from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import ListeningHistory, Song, User, Favorite
from app.schemas.schemas import ListeningHistoryCreate, ListeningHistoryResponse, SongResponse
from app.api.deps import get_current_user
from typing import List

router = APIRouter(prefix="/history", tags=["History"])

@router.get("", response_model=List[ListeningHistoryResponse])
def get_user_history(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    history_entries = (
        db.query(ListeningHistory)
        .filter(ListeningHistory.user_id == current_user.id)
        .order_by(ListeningHistory.played_at.desc())
        .limit(limit)
        .all()
    )

    fav_ids = {r[0] for r in db.query(Favorite.song_id).filter(Favorite.user_id == current_user.id).all()}

    results = []
    for h in history_entries:
        s = h.song
        song_resp = SongResponse(
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
            is_favorite=s.id in fav_ids
        )
        results.append(ListeningHistoryResponse(
            id=h.id,
            user_id=h.user_id,
            song_id=h.song_id,
            event_type=h.event_type,
            played_at=h.played_at,
            song=song_resp
        ))
    return results

@router.post("", status_code=status.HTTP_201_CREATED)
def record_history_event(
    req: ListeningHistoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    song = db.query(Song).filter(Song.id == req.song_id).first()
    if not song:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Song not found")

    entry = ListeningHistory(
        user_id=current_user.id,
        song_id=req.song_id,
        event_type=req.event_type or "play"
    )
    db.add(entry)
    db.commit()
    return {"message": "Play event recorded", "song_id": req.song_id}

@router.delete("", status_code=status.HTTP_200_OK)
def clear_user_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(ListeningHistory).filter(ListeningHistory.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Listening history cleared successfully"}
