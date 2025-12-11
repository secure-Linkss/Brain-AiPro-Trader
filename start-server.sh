#!/bin/bash

# AI Trading Platform - Server Startup Script
# This script starts the development server on port 49235

echo "🚀 Starting AI Trading Platform..."
echo "=================================="
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please ensure the environment file exists."
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push database schema
echo "📊 Setting up database..."
npx prisma db push

# Start the development server
echo ""
echo "✅ Starting Next.js development server on port 49235..."
echo "🌐 Open http://localhost:49235 in your browser"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=================================="
echo ""

npx next dev -p 49235
