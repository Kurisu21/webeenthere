@echo off
echo Starting Webeenthere Development Servers...
echo.

echo Starting Backend Server on port 5000...
start "Backend Server" cmd /k "cd /d E:\webeenthere\server && node server.js"

echo Waiting 2 seconds...
timeout /t 2 /nobreak > nul

echo Starting Frontend Server on port 3000...
start "Frontend Server" cmd /k "cd /d E:\webeenthere\client && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this launcher...
pause > nul


