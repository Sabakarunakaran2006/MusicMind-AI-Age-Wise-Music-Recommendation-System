@echo off
TITLE MusicMind AI Launcher
echo ========================================================
echo   MusicMind AI - Age-Wise Music Recommendation System
echo ========================================================
set CURRENT_DIR=%~dp0
set PATH=C:\Users\VSB-AIDS-C199\.gemini\antigravity\scratch\tools\nodejs;%PATH%
set PYTHONPATH=%CURRENT_DIR%backend

echo.
echo [1/3] Checking Database and Seeds...
cd /d "%CURRENT_DIR%backend"
python -m app.db.seed

echo.
echo [2/3] Starting FastAPI Backend (Port 8000)...
start "MusicMind Backend API" cmd /k "python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

echo.
echo [3/3] Starting Frontend Dev Server (Port 5173)...
cd /d "%CURRENT_DIR%frontend"
start http://localhost:5173
call npm run dev
