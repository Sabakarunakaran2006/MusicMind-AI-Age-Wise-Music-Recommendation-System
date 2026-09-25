from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Playlist, PlaylistSong, Song, User, Favorite
from app.schemas.schemas import (
    PlaylistCreate, PlaylistUpdate, PlaylistResponse, PlaylistDetailResponse,
    PlaylistSongAdd, SongResponse
)
from app.api.deps import get_current_user
from typing import List

router = APIRouter(prefix="/playlists", tags=["Playlists"])

@router.get("", response_model=List[PlaylistResponse])
def get_user_playlists(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    playlists = (
        db.query(Playlist)
        .filter(Playlist.user_id == current_user.id)
        .order_by(Playlist.updated_at.desc())
        .all()
    )
    result = []
    for p in playlists:
        count = db.query(PlaylistSong).filter(PlaylistSong.playlist_id == p.id).count()
        result.append(PlaylistResponse(
            id=p.id,
            user_id=p.user_id,
            name=p.name,
            description=p.description or "",
            is_private=p.is_private,
            song_count=count,
            created_at=p.created_at,
            updated_at=p.updated_at
        ))
    return result

@router.post("", response_model=PlaylistResponse, status_code=status.HTTP_201_CREATED)
def create_playlist(
    req: PlaylistCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    p = Playlist(
        user_id=current_user.id,
        name=req.name.strip(),
        description=req.description or "",
        is_private=req.is_private if req.is_private is not None else True
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return PlaylistResponse(
        id=p.id,
        user_id=p.user_id,
        name=p.name,
        description=p.description or "",
        is_private=p.is_private,
        song_count=0,
        created_at=p.created_at,
        updated_at=p.updated_at
    )

@router.get("/{playlist_id}", response_model=PlaylistDetailResponse)
def get_playlist_details(
    playlist_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playlist not found")

    if playlist.user_id != current_user.id and playlist.is_private:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to private playlist")

    fav_ids = {r[0] for r in db.query(Favorite.song_id).filter(Favorite.user_id == current_user.id).all()}

    songs = []
    for entry in playlist.songs:
        s = entry.song
        songs.append(SongResponse(
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

    return PlaylistDetailResponse(
        id=playlist.id,
        user_id=playlist.user_id,
        name=playlist.name,
        description=playlist.description or "",
        is_private=playlist.is_private,
        song_count=len(songs),
        created_at=playlist.created_at,
        updated_at=playlist.updated_at,
        songs=songs
    )

@router.put("/{playlist_id}", response_model=PlaylistResponse)
def update_playlist(
    playlist_id: int,
    req: PlaylistUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id, Playlist.user_id == current_user.id).first()
    if not playlist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playlist not found or permission denied")

    if req.name is not None and req.name.strip():
        playlist.name = req.name.strip()
    if req.description is not None:
        playlist.description = req.description
    if req.is_private is not None:
        playlist.is_private = req.is_private

    db.commit()
    db.refresh(playlist)

    count = db.query(PlaylistSong).filter(PlaylistSong.playlist_id == playlist.id).count()
    return PlaylistResponse(
        id=playlist.id,
        user_id=playlist.user_id,
        name=playlist.name,
        description=playlist.description or "",
        is_private=playlist.is_private,
        song_count=count,
        created_at=playlist.created_at,
        updated_at=playlist.updated_at
    )

@router.delete("/{playlist_id}", status_code=status.HTTP_200_OK)
def delete_playlist(
    playlist_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id, Playlist.user_id == current_user.id).first()
    if not playlist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playlist not found or permission denied")

    db.delete(playlist)
    db.commit()
    return {"message": "Playlist deleted successfully"}

@router.post("/{playlist_id}/songs", status_code=status.HTTP_201_CREATED)
def add_song_to_playlist(
    playlist_id: int,
    req: PlaylistSongAdd,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id, Playlist.user_id == current_user.id).first()
    if not playlist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playlist not found or permission denied")

    song = db.query(Song).filter(Song.id == req.song_id).first()
    if not song:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Song not found")

    existing = db.query(PlaylistSong).filter(PlaylistSong.playlist_id == playlist_id, PlaylistSong.song_id == req.song_id).first()
    if existing:
        return {"message": "Song already in playlist", "song_id": req.song_id}

    pos = db.query(PlaylistSong).filter(PlaylistSong.playlist_id == playlist_id).count()
    entry = PlaylistSong(playlist_id=playlist_id, song_id=req.song_id, position=pos)
    db.add(entry)
    db.commit()
    return {"message": "Song added to playlist", "song_id": req.song_id}

@router.delete("/{playlist_id}/songs/{song_id}", status_code=status.HTTP_200_OK)
def remove_song_from_playlist(
    playlist_id: int,
    song_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id, Playlist.user_id == current_user.id).first()
    if not playlist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playlist not found or permission denied")

    entry = db.query(PlaylistSong).filter(PlaylistSong.playlist_id == playlist_id, PlaylistSong.song_id == song_id).first()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Song not found in playlist")

    db.delete(entry)
    db.commit()
    return {"message": "Song removed from playlist"}
