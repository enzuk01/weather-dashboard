#!/bin/bash

echo "Installing backend dependencies..."
cd "$(dirname "$0")/weather-dashboard/backend"

# Check if pip or pip3 is available
if command -v pip3 &>/dev/null; then
    PIP_CMD="pip3"
elif command -v pip &>/dev/null; then
    PIP_CMD="pip"
else
    echo "Error: Neither pip nor pip3 found. Please install Python and pip."
    exit 1
fi

# Install dependencies
$PIP_CMD install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "Backend dependencies installed successfully!"
    echo "You can now run the backend with: cd weather-dashboard/backend && python3 main.py"
else
    echo "Error: Failed to install backend dependencies."
    exit 1
fi