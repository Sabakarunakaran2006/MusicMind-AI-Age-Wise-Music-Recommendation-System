from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.session import get_db
from app.models.models import Song, Favorite, Genre
from app.schemas.schemas import SongResponse, SongListResponse, GenreResponse
from app.api.deps import get_optional_user
from typing import List, Optional

router = APIRouter(prefix="/songs", tags=["Songs"])

@router.get("", response_model=SongListResponse)
def list_songs(
    query: Optional[str] = Query(None, description="Search by title or artist"),
    genre: Optional[str] = Query(None, description="Filter by genre"),
    language: Optional[str] = Query(None, description="Filter by language"),
    year_from: Optional[int] = Query(None, description="Minimum release year"),
    year_to: Optional[int] = Query(None, description="Maximum release year"),
    sort_by: Optional[str] = Query("title", description="Sort by title, release_year, or tempo"),
    order: Optional[str] = Query("asc", description="Sort order: asc or desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user = Depends(get_optional_user)
):
    q = db.query(Song)

    if query:
        term = f"%{query.strip()}%"
        q = q.filter(or_(Song.title.ilike(term), Song.artist.ilike(term)))

    if genre and genre.lower() != "all":
        q = q.filter(Song.genre.ilike(genre.strip()))

    if language and language.lower() != "all":
        q = q.filter(Song.language.ilike(language.strip()))

    if year_from is not None:
        q = q.filter(Song.release_year >= year_from)

    if year_to is not None:
        q = q.filter(Song.release_year <= year_to)

    total = q.count()

    # Sorting
    sort_col = Song.title
    if sort_by == "release_year":
        sort_col = Song.release_year
    elif sort_by == "tempo":
        sort_col = Song.tempo
    elif sort_by == "energy":
        sort_col = Song.energy

    if order.lower() == "desc":
        q = q.order_by(sort_col.desc())
    else:
        q = q.order_by(sort_col.asc())

    offset = (page - 1) * limit
    songs = q.offset(offset).limit(limit).all()

    # Determine favorites for authenticated user
    fav_ids = set()
    if user:
        fav_rows = db.query(Favorite.song_id).filter(Favorite.user_id == user.id).all()
        fav_ids = {r[0] for r in fav_rows}

    response_songs = []
    for s in songs:
        response_songs.append(SongResponse(
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
        ))

    return SongListResponse(
        total=total,
        page=page,
        limit=limit,
        songs=response_songs
    )

@router.get("/meta/genres", response_model=List[str])
def get_genres(db: Session = Depends(get_db)):
    genres = db.query(Song.genre).distinct().order_by(Song.genre).all()
    return [g[0] for g in genres if g[0]]

@router.get("/meta/languages", response_model=List[str])
def get_languages(db: Session = Depends(get_db)):
    languages = db.query(Song.language).distinct().order_by(Song.language).all()
    return [l[0] for l in languages if l[0]]

@router.get("/meta/moods", response_model=List[str])
def get_moods():
    return ["Energetic", "Happy", "Chill", "Melancholic", "Focus", "Party"]

@router.get("/{song_id}", response_model=SongResponse)
def get_song(
    song_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_optional_user)
):
    song = db.query(Song).filter(Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Song not found")

    is_fav = False
    if user:
        is_fav = db.query(Favorite).filter(Favorite.user_id == user.id, Favorite.song_id == song.id).first() is not None

    return SongResponse(
        id=song.id,
        title=song.title,
        artist=song.artist,
        genre=song.genre,
        language=song.language,
        release_year=song.release_year,
        tempo=song.tempo,
        energy=song.energy,
        valence=song.valence,
        danceability=song.danceability,
        target_age_group=song.target_age_group,
        cover_image=song.cover_image,
        audio_url=song.audio_url,
        external_url=song.external_url,
        created_at=song.created_at,
        is_favorite=is_fav
    )
