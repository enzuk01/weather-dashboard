#!/bin/bash

# Weather Dashboard Clear and Refresh Script
# This script performs a complete reset and refresh of the application:
# 1. Stops all running servers
# 2. Clears all caches (browser, frontend, backend)
# 3. Updates the cache buster timestamp
# 4. Rebuilds the frontend
# 5. Restarts the backend services
#
# Use this script when you need a complete reset to troubleshoot issues

# Ensure we're in the project root directory
cd "$(dirname "$0")/.." || { echo "Failed to navigate to project root"; exit 1; }

echo "🧹 Weather Dashboard Complete Reset Tool 🧹"
echo "----------------------------------------"

# Stop any running servers
echo "🛑 Stopping all running services..."
pkill -f "python.*app.py" || true
pkill -f "npm.*start" || true
pkill -f "node.*server" || true
echo "✅ Services stopped"

# Clean frontend localStorage cache
echo "📝 Creating localStorage clear utility..."
CLEAR_CACHE_FILE="./frontend/src/utils/clearCache.js"

cat > "$CLEAR_CACHE_FILE" << EOF
/**
 * Auto-generated during the clear-and-refresh script
 * This file provides utilities to clear browser caches
 */

export const clearAllCache = () => {
  try {
    console.log('Clearing all cache...');
    localStorage.clear();
    console.log('All cache cleared successfully');
    return true;
  } catch (error) {
    console.error('Failed to clear cache:', error);
    return false;
  }
};

// Auto-execute cache clear on load
window.addEventListener('load', () => {
  clearAllCache();
  console.log('Cache cleared on page load');
});

export const CACHE_CLEARED_AT = "${date +%s}";
EOF

echo "✅ Cache clearing utility created"

# Update cache buster with new timestamp
echo "📅 Updating cache buster timestamp..."
TIMESTAMP=$(date +%s)
CACHE_BUSTER_FILE="./frontend/src/utils/cacheBuster.js"

cat > "$CACHE_BUSTER_FILE" << EOF
/**
 * Auto-generated during the clear-and-refresh script
 * This file is used to force cache invalidation on new deployments
 * DO NOT EDIT MANUALLY
 */

export const CACHE_BUSTER = "$TIMESTAMP";
EOF

echo "✅ Cache buster updated with timestamp: $TIMESTAMP"

# Clean frontend build and node_modules cache
echo "🧹 Performing deep clean of frontend..."
rm -rf ./frontend/build ./frontend/.next ./frontend/node_modules/.cache
rm -rf ./frontend/node_modules/.vite

# Consider clearing node_modules entirely for a truly fresh installation
read -p "Would you like to completely reinstall npm dependencies? (y/n) " REINSTALL
if [[ $REINSTALL == "y" || $REINSTALL == "Y" ]]; then
  echo "🧹 Removing node_modules and reinstalling dependencies..."
  rm -rf ./frontend/node_modules
  cd frontend || { echo "Failed to navigate to frontend directory"; exit 1; }
  npm install
  cd ..
fi

echo "✅ Frontend clean complete"

# Clean backend cache more thoroughly
echo "🧹 Performing deep clean of backend..."
find ./backend -name "__pycache__" -type d -exec rm -rf {} +
rm -rf ./backend/cache/*
mkdir -p ./backend/cache
touch ./backend/cache/.gitkeep

# Consider clearing Python environment entirely
read -p "Would you like to completely recreate the Python environment? (y/n) " RECREATE_ENV
if [[ $RECREATE_ENV == "y" || $RECREATE_ENV == "Y" ]]; then
  echo "🧹 Recreating Python virtual environment..."
  rm -rf ./venv
  python3 -m venv venv
  source ./venv/bin/activate
  pip install -r ./backend/requirements.txt
fi

echo "✅ Backend clean complete"

# Rebuild frontend
echo "🏗️ Rebuilding frontend..."
cd frontend || { echo "Failed to navigate to frontend directory"; exit 1; }
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Frontend build failed!"
  exit 1
fi
echo "✅ Frontend rebuilt successfully"
cd ..

# Restart services
echo "🔄 Restarting services..."

# Check available start scripts
if [ -f "./direct-start.sh" ]; then
  echo "🛠️ Using direct-start.sh"
  ./direct-start.sh
elif [ -f "./server-restart.sh" ]; then
  echo "🚀 Using server-restart.sh"
  ./server-restart.sh
else
  echo "⚠️ Could not find start scripts, please restart services manually"
  exit 1
fi

echo "✅ Services restarted successfully"
echo ""
echo "🎉 Weather Dashboard completely reset and refreshed! 🎉"
echo "----------------------------------------------------"
echo "Cache buster: $TIMESTAMP"
echo "Cache cleared: Yes (localStorage and server-side)"
echo "Browser instruction: Please also clear your browser cache manually for best results"
echo ""
echo "If you still experience issues:"
echo "1. Try opening the app in a private/incognito window"
echo "2. Clear your browser cache completely"
echo "3. Check the logs in the logs/ directory for specific errors"