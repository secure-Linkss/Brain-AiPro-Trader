#!/bin/bash
# Startup script for backtest-engine service
# Initializes database with default users before starting the API

set -e

echo "🚀 Starting Brain AI Pro Trader Backtest Engine..."

# Run database initialization
echo "📦 Initializing database..."
python backtesting_engine/init_db.py || echo "⚠️  Database initialization skipped (may already be initialized)"

# Start the FastAPI server
echo "🎯 Starting API server on port 8003..."
exec uvicorn backtesting_engine.main:app --host 0.0.0.0 --port 8003
