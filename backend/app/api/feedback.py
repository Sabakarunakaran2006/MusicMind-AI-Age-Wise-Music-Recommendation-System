from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Feedback, Song, User
from app.schemas.schemas import FeedbackCreate, FeedbackResponse
from app.api.deps import get_current_user
from typing import List

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.post("", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    req: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    song = db.query(Song).filter(Song.id == req.song_id).first()
    if not song:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Song not found")

    # Update if already exists, else insert
    fb = db.query(Feedback).filter(Feedback.user_id == current_user.id, Feedback.song_id == req.song_id).first()
    if fb:
        fb.rating = req.rating
        fb.feedback_type = req.feedback_type or fb.feedback_type
        fb.comment = req.comment if req.comment is not None else fb.comment
    else:
        fb = Feedback(
            user_id=current_user.id,
            song_id=req.song_id,
            rating=req.rating,
            feedback_type=req.feedback_type or "recommendation_match",
            comment=req.comment
        )
        db.add(fb)

    db.commit()
    db.refresh(fb)

    return FeedbackResponse(
        id=fb.id,
        user_id=fb.user_id,
        song_id=fb.song_id,
        rating=fb.rating,
        feedback_type=fb.feedback_type,
        comment=fb.comment,
        created_at=fb.created_at,
        song_title=song.title,
        user_name=current_user.name
    )

@router.get("/me", response_model=List[FeedbackResponse])
def get_my_feedback(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entries = db.query(Feedback).filter(Feedback.user_id == current_user.id).order_by(Feedback.created_at.desc()).all()
    results = []
    for f in entries:
        results.append(FeedbackResponse(
            id=f.id,
            user_id=f.user_id,
            song_id=f.song_id,
            rating=f.rating,
            feedback_type=f.feedback_type,
            comment=f.comment,
            created_at=f.created_at,
            song_title=f.song.title if f.song else "",
            user_name=current_user.name
        ))
    return results

@router.get("/song/{song_id}", response_model=FeedbackResponse | None)
def get_song_feedback_for_me(
    song_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    fb = db.query(Feedback).filter(Feedback.user_id == current_user.id, Feedback.song_id == song_id).first()
    if not fb:
        return None
    return FeedbackResponse(
        id=fb.id,
        user_id=fb.user_id,
        song_id=fb.song_id,
        rating=fb.rating,
        feedback_type=fb.feedback_type,
        comment=fb.comment,
        created_at=fb.created_at,
        song_title=fb.song.title if fb.song else "",
        user_name=current_user.name
    )
