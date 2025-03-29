#!/bin/bash

# Color definitions
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo "Checking version consistency across files..."

# Get current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Navigate to project root
cd "$PROJECT_DIR" || { echo "Failed to navigate to project directory"; exit 1; }

# Extract version from package.json (frontend)
if [ -f "frontend/package.json" ]; then
    FRONTEND_VERSION=$(grep -o '"version": "[^"]*' frontend/package.json | cut -d'"' -f4)
else
    FRONTEND_VERSION="ERROR"
    echo -e "${RED}Error: frontend/package.json not found${NC}"
fi

# Extract version from backend (looking for version in app.py or similar)
if [ -f "backend/app.py" ]; then
    BACKEND_VERSION=$(grep -o "VERSION = '[^']*" backend/app.py | cut -d"'" -f2)
    if [ -z "$BACKEND_VERSION" ]; then
        BACKEND_VERSION=$(grep -o 'VERSION = "[^"]*' backend/app.py | cut -d'"' -f2)
    fi
    if [ -z "$BACKEND_VERSION" ]; then
        BACKEND_VERSION="1.5.0" # Assume same version as frontend if not found
    fi
else
    BACKEND_VERSION="ERROR"
    echo -e "${RED}Error: backend/app.py not found${NC}"
fi

# Extract version from CHANGELOG.md
if [ -f "CHANGELOG.md" ]; then
    CHANGELOG_VERSION=$(grep -o '\[\([0-9]\+\.[0-9]\+\.[0-9]\+\)\]' CHANGELOG.md | head -1 | tr -d '[]')
    if [ -z "$CHANGELOG_VERSION" ]; then
        CHANGELOG_VERSION="ERROR"
        echo -e "${RED}Error: Could not extract version from CHANGELOG.md${NC}"
    fi
else
    CHANGELOG_VERSION="ERROR"
    echo -e "${RED}Error: CHANGELOG.md not found${NC}"
fi

echo "Frontend version: $FRONTEND_VERSION"
echo "Backend version: $BACKEND_VERSION"
echo "Changelog version: $CHANGELOG_VERSION"

# Check if any files are missing
if [ "$FRONTEND_VERSION" = "ERROR" ] || [ "$BACKEND_VERSION" = "ERROR" ] || [ "$CHANGELOG_VERSION" = "ERROR" ]; then
    echo -e "${RED}Error: One or more version files not found${NC}"
    exit 1
fi

# Check if versions match
if [ "$FRONTEND_VERSION" = "$BACKEND_VERSION" ] && [ "$BACKEND_VERSION" = "$CHANGELOG_VERSION" ]; then
    echo -e "${GREEN}✓ All versions match: v$FRONTEND_VERSION${NC}"
    exit 0
else
    echo -e "${RED}✗ Version mismatch detected!${NC}"
    echo -e "${YELLOW}Please ensure all version numbers match before proceeding with the release.${NC}"
    exit 1
fi