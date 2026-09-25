# MusicMind AI - Single-Command Startup Script (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  MusicMind AI - Age-Wise Music Recommendation System" -ForegroundColor Magenta
Write-Host "==========================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $scriptDir "backend"
$frontendDir = Join-Path $scriptDir "frontend"
$nodeDir = "C:\Users\VSB-AIDS-C199\.gemini\antigravity\scratch\tools\nodejs"

if (Test-Path $nodeDir) {
    $env:PATH = "$nodeDir;$env:PATH"
}

# 1. Initialize & Seed Database if needed
Write-Host "`n[1/3] Checking Database and Seeds..." -ForegroundColor Yellow
$env:PYTHONPATH = $backendDir
python -m app.db.seed

# 2. Launch Backend Server in background
Write-Host "`n[2/3] Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Green
$backendProcess = Start-Process python -ArgumentList "-m uvicorn app.main:app --host 127.0.0.1 --port 8000" -WorkingDirectory $backendDir -PassThru

# 3. Launch Frontend Vite Server
Write-Host "`n[3/3] Starting React Vite Frontend on http://localhost:5173..." -ForegroundColor Green
Write-Host "`nPress Ctrl+C to terminate both servers when finished.`n" -ForegroundColor DarkGray

Start-Process "http://localhost:5173"

try {
    Set-Location $frontendDir
    & "$nodeDir\npm.cmd" run dev
} finally {
    Write-Host "`nShutting down backend process (PID $($backendProcess.Id))..." -ForegroundColor Red
    Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
}
