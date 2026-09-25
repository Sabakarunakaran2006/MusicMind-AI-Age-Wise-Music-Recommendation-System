# MusicMind AI – Age-Wise Music Recommendation System

![MusicMind AI](https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80)

> **B.Tech Information Technology Final-Year Capstone Project**  
> An intelligent, production-style, full-stack web application recommending music based on demographic age groups, explicit user preferences, mood vectors, audio feature cosine similarities, and continuous feedback.

---

## 1. Project Abstract & Objectives

Traditional music recommendation systems suffer severely from the **cold-start problem**, failing to provide meaningful recommendations to new listeners who have not yet accumulated substantial listening history. Furthermore, conventional demographic clustering often falsely assumes that all individuals of an age bracket share identical tastes, ignoring nuanced acoustic preferences.

**MusicMind AI** resolves this dual challenge through a multi-stage hybrid pipeline:
1. **Cold-Start Demographic Prior Modeling**: Automatically classifies a listener into non-overlapping demographic cohorts (`Teen 13–19`, `Young Adult 20–29`, `Adult 30–45`, `Middle-aged 46–60`, `Senior 61+`) and applies historical prior genre affinities.
2. **Multidimensional Acoustic Vector Space**: Extracts normalized audio features including Tempo (BPM), Energy intensity, Valence (musical positivity), and Danceability to match songs through cosine vector similarity.
3. **Session Mood Steering**: Dynamically adjusts target centroid vectors based on real-time mood selection (`Energetic`, `Happy`, `Chill`, `Melancholic`, `Focus`, `Party`).
4. **Explainable AI (XAI)**: Generates human-understandable natural language explanations for every recommendation.
5. **Warm-Start Interaction Feedback**: Continually tunes recommendations as listeners favorite tracks, build playlists, and submit 1–5 star ratings.
6. **Live Empirical ML Evaluation**: Allows administrators to run live evaluation jobs calculating `Precision@K`, `Recall@K`, `NDCG@K`, `MRR`, and `Catalog Coverage %`.

---

## 2. Technology Stack

### Frontend
* **Framework**: React.js 18 with Vite
* **Styling**: Tailwind CSS with dark theme, glassmorphism, and custom scrollbars
* **Routing**: React Router DOM v7
* **Icons**: Lucide React
* **Data Visualization**: Recharts for ML distribution & metric visualizations
* **Audio Engine**: Persistent HTML5 Audio player with reactive Web Audio API synthesizer fallback

### Backend
* **Framework**: FastAPI (Python 3.14 / 3.10+)
* **Validation & Schemas**: Pydantic v2
* **ORM & Database**: SQLAlchemy ORM with SQLite (PostgreSQL compatible)
* **Authentication & Security**: JWT (JSON Web Tokens) with bcrypt password hashing
* **Role-Based Access Control (RBAC)**: Strict dependency injection guards for `listener` and `admin` roles

### Machine Learning
* **Libraries**: scikit-learn, NumPy, pandas
* **Techniques**: Content-Based Filtering, Cosine Similarity, MinMax Feature Normalization, Demographic Baseline Priors, Serendipity Ranking

---

## 3. Project Directory Structure

```
musicmind-ai/
├── frontend/
│   ├── src/
│   │   ├── components/         # SongCard, PlayerBar, ExplainModal, FeedbackModal, etc.
│   │   ├── context/            # AuthContext, AudioPlayerContext, ToastContext
│   │   ├── layouts/            # AppLayout (Sidebar, Topbar, PlayerBar)
│   │   ├── pages/              # Home, Recommendations, Explore, Playlists, Favorites, History, Profile, AgeDetector
│   │   │   ├── auth/           # LoginPage, RegisterPage
│   │   │   └── admin/          # AdminOverview, AdminUsers, AdminSongs, AdminTaxonomy, AdminModelMetrics
│   │   ├── routes/             # AppRoutes (Protected & RBAC route guards)
│   │   ├── services/           # api.js client service
│   │   ├── App.jsx             # Root application wrapper
│   │   ├── index.css           # Tailwind base & custom styles
│   │   └── main.jsx            # React DOM mounting
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js          # API reverse proxy configuration
│
├── backend/
│   ├── app/
│   │   ├── api/                # REST API Routers (auth, users, songs, recommendations, playlists, etc.)
│   │   ├── core/               # config.py, security.py (bcrypt, JWT)
│   │   ├── db/                 # session.py, seed.py (automatic seed initialization)
│   │   ├── ml/                 # recommender.py, evaluator.py, age_detector.py
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic v2 request/response schemas
│   │   └── main.py             # FastAPI entry point & CORS
│   ├── tests/                  # Automated pytest test suite (test_api.py)
│   ├── requirements.txt
│   └── README.md
│
├── data/
│   ├── sample_songs.csv        # 64+ curated multi-decade song dataset with audio features
│   └── README.md
│
├── docs/
│   ├── architecture.md         # Mermaid system diagrams & ER data models
│   ├── api.md                  # Complete REST API reference
│   └── ml_methodology.md       # Mathematical formulas and evaluation metrics
│
├── .env.example
└── README.md
```

---

## 4. Quickstart Installation & Setup

### Prerequisites
* Python 3.10+ (tested on Python 3.14)
* Node.js v18+ and npm (Node.js v22 portable installed in project tools)

---

### Step 1: Backend Setup

Open a terminal in the project directory:

```powershell
cd backend
python -m pip install -r requirements.txt
```

Initialize and seed the database with demo users, taxonomy, and songs:
```powershell
python -m app.db.seed
```

Start the FastAPI backend server:
```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
* Backend API will run at: `http://127.0.0.1:8000`
* Interactive API Documentation (Swagger): `http://127.0.0.1:8000/docs`

---

### Step 2: Frontend Setup

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```
* Frontend Web Application will run at: `http://localhost:5173`

---

## 5. Pre-Configured Demo Credentials for Viva Presentations

For viva presentations and evaluator testing, two pre-configured accounts are provided:

| Role | Email | Password | Persona & Demographic Profile |
|---|---|---|---|
| **Demo Listener** | `listener@musicmind.ai` | `ListenerPassword123!` | Alex Morgan • Age 24 (Young Adult) • Prefers Synthwave, Pop, EDM |
| **Demo Admin** | `admin@musicmind.ai` | `AdminPassword123!` | Prof. Sarah Vance • Age 35 • Full Administrative Privileges |

> **Evaluator Convenience**: The Login page and top navigation bar include **1-Click Quick Login buttons** to instantly switch between Listener and Admin perspectives without typing credentials.

---

## 6. Running Automated Tests

A comprehensive automated test suite verifies authentication, duplicate email validation, RBAC admin route protection, recommendation generation across multiple age cohorts, catalog search, and ML metrics evaluation:

```powershell
cd backend
python -m pytest tests/ -v
```

Expected Output:
```
tests/test_api.py::test_health_check PASSED                              [ 12%]
tests/test_api.py::test_listener_login PASSED                            [ 25%]
tests/test_api.py::test_admin_login PASSED                               [ 37%]
tests/test_api.py::test_registration_and_duplicate_email PASSED          [ 50%]
tests/test_api.py::test_rbac_admin_protection PASSED                     [ 62%]
tests/test_api.py::test_recommendation_generation PASSED                 [ 75%]
tests/test_api.py::test_song_search_and_filters PASSED                   [ 87%]
tests/test_api.py::test_model_evaluation_metrics PASSED                  [100%]

======================= 8 passed in 1.45s =======================
```

---

## 7. Viva Presentation & Demonstration Walkthrough

When presenting this project to evaluators:

1. **Cold-Start Demographic Demonstration**:
   - Log in as `listener@musicmind.ai` (Age 24, Young Adult).
   - Go to **AI Recommendations**. Notice how the system recommends tracks like *Blinding Lights* and *Levitating* with explanations citing the Young Adult demographic fit.
   - Adjust the **Target Listener Age slider** to `17` (Teen): observe the recommendations shift immediately to high-energy modern pop/hip-hop like *Bad Guy* and *Industry Baby*.
   - Move the slider to `68` (Senior): observe the recommendations transition to soothing classics like *What a Wonderful World*, *Clair de Lune*, and *Canon in D*.
2. **Audio Playback**:
   - Click the **Play** button on any song card.
   - The persistent bottom audio player begins playing the audio stream or graceful synthesizer harmony, logs a listening history event in the database, and provides progress seeking and volume control.
3. **Explainable AI (XAI)**:
   - Click the **"Why?"** button on any song card or player bar.
   - A modal displays the exact mathematical and demographic factors: tempo BPM, energy %, valence %, and age cohort resonance.
4. **User Playlists & Favorites**:
   - Click the **Heart** icon on any song to toggle favorite status.
   - Click **+ Playlist** to add songs to existing playlists or create a new playlist.
5. **AI Age Estimator (Extension)**:
   - Navigate to **AI Age Estimator** in the sidebar.
   - Upload an optional portrait photo. The service runs demographic heuristic analysis, displays an estimated age range with clear privacy disclaimers, and offers a button to apply that age to the listener's profile.
6. **Admin Dashboard & Live ML Model Evaluation**:
   - Log in as `admin@musicmind.ai`.
   - Access **Admin Overview** to inspect live database counts (users, songs, playlists, favorites, feedback).
   - Navigate to **Users & Roles** to demonstrate account suspension/activation and role promotions.
   - Navigate to **Song Management** to view acoustic feature vectors (tempo, energy, valence, danceability) and test adding a new song.
   - Navigate to **ML Analytics** and click **"Run Evaluation Job"** to demonstrate real calculation of `Precision@10`, `Recall@10`, `NDCG@10`, `MRR`, and `Catalog Coverage %`.

---

## 8. License
Developed as an academic capstone project for B.Tech Information Technology. Open-sourced under the MIT License.
