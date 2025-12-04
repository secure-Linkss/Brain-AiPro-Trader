@echo off
echo ========================================================
echo Brain AiPro Trader - Ollama Setup (Local FREE LLM)
echo ========================================================
echo.
echo This script will:
echo 1. Download and install Ollama
echo 2. Pull the Llama 3.1 8B model (recommended)
echo 3. Start the Ollama service
echo.
echo Requirements:
echo - 8GB RAM minimum (16GB recommended)
echo - 5GB free disk space
echo - Windows 10/11
echo.
pause

echo.
echo Step 1: Checking if Ollama is already installed...
where ollama >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Ollama is already installed!
    goto :pull_model
)

echo [INFO] Ollama not found. Downloading installer...
echo.
echo Opening Ollama download page in your browser...
echo Please download and install Ollama from: https://ollama.com/download/windows
echo.
echo After installation:
echo 1. Close this window
echo 2. Run this script again
echo.
start https://ollama.com/download/windows
pause
exit

:pull_model
echo.
echo Step 2: Pulling Llama 3.1 8B model...
echo This may take 5-10 minutes depending on your internet speed.
echo.
ollama pull llama3.1:8b

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to pull model. Please check your internet connection.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Model downloaded successfully!
echo.

:start_service
echo Step 3: Starting Ollama service...
echo.
echo Ollama will run in the background.
echo You can close this window after it starts.
echo.

start "Ollama Service" ollama serve

echo.
echo Waiting for Ollama to start...
timeout /t 5 /nobreak >nul

echo.
echo Testing Ollama connection...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Ollama is running!
) else (
    echo [WARNING] Ollama might not be running yet. Give it a few more seconds.
)

echo.
echo ========================================================
echo SETUP COMPLETE!
echo ========================================================
echo.
echo Ollama is now running with Llama 3.1 8B model.
echo.
echo Next steps:
echo 1. Keep the "Ollama Service" window open
echo 2. Run: npm run dev
echo 3. Your AI analyst will use the local LLM (FREE!)
echo.
echo Model info:
echo - Model: Llama 3.1 8B
echo - Quality: GPT-3.5 level
echo - Speed: ~2 seconds per response
echo - Cost: FREE (runs locally)
echo.
echo To use a better model (requires 48GB RAM):
echo   ollama pull llama3.1:70b
echo   Then update .env: OLLAMA_MODEL=llama3.1:70b
echo.
pause
