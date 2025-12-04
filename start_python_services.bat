@echo off
echo ===================================================
echo Starting Brain AiPro Trader - Python Microservices
echo ===================================================

echo Starting Pattern Detector (Port 8001)...
cd python-services\pattern-detector
start "Pattern Detector AI" python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
cd ..\..

echo Starting News Agent (Port 8002)...
cd python-services\news-agent
start "News Agent AI" python -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload
cd ..\..

echo Starting Backtest Engine (Port 8003)...
cd python-services\backtest-engine
start "Backtest Engine AI" python -m uvicorn main:app --host 0.0.0.0 --port 8003 --reload
cd ..\..

echo.
echo All AI services started!
echo Please keep these windows open for AI features to work.
echo.
pause
