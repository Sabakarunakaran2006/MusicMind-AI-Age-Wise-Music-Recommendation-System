# MusicMind AI – Render Cloud Deployment Guide

This guide provides step-by-step instructions and exact copy-paste commands to deploy **MusicMind AI** on [Render.com](https://render.com).

---

## 🚀 Method 1: Single Full-Stack Web Service (Recommended & Easiest)

This method builds the React frontend and serves both the user interface and the FastAPI recommendation engine from a single **Free Tier** Render service.

### Step 1: Push Code to GitHub
Ensure your repository is pushed to:
`https://github.com/Sabakarunakaran2006/MusicMind-AI-Age-Wise-Music-Recommendation-System`

### Step 2: Create Web Service on Render
1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** ➔ Select **Web Service**.
3. Choose **"Build and deploy from a Git repository"** and connect your GitHub repo:
   `MusicMind-AI-Age-Wise-Music-Recommendation-System`

### Step 3: Enter Configuration Details
Fill in the fields exactly as follows:

| Setting | Value to Enter |
|---|---|
| **Name** | `musicmind-ai` *(or your choice)* |
| **Region** | `Oregon (US West)` or `Frankfurt (EU)` |
| **Branch** | `main` |
| **Root Directory** | *(leave empty)* |
| **Runtime** | `Python 3` |
| **Build Command** | `npm --prefix frontend install && npm --prefix frontend run build && pip install -r backend/requirements.txt && python -m backend.app.db.seed` |
| **Start Command** | `uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT` |
| **Instance Type** | `Free` |

### Step 4: Add Environment Variables
Scroll to **Environment Variables** and add:

| Key | Value |
|---|---|
| `PYTHON_VERSION` | `3.11.9` |
| `SECRET_KEY` | `musicmind-super-secret-key-production-ready-2026-btech-final-project` |

### Step 5: Deploy
Click **Create Web Service**. Render will:
1. Install Node.js dependencies and build the React Vite bundle into `frontend/dist`.
2. Install Python backend requirements (`fastapi`, `scikit-learn`, `pandas`, `sqlalchemy`).
3. Run the database seed populating the 64+ tracks, demographic age groups, and demo accounts.
4. Launch FastAPI and serve the entire application at your Render URL:
   `https://musicmind-ai-xxxx.onrender.com`

---

## ⚡ Method 2: Two Separate Services (Backend API + Frontend Static Site)

If you prefer microservice separation:

### Part A: Deploy Backend API (Web Service)
1. **New +** ➔ **Web Service** ➔ Select your repository.
2. Settings:
   - **Name**: `musicmind-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && python -m app.db.seed`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables**:
     - `PYTHON_VERSION`: `3.11.9`
     - `SECRET_KEY`: `musicmind-super-secret-key-production-ready-2026-btech-final-project`
3. Click **Create Web Service**. Copy the generated URL (e.g. `https://musicmind-api.onrender.com`).

### Part B: Deploy Frontend (Static Site)
1. **New +** ➔ **Static Site** ➔ Select your repository.
2. Settings:
   - **Name**: `musicmind-ui`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
3. **Environment Variables**:
   - `VITE_API_URL`: Paste your backend URL: `https://musicmind-api.onrender.com`
4. **Redirects/Rewrites**:
   - Click **Redirects/Rewrites** ➔ **Add Rule**:
     - **Type**: `Rewrite`
     - **Source**: `/*`
     - **Destination**: `/index.html`
5. Click **Create Static Site**.

---

## 🛠️ Verifying Cloud Deployment

Once deployed:
1. Open your Render Web URL in any browser.
2. Click **Listener Demo** or sign in with:
   - **Email**: `listener@musicmind.ai`
   - **Password**: `ListenerPassword123!`
3. Test **AI Recommendations**: adjust the age slider to observe real-time cohort transitions.
4. Test **Audio Playback**: click play on any track to verify persistent streaming.
5. Log in with **Admin Demo** (`admin@musicmind.ai` / `AdminPassword123!`) and navigate to **ML Analytics** to run a live evaluation job.
