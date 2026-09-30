import os
import sys

# Ensure backend root is always in sys.path
_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.db.seed import run_seed
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.songs import router as songs_router
from app.api.recommendations import router as rec_router
from app.api.playlists import router as playlists_router
from app.api.favorites import router as favorites_router
from app.api.history import router as history_router
from app.api.feedback import router as feedback_router
from app.api.admin import router as admin_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-initialize database tables and seed sample data on startup
    try:
        run_seed()
    except Exception as e:
        print(f"Startup seed notice: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Based Age-Wise Music Recommendation System API with Content-Based and Demographic Hybrid Filtering",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
api_v1 = settings.API_V1_STR
app.include_router(auth_router, prefix=api_v1)
app.include_router(users_router, prefix=api_v1)
app.include_router(songs_router, prefix=api_v1)
app.include_router(rec_router, prefix=api_v1)
app.include_router(playlists_router, prefix=api_v1)
app.include_router(favorites_router, prefix=api_v1)
app.include_router(history_router, prefix=api_v1)
app.include_router(feedback_router, prefix=api_v1)
app.include_router(admin_router, prefix=api_v1)

import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path in ["docs", "redoc", "openapi.json"]:
            return None
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "project": "MusicMind AI",
            "tagline": "AI-Based Age-Wise Music Recommendation System",
            "status": "online",
            "version": settings.VERSION,
            "docs_url": "/docs"
        }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "MusicMind AI Backend"}
