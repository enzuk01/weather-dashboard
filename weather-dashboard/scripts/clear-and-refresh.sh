#!/bin/bash

# Clear all caches and restart the Weather Dashboard
# This is the ultimate fix for any cache-related dashboard errors

echo "🔄 Weather Dashboard Troubleshooter 🔄"
echo "-------------------------------------"

# Check if we're in the right directory
cd "$(dirname "$0")/.." || { echo "❌ Failed to navigate to project root"; exit 1; }

# Clean frontend build artifacts
echo "🧹 Cleaning frontend build artifacts..."
rm -rf ./frontend/build ./frontend/.next ./frontend/node_modules/.cache
echo "✅ Build artifacts cleaned"

# Create/update cache buster file
echo "📅 Generating new cache buster..."
CACHE_BUSTER_FILE="./frontend/src/utils/cacheBuster.js"
TIMESTAMP=$(date +%s)

cat > "$CACHE_BUSTER_FILE" << EOF
/**
 * Auto-generated during the clear-and-refresh script
 * This file is used to force cache invalidation on new deployments
 * DO NOT EDIT MANUALLY
 */

export const CACHE_BUSTER = "$TIMESTAMP";
EOF
echo "✅ Cache buster updated to $TIMESTAMP"

# Clean backend cache
echo "🧹 Cleaning backend cache..."
rm -rf ./backend/__pycache__ ./backend/cache/*
mkdir -p ./backend/cache
touch ./backend/cache/.gitkeep
echo "✅ Backend cache cleared"

# Kill any running processes
echo "🛑 Stopping any running servers..."
pkill -f "npm run dev" || true
pkill -f "npm run start" || true
pkill -f "node.*frontend" || true
pkill -f "python3.*app.py" || true
pkill -f "python3.*main.py" || true
sleep 2
echo "✅ Servers stopped"

# Verify no processes are running on the ports
echo "🔍 Checking for conflicting processes..."
PORT_3000=$(lsof -i:3000 | grep LISTEN)
PORT_5001=$(lsof -i:5001 | grep LISTEN)

if [ ! -z "$PORT_3000" ]; then
  echo "⚠️ Port 3000 is still in use. Attempting to force close..."
  lsof -i:3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
fi

if [ ! -z "$PORT_5001" ]; then
  echo "⚠️ Port 5001 is still in use. Attempting to force close..."
  lsof -i:5001 | grep LISTEN | awk '{print $2}' | xargs kill -9
fi
echo "✅ Ports checked and cleared"

# Restart the application
echo "🚀 Starting the application..."
if [ -f "./direct-start.sh" ]; then
  ./direct-start.sh
else
  echo "❌ Could not find direct-start.sh. Please start the application manually."
  exit 1
fi

echo "✨ Refresh complete! The application should now be running with clean caches."
echo "If you still experience issues, please report them with detailed information."