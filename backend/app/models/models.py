from datetime import datetime, timezone
import json
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.db.session import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="listener", nullable=False)  # "listener", "admin"
    age = Column(Integer, nullable=False, default=21)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    preference = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    playlists = relationship("Playlist", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    history = relationship("ListeningHistory", back_populates="user", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    _preferred_genres = Column("preferred_genres", Text, default="[]")
    preferred_language = Column(String(50), default="English")
    mood = Column(String(50), default="Energetic")
    listening_purpose = Column(String(50), default="Relaxation")
    explicit_content = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="preference")

    @property
    def preferred_genres(self) -> list[str]:
        try:
            return json.loads(self._preferred_genres) if self._preferred_genres else []
        except Exception:
            return []

    @preferred_genres.setter
    def preferred_genres(self, genres: list[str]):
        self._preferred_genres = json.dumps(genres)

class AgeGroup(Base):
    __tablename__ = "age_groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    min_age = Column(Integer, nullable=False)
    max_age = Column(Integer, nullable=False)
    description = Column(String(255), default="")

class Genre(Base):
    __tablename__ = "genres"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255), default="")

class Song(Base):
    __tablename__ = "songs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    artist = Column(String(255), nullable=False, index=True)
    genre = Column(String(50), nullable=False, index=True)
    language = Column(String(50), nullable=False, default="English", index=True)
    release_year = Column(Integer, nullable=False)
    tempo = Column(Float, nullable=False, default=120.0)         # BPM (typically 60 - 200)
    energy = Column(Float, nullable=False, default=0.7)        # 0.0 to 1.0
    valence = Column(Float, nullable=False, default=0.6)       # 0.0 to 1.0 (musical positivity)
    danceability = Column(Float, nullable=False, default=0.65) # 0.0 to 1.0
    target_age_group = Column(String(50), nullable=True)       # e.g. "Teen", "Young Adult", etc.
    cover_image = Column(String(500), nullable=True)
    audio_url = Column(String(500), nullable=True)             # Audio stream or preview link
    external_url = Column(String(500), nullable=True)          # Spotify / YouTube Link
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    playlist_entries = relationship("PlaylistSong", back_populates="song", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="song", cascade="all, delete-orphan")
    history_entries = relationship("ListeningHistory", back_populates="song", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="song", cascade="all, delete-orphan")

class Playlist(Base):
    __tablename__ = "playlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(150), nullable=False)
    description = Column(String(500), default="")
    is_private = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="playlists")
    songs = relationship("PlaylistSong", back_populates="playlist", cascade="all, delete-orphan", order_by="PlaylistSong.position")

class PlaylistSong(Base):
    __tablename__ = "playlist_songs"

    id = Column(Integer, primary_key=True, index=True)
    playlist_id = Column(Integer, ForeignKey("playlists.id", ondelete="CASCADE"), nullable=False)
    song_id = Column(Integer, ForeignKey("songs.id", ondelete="CASCADE"), nullable=False)
    position = Column(Integer, default=0)
    added_at = Column(DateTime, default=utcnow)

    playlist = relationship("Playlist", back_populates="songs")
    song = relationship("Song", back_populates="playlist_entries")

    __table_args__ = (
        UniqueConstraint("playlist_id", "song_id", name="uq_playlist_song"),
    )

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    song_id = Column(Integer, ForeignKey("songs.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="favorites")
    song = relationship("Song", back_populates="favorites")

    __table_args__ = (
        UniqueConstraint("user_id", "song_id", name="uq_user_favorite_song"),
    )

class ListeningHistory(Base):
    __tablename__ = "listening_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    song_id = Column(Integer, ForeignKey("songs.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(50), default="play")  # "play", "completed", "skipped"
    played_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="history")
    song = relationship("Song", back_populates="history_entries")

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    song_id = Column(Integer, ForeignKey("songs.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1 to 5 stars
    feedback_type = Column(String(50), default="recommendation_match")
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="feedbacks")
    song = relationship("Song", back_populates="feedbacks")
