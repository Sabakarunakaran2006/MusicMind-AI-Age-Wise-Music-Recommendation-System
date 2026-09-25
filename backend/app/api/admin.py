from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.session import get_db
from app.models.models import User, Song, Playlist, Favorite, Feedback, AgeGroup, Genre
from app.schemas.schemas import (
    AdminOverviewResponse, UserResponse, UserStatusUpdateRequest,
    SongCreate, SongUpdate, SongResponse, AgeGroupResponse, AgeGroupCreate, AgeGroupUpdate,
    GenreResponse, GenreCreate, ModelEvaluationMetrics, FeedbackResponse
)
from app.api.deps import require_admin
from app.api.auth import format_user_response
from app.ml.recommender import recommender_engine
from app.ml.evaluator import model_evaluator
from typing import List, Optional

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(require_admin)])

@router.get("/overview", response_model=AdminOverviewResponse)
def get_admin_overview(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_songs = db.query(Song).count()
    total_playlists = db.query(Playlist).count()
    total_favorites = db.query(Favorite).count()
    total_feedback = db.query(Feedback).count()

    return AdminOverviewResponse(
        total_users=total_users,
        total_songs=total_songs,
        total_playlists=total_playlists,
        total_favorites=total_favorites,
        total_feedback=total_feedback,
        active_model_name=recommender_engine.model_name,
        active_model_version=recommender_engine.version,
        system_status="Operational"
    )

@router.get("/users", response_model=List[UserResponse])
def get_users(
    query: Optional[str] = None,
    role: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(User)
    if query:
        term = f"%{query.strip()}%"
        q = q.filter(or_(User.name.ilike(term), User.email.ilike(term)))
    if role and role.lower() != "all":
        q = q.filter(User.role == role.lower().strip())

    users = q.order_by(User.created_at.desc()).all()
    return [format_user_response(u, db) for u in users]

@router.put("/users/{user_id}", response_model=UserResponse)
def update_user_status(
    user_id: int,
    req: UserStatusUpdateRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if req.is_active is not None:
        user.is_active = req.is_active
    if req.role is not None and req.role in ["listener", "admin"]:
        user.role = req.role

    db.commit()
    db.refresh(user)
    return format_user_response(user, db)

@router.post("/songs", response_model=SongResponse, status_code=status.HTTP_201_CREATED)
def create_song(
    req: SongCreate,
    db: Session = Depends(get_db)
):
    song = Song(
        title=req.title.strip(),
        artist=req.artist.strip(),
        genre=req.genre.strip(),
        language=req.language.strip() if req.language else "English",
        release_year=req.release_year,
        tempo=req.tempo,
        energy=req.energy,
        valence=req.valence,
        danceability=req.danceability,
        target_age_group=req.target_age_group,
        cover_image=req.cover_image,
        audio_url=req.audio_url,
        external_url=req.external_url
    )
    db.add(song)
    db.commit()
    db.refresh(song)
    return SongResponse.model_validate(song)

@router.put("/songs/{song_id}", response_model=SongResponse)
def update_song(
    song_id: int,
    req: SongUpdate,
    db: Session = Depends(get_db)
):
    song = db.query(Song).filter(Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Song not found")

    for field, val in req.model_dump(exclude_unset=True).items():
        if val is not None:
            setattr(song, field, val)

    db.commit()
    db.refresh(song)
    return SongResponse.model_validate(song)

@router.delete("/songs/{song_id}", status_code=status.HTTP_200_OK)
def delete_song(
    song_id: int,
    db: Session = Depends(get_db)
):
    song = db.query(Song).filter(Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Song not found")

    db.delete(song)
    db.commit()
    return {"message": "Song deleted successfully", "song_id": song_id}

@router.get("/age-groups", response_model=List[AgeGroupResponse])
def get_age_groups(db: Session = Depends(get_db)):
    return db.query(AgeGroup).order_by(AgeGroup.min_age.asc()).all()

@router.post("/age-groups", response_model=AgeGroupResponse, status_code=status.HTTP_201_CREATED)
def create_age_group(req: AgeGroupCreate, db: Session = Depends(get_db)):
    ag = AgeGroup(
        name=req.name.strip(),
        min_age=req.min_age,
        max_age=req.max_age,
        description=req.description or ""
    )
    db.add(ag)
    db.commit()
    db.refresh(ag)
    return ag

@router.put("/age-groups/{group_id}", response_model=AgeGroupResponse)
def update_age_group(group_id: int, req: AgeGroupUpdate, db: Session = Depends(get_db)):
    ag = db.query(AgeGroup).filter(AgeGroup.id == group_id).first()
    if not ag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Age group not found")

    if req.name is not None:
        ag.name = req.name.strip()
    if req.min_age is not None:
        ag.min_age = req.min_age
    if req.max_age is not None:
        ag.max_age = req.max_age
    if req.description is not None:
        ag.description = req.description

    db.commit()
    db.refresh(ag)
    return ag

@router.get("/genres", response_model=List[GenreResponse])
def get_genres_admin(db: Session = Depends(get_db)):
    genres = db.query(Genre).all()
    results = []
    for g in genres:
        count = db.query(Song).filter(Song.genre.ilike(g.name)).count()
        results.append(GenreResponse(
            id=g.id,
            name=g.name,
            description=g.description or "",
            song_count=count
        ))
    return results

@router.post("/genres", response_model=GenreResponse, status_code=status.HTTP_201_CREATED)
def create_genre(req: GenreCreate, db: Session = Depends(get_db)):
    existing = db.query(Genre).filter(Genre.name.ilike(req.name.strip())).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Genre already exists")

    g = Genre(name=req.name.strip(), description=req.description or "")
    db.add(g)
    db.commit()
    db.refresh(g)
    return GenreResponse(id=g.id, name=g.name, description=g.description or "", song_count=0)

@router.get("/model-metrics", response_model=ModelEvaluationMetrics)
def get_model_metrics(k: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)):
    return model_evaluator.evaluate_model(db, k=k)

@router.post("/evaluate-model", response_model=ModelEvaluationMetrics)
def run_model_evaluation(k: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)):
    return model_evaluator.evaluate_model(db, k=k)

@router.get("/feedback", response_model=List[FeedbackResponse])
def get_all_feedback(limit: int = 50, db: Session = Depends(get_db)):
    feedbacks = db.query(Feedback).order_by(Feedback.created_at.desc()).limit(limit).all()
    results = []
    for f in feedbacks:
        results.append(FeedbackResponse(
            id=f.id,
            user_id=f.user_id,
            song_id=f.song_id,
            rating=f.rating,
            feedback_type=f.feedback_type,
            comment=f.comment,
            created_at=f.created_at,
            song_title=f.song.title if f.song else "",
            user_name=f.user.name if f.user else ""
        ))
    return results
