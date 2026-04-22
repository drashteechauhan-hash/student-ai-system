@echo off
echo.
echo ==============================================
echo   EduSense AI - Windows Setup ^& Launch
echo ==============================================
echo.

:: Check Python
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python not found. Install Python 3.9+ from python.org
    pause & exit /b 1
)

:: Check Node
node --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found. Install from nodejs.org
    pause & exit /b 1
)

echo [1/4] Setting up Python backend...
cd backend
IF NOT EXIST venv (
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -q -r requirements.txt
echo     Done.

echo.
echo [2/4] Training ML models...
python ml_pipeline.py
echo     Done.

call venv\Scripts\deactivate.bat
cd ..

echo.
echo [3/4] Installing frontend packages...
cd frontend
call npm install --silent
echo     Done.
cd ..

echo.
echo [4/4] Launching servers...
echo.
echo =============================================
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8000
echo   API Docs:  http://localhost:8000/docs
echo =============================================
echo.

:: Start backend in new window
start "EduSense Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn main:app --reload --port 8000"

:: Wait for backend
timeout /t 4 /nobreak >nul

:: Start frontend in new window
start "EduSense Frontend" cmd /k "cd frontend && npm start"

echo Both servers launching in separate windows.
echo Open http://localhost:3000 in your browser.
echo.
pause
