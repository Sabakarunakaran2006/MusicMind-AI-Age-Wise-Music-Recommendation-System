# MusicMind AI – System Architecture Documentation

## 1. Overview
**MusicMind AI** is an intelligent, full-stack, age-wise and content-based music recommendation platform designed for B.Tech Information Technology final-year project demonstration. It addresses the classical **cold-start problem** by leveraging demographic age-group priors combined with explicit user preferences and multi-dimensional audio feature cosine vector similarity.

---

## 2. High-Level Architecture Diagram

```mermaid
flowchart TD
    Client["React 18 + Vite Frontend\n(Tailwind CSS, Lucide, Recharts)"]
    
    subgraph BackendGateway["FastAPI Gateway (/api)"]
        AuthMiddleware["JWT Authentication & RBAC Filter"]
        Routers["REST API Routers\n(Auth, Users, Songs, Recommendations,\nPlaylists, Favorites, History, Feedback, Admin)"]
    end
    
    subgraph IntelligenceEngine["Music Recommendation Engine"]
        DemographicClassifier["Age Cohort Classifier\n(Teen, Young Adult, Adult, Middle-aged, Senior)"]
        VectorEngine["Cosine Similarity Engine\n(Tempo, Energy, Valence, Danceability, Year)"]
        HybridScorer["Hybrid Ranker & Diversity Filter"]
        Explainer["Natural Language Explainability Generator"]
        Evaluator["Evaluation Engine\n(Precision@K, Recall@K, NDCG, Coverage, MRR)"]
    end

    subgraph DataStorage["Data Layer"]
        SQLiteDB[("SQLite / PostgreSQL Database\n(SQLAlchemy ORM)")]
        SongsDataset["Sample Audio Feature Dataset\n(64+ tracks across eras)"]
    end

    Client -->|HTTPS / REST + JWT| AuthMiddleware
    AuthMiddleware --> Routers
    Routers --> IntelligenceEngine
    Routers --> DataStorage
    IntelligenceEngine --> DataStorage
```

---

## 3. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    users ||--o{ user_preferences : "has (1:1)"
    users ||--o{ playlists : "creates (1:N)"
    users ||--o{ favorites : "likes (1:N)"
    users ||--o{ listening_history : "records (1:N)"
    users ||--o{ feedback : "submits (1:N)"
    
    playlists ||--o{ playlist_songs : "contains (1:N)"
    songs ||--o{ playlist_songs : "in (1:N)"
    songs ||--o{ favorites : "in (1:N)"
    songs ||--o{ listening_history : "in (1:N)"
    songs ||--o{ feedback : "in (1:N)"

    users {
        int id PK
        string name
        string email UK
        string password_hash
        string role
        int age
        boolean is_active
        datetime created_at
    }

    user_preferences {
        int id PK
        int user_id FK
        text preferred_genres
        string preferred_language
        string mood
        string listening_purpose
        boolean explicit_content
    }

    songs {
        int id PK
        string title
        string artist
        string genre
        string language
        int release_year
        float tempo
        float energy
        float valence
        float danceability
        string target_age_group
        string cover_image
        string audio_url
        string external_url
    }

    age_groups {
        int id PK
        string name UK
        int min_age
        int max_age
        string description
    }
```

---

## 4. Key Architectural Pillars

### 4.1 Cold-Start Mitigation
When a newly registered listener has zero listening history:
1. The user's age is resolved into a demographic cohort (e.g. 24 -> Young Adult).
2. The cohort's empirical prior affinities (e.g., preference for Indie, Synthwave, EDM, high danceability, release year $\ge 2010$) initialize the candidate space.
3. Explicit mood inputs and user-selected genres are combined to construct a target query feature vector.
4. Cosine similarity retrieves optimal candidate songs without requiring existing interaction history.

### 4.2 Warm-Start Hybrid Personalization
When a user accumulates interactions (favorited songs, listening history, $\ge 4$-star ratings):
1. An empirical user profile vector is computed by averaging the acoustic features of their top-rated and favorited tracks.
2. The query vector blends 60% historical profile and 40% current session context (mood and temporary filters).
3. Feedback penalties and bonuses are dynamically added to candidate scores to refine future suggestions.

### 4.3 Role-Based Access Control (RBAC)
- **Listener**: Restricted to their own profile, recommendations, playlists, history, and favorites.
- **Admin**: Has privileged access to system statistics, user deactivation/promotion, song metadata CRUD, demographic cohort boundaries, and live ML model evaluation execution.
- Security enforcement is validated strictly on the backend via dependency injection (`require_admin`).
