import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "MusicMind AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "musicmind-super-secret-key-production-ready-2026-btech-final-project")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./musicmind.db")
    
    # Default Age Groups
    DEFAULT_AGE_GROUPS: list = [
        {"name": "Teen", "min_age": 13, "max_age": 19, "description": "High energy, trending pop, hip-hop, dynamic beats"},
        {"name": "Young Adult", "min_age": 20, "max_age": 29, "description": "Diverse genres, EDM, indie, R&B, alternative, modern pop"},
        {"name": "Adult", "min_age": 30, "max_age": 45, "description": "Melodic pop, rock classics, acoustic, lyrical depth"},
        {"name": "Middle-aged", "min_age": 46, "max_age": 60, "description": "Classic rock, jazz, soul, blues, 80s-90s retros"},
        {"name": "Senior", "min_age": 61, "max_age": 120, "description": "Classical, golden oldies, folk, relaxing instrumentals"}
    ]

settings = Settings()
