from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from typing import Optional, List

# ----------------- AUTH SCHEMAS -----------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    age: int = Field(..., ge=10, le=120)
    preferred_language: Optional[str] = "English"
    preferred_genres: Optional[List[str]] = []

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

# ----------------- USER SCHEMAS -----------------
class UserPreferenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    preferred_genres: List[str]
    preferred_language: str
    mood: str
    listening_purpose: str
    explicit_content: bool
    updated_at: Optional[datetime] = None

class UserPreferenceUpdate(BaseModel):
    preferred_genres: Optional[List[str]] = None
    preferred_language: Optional[str] = None
    mood: Optional[str] = None
    listening_purpose: Optional[str] = None
    explicit_content: Optional[bool] = None

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    role: str
    age: int
    age_group: Optional[str] = None
    is_active: bool
    created_at: datetime
    preference: Optional[UserPreferenceResponse] = None

class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = Field(None, ge=10, le=120)
    password: Optional[str] = None

class UserStatusUpdateRequest(BaseModel):
    is_active: Optional[bool] = None
    role: Optional[str] = None

# ----------------- SONG SCHEMAS -----------------
class SongBase(BaseModel):
    title: str
    artist: str
    genre: str
    language: str = "English"
    release_year: int
    tempo: float = Field(..., ge=40.0, le=240.0)
    energy: float = Field(..., ge=0.0, le=1.0)
    valence: float = Field(..., ge=0.0, le=1.0)
    danceability: float = Field(..., ge=0.0, le=1.0)
    target_age_group: Optional[str] = None
    cover_image: Optional[str] = None
    audio_url: Optional[str] = None
    external_url: Optional[str] = None

class SongCreate(SongBase):
    pass

class SongUpdate(BaseModel):
    title: Optional[str] = None
    artist: Optional[str] = None
    genre: Optional[str] = None
    language: Optional[str] = None
    release_year: Optional[int] = None
    tempo: Optional[float] = None
    energy: Optional[float] = None
    valence: Optional[float] = None
    danceability: Optional[float] = None
    target_age_group: Optional[str] = None
    cover_image: Optional[str] = None
    audio_url: Optional[str] = None
    external_url: Optional[str] = None

class SongResponse(SongBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    is_favorite: Optional[bool] = False

class SongListResponse(BaseModel):
    total: int
    page: int
    limit: int
    songs: List[SongResponse]

# ----------------- AGE GROUP & GENRE SCHEMAS -----------------
class AgeGroupResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    min_age: int
    max_age: int
    description: Optional[str] = ""

class AgeGroupCreate(BaseModel):
    name: str
    min_age: int
    max_age: int
    description: Optional[str] = ""

class AgeGroupUpdate(BaseModel):
    name: Optional[str] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    description: Optional[str] = None

class GenreResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    description: Optional[str] = ""
    song_count: Optional[int] = 0

class GenreCreate(BaseModel):
    name: str
    description: Optional[str] = ""

# ----------------- PLAYLIST SCHEMAS -----------------
class PlaylistCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = ""
    is_private: Optional[bool] = True

class PlaylistUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_private: Optional[bool] = None

class PlaylistResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    name: str
    description: Optional[str] = ""
    is_private: bool
    song_count: Optional[int] = 0
    created_at: datetime
    updated_at: datetime

class PlaylistDetailResponse(PlaylistResponse):
    songs: List[SongResponse] = []

class PlaylistSongAdd(BaseModel):
    song_id: int

# ----------------- INTERACTION SCHEMAS -----------------
class FavoriteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    song_id: int
    song: SongResponse
    created_at: datetime

class ListeningHistoryCreate(BaseModel):
    song_id: int
    event_type: Optional[str] = "play"

class ListeningHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    song_id: int
    event_type: str
    played_at: datetime
    song: SongResponse

class FeedbackCreate(BaseModel):
    song_id: int
    rating: int = Field(..., ge=1, le=5)
    feedback_type: Optional[str] = "recommendation_match"
    comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    song_id: int
    rating: int
    feedback_type: str
    comment: Optional[str] = None
    created_at: datetime
    song_title: Optional[str] = None
    user_name: Optional[str] = None

# ----------------- RECOMMENDATION SCHEMAS -----------------
class RecommendationRequest(BaseModel):
    age: Optional[int] = None
    age_group: Optional[str] = None
    mood: Optional[str] = None
    preferred_genres: Optional[List[str]] = None
    preferred_language: Optional[str] = None
    min_energy: Optional[float] = None
    max_energy: Optional[float] = None
    min_tempo: Optional[float] = None
    max_tempo: Optional[float] = None
    limit: Optional[int] = Field(10, ge=1, le=50)

class RecommendedSong(SongResponse):
    similarity_score: float
    recommendation_reason: str
    age_alignment: str

class RecommendationResponse(BaseModel):
    user_age: int
    detected_age_group: str
    mood: str
    strategy_used: str
    count: int
    recommendations: List[RecommendedSong]

# ----------------- ADMIN & ML SCHEMAS -----------------
class AdminOverviewResponse(BaseModel):
    total_users: int
    total_songs: int
    total_playlists: int
    total_favorites: int
    total_feedback: int
    active_model_name: str
    active_model_version: str
    system_status: str

class ModelEvaluationMetrics(BaseModel):
    model_name: str
    model_type: str
    version: str
    dataset_size: int
    total_interactions: int
    precision_at_k: float
    recall_at_k: float
    ndcg_at_k: float
    catalog_coverage_pct: float
    mean_reciprocal_rank: float
    average_user_rating: float
    evaluation_sample_size: int
    last_evaluated_at: str
    genre_distribution: dict
    age_group_distribution: dict
