#!/bin/bash

# Color codes for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to extract version from package.json
get_npm_version() {
    if [ ! -f "$1" ]; then
        echo "ERROR"
        return
    fi
    version=$(grep '"version":' "$1" | cut -d'"' -f4)
    echo "$version"
}

# Function to extract version from pyproject.toml
get_python_version() {
    if [ ! -f "$1" ]; then
        echo "ERROR"
        return
    fi
    version=$(grep 'version = ' "$1" | cut -d'"' -f2)
    echo "$version"
}

# Function to extract version from CHANGELOG.md
get_changelog_version() {
    if [ ! -f "$1" ]; then
        echo "ERROR"
        return
    fi
    # Get the first version number after [Unreleased]
    version=$(awk '/## \[Unreleased\]/{flag=1;next}/## \[/{if(flag){print $2;exit}}' "$1" | tr -d '[]')
    echo "$version"
}

# Display script header
echo -e "${YELLOW}=== Version Check Script ===${NC}\n"

# Get versions from different files
FRONTEND_VERSION=$(get_npm_version "weather-dashboard/frontend/package.json")
BACKEND_VERSION=$(get_python_version "weather-dashboard/backend/pyproject.toml")
CHANGELOG_VERSION=$(get_changelog_version "weather-dashboard/CHANGELOG.md")

# Print versions
echo -e "Frontend version (package.json):  ${GREEN}$FRONTEND_VERSION${NC}"
echo -e "Backend version (pyproject.toml): ${GREEN}$BACKEND_VERSION${NC}"
echo -e "Latest version in CHANGELOG.md:   ${GREEN}$CHANGELOG_VERSION${NC}\n"

# Check if any version file is missing
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