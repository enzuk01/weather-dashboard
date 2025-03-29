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

# Run version and API config checks
echo "🔍 Running pre-refresh validation checks..."

if [ -x "./scripts/check-versions.sh" ]; then
  ./scripts/check-versions.sh
  if [ $? -ne 0 ]; then
    echo "❌ Version check failed. Please fix version inconsistencies before proceeding."
    exit 1
  fi
fi

if [ -x "./scripts/check-api-config.sh" ]; then
  ./scripts/check-api-config.sh
  if [ $? -ne 0 ]; then
    echo "❌ API configuration check failed. Please fix API config issues before proceeding."
    exit 1
  fi
fi

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

# Verify TypeScript compilation before attempting build
echo "🔍 Verifying TypeScript compilation..."
cd frontend || { echo "Failed to navigate to frontend directory"; exit 1; }

# Create a temporary TypeScript check command
if [ "$PACKAGE_MANAGER" = "npm" ]; then
  echo '{"scripts": {"typecheck": "tsc --noEmit"}}' > temp-package.json
  MERGED_PACKAGE=$(jq -s '.[0].scripts.typecheck = .[1].scripts.typecheck | .[0]' package.json temp-package.json)
  echo "$MERGED_PACKAGE" > package.json
  rm temp-package.json

  npm run typecheck
  TS_CHECK_RESULT=$?
else
  yarn tsc --noEmit
  TS_CHECK_RESULT=$?
fi

if [ $TS_CHECK_RESULT -ne 0 ]; then
  echo "❌ TypeScript compilation failed! Please fix TypeScript errors before proceeding."
  cd ..
  exit 1
fi

echo "✅ TypeScript compilation check passed"

# Rebuild frontend
echo "🏗️ Rebuilding frontend with $PACKAGE_MANAGER..."

if [ "$PACKAGE_MANAGER" = "npm" ]; then
  # Try a development build first to catch any errors
  echo "🧪 Trying development build first to check for errors..."
  BUILD_OUTPUT=$(npm run build --no-production 2>&1)
  BUILD_RESULT=$?

  # Check the build output for compilation errors
  if [ $BUILD_RESULT -ne 0 ] || echo "$BUILD_OUTPUT" | grep -q "ERROR in"; then
    echo "❌ Frontend build failed with errors:"
    echo "$BUILD_OUTPUT" | grep -A 5 "ERROR in"
    cd ..
    exit 1
  fi

  # If dev build succeeds, do the production build
  npm run build
else
  # Similar process for yarn
  echo "🧪 Trying development build first to check for errors..."
  BUILD_OUTPUT=$(yarn build --no-production 2>&1)
  BUILD_RESULT=$?

  if [ $BUILD_RESULT -ne 0 ] || echo "$BUILD_OUTPUT" | grep -q "ERROR in"; then
    echo "❌ Frontend build failed with errors:"
    echo "$BUILD_OUTPUT" | grep -A 5 "ERROR in"
    cd ..
    exit 1
  fi

  yarn build
fi

if [ $? -ne 0 ]; then
  echo "❌ Frontend production build failed!"
  cd ..
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