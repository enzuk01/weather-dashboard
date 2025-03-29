#!/bin/bash

# Weather Dashboard Refresh Script
# This script performs a complete refresh of the application:
# 1. Clears browser caches
# 2. Updates the cache buster timestamp
# 3. Rebuilds the frontend
# 4. Restarts the backend services

# Ensure we're in the project root directory
cd "$(dirname "$0")/.." || { echo "Failed to navigate to project root"; exit 1; }

echo "🔄 Weather Dashboard Refresh Tool 🔄"
echo "-----------------------------------"

# Update cache buster timestamp
echo "📅 Updating cache buster timestamp..."
TIMESTAMP=$(date +%s)
CACHE_BUSTER_FILE="./frontend/src/utils/cacheBuster.js"

cat > "$CACHE_BUSTER_FILE" << EOF
/**
 * Auto-generated during the refresh-app script
 * This file is used to force cache invalidation on new deployments
 * DO NOT EDIT MANUALLY
 */

export const CACHE_BUSTER = "$TIMESTAMP";
EOF

echo "✅ Cache buster updated with timestamp: $TIMESTAMP"

# Clean frontend build assets
echo "🧹 Cleaning frontend build artifacts..."
rm -rf ./frontend/build ./frontend/.next ./frontend/node_modules/.cache
echo "✅ Build artifacts cleaned"

# Clean backend cache
echo "🧹 Cleaning backend cache..."
rm -rf ./backend/__pycache__ ./backend/cache/*
mkdir -p ./backend/cache
touch ./backend/cache/.gitkeep
echo "✅ Backend cache cleared"

# Check if the frontend is using npm or yarn
if [ -f "./frontend/package-lock.json" ]; then
  PACKAGE_MANAGER="npm"
elif [ -f "./frontend/yarn.lock" ]; then
  PACKAGE_MANAGER="yarn"
else
  echo "⚠️ Could not determine package manager, defaulting to npm"
  PACKAGE_MANAGER="npm"
fi

# Rebuild frontend
echo "🏗️ Rebuilding frontend with $PACKAGE_MANAGER..."
cd frontend || { echo "Failed to navigate to frontend directory"; exit 1; }

if [ "$PACKAGE_MANAGER" = "npm" ]; then
  npm run build
else
  yarn build
fi

if [ $? -ne 0 ]; then
  echo "❌ Frontend build failed!"
  exit 1
fi
echo "✅ Frontend rebuilt successfully"
cd ..

# Restart services
echo "🔄 Restarting services..."

# Check if we're in a development or production environment
if [ -f "./direct-start.sh" ]; then
  echo "🛠️ Development environment detected, using direct-start.sh"
  ./direct-start.sh
elif [ -f "./server-restart.sh" ]; then
  echo "🚀 Production environment detected, using server-restart.sh"
  ./server-restart.sh
else
  echo "⚠️ Could not find start scripts, please restart services manually"
  exit 1
fi

echo "✅ Services restarted successfully"
echo ""
echo "🎉 Weather Dashboard refresh complete! 🎉"
echo "----------------------------------------"
echo "Cache buster: $TIMESTAMP"
echo "Application should now be running with fresh caches"