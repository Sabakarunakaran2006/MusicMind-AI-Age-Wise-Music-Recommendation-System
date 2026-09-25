# MusicMind AI – Backend API & Recommendation Engine

## Overview
FastAPI Python backend with SQLAlchemy ORM, Pydantic validation, bcrypt security, JWT authentication, and a multidimensional content-based + demographic baseline recommendation engine.

---

## Architecture Components

* **`app/main.py`**: FastAPI application entry point, CORS middleware, lifespan automatic seed runner, and router inclusions.
* **`app/core/`**: Configuration (`config.py`) and cryptographic security utilities (`security.py`).
* **`app/db/`**: SQLAlchemy database session management (`session.py`) and seed runner (`seed.py`).
* **`app/models/`**: Relational models for Users, Preferences, AgeGroups, Genres, Songs, Playlists, PlaylistSongs, Favorites, ListeningHistory, Feedback.
* **`app/schemas/`**: Pydantic v2 schemas for request validation and response serialization.
* **`app/api/`**: Modular REST endpoints (`auth.py`, `users.py`, `songs.py`, `recommendations.py`, `playlists.py`, `favorites.py`, `history.py`, `feedback.py`, `admin.py`).
* **`app/ml/`**:
  * `recommender.py`: Content-based cosine vector space & demographic cohort baseline engine.
  * `evaluator.py`: Real metric calculation (Precision@K, Recall@K, NDCG@K, MRR, Coverage).
  * `age_detector.py`: Image demographic heuristic inference with transparent user confirmation.
* **`tests/`**: Automated pytest test suite covering authentication, RBAC, recommendation ranking, search, and ML metrics.

---

## Local Development Setup

### 1. Install Dependencies
```bash
python -m pip install -r requirements.txt
```

### 2. Run Database Seeding
```bash
python -m app.db.seed
```

### 3. Run Development Server
```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
API Documentation will be available at:
* Swagger UI: `http://localhost:8000/docs`
* ReDoc: `http://localhost:8000/redoc`

### 4. Run Automated Test Suite
```bash
python -m pytest tests/ -v
```
