# PowerShell script to start both servers
Write-Host "Starting Webeenthere Development Servers..." -ForegroundColor Green
Write-Host ""

# Start Backend Server
Write-Host "Starting Backend Server on port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd E:\webeenthere\server; node server.js"

# Wait a moment
Start-Sleep -Seconds 2

# Start Frontend Server  
Write-Host "Starting Frontend Server on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd E:\webeenthere\client; npm run dev"

Write-Host ""
Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this launcher..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")


