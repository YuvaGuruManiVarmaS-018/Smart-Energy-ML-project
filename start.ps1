# VoltIQ - Single Application Local Launcher
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "⚡ Starting VoltIQ Smart Energy Management Platform" -ForegroundColor Yellow
Write-Host "=====================================================" -ForegroundColor Cyan

# Start Backend in background process
Write-Host "Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Green
$backendProcess = Start-Process python -ArgumentList "-m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000" -PassThru

# Start Frontend in foreground
Write-Host "Starting Vite Frontend on http://localhost:5173..." -ForegroundColor Green
Set-Location frontend
npm run dev

# Stop backend when frontend is closed
if ($backendProcess) {
    Stop-Process -Id $backendProcess.Id -Force
}
