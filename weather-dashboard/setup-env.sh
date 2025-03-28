#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to create .env file from template
create_env_file() {
    local template=$1
    local env_file=$2
    if [ ! -f "$env_file" ]; then
        cp "$template" "$env_file"
        print_message "$GREEN" "Created $env_file from template"
    else
        print_message "$YELLOW" "$env_file already exists, skipping"
    fi
}

# Function to validate environment
validate_environment() {
    local errors=0

    # Check Python version
    if command_exists python3; then
        python_version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
        if [ "$(printf '%s\n' "3.8" "$python_version" | sort -V | head -n1)" != "3.8" ]; then
            print_message "$RED" "Python 3.8 or higher is required. Found: $python_version"
            errors=$((errors + 1))
        fi
    else
        print_message "$RED" "Python 3 is not installed"
        errors=$((errors + 1))
    fi

    # Check Node.js version
    if command_exists node; then
        node_version=$(node -v | cut -d'v' -f2)
        if [ "$(printf '%s\n' "16.0.0" "$node_version" | sort -V | head -n1)" != "16.0.0" ]; then
            print_message "$RED" "Node.js 16 or higher is required. Found: $node_version"
            errors=$((errors + 1))
        fi
    else
        print_message "$RED" "Node.js is not installed"
        errors=$((errors + 1))
    fi

    # Check npm version
    if command_exists npm; then
        npm_version=$(npm -v)
        if [ "$(printf '%s\n' "8.0.0" "$npm_version" | sort -V | head -n1)" != "8.0.0" ]; then
            print_message "$RED" "npm 8 or higher is required. Found: $npm_version"
            errors=$((errors + 1))
        fi
    else
        print_message "$RED" "npm is not installed"
        errors=$((errors + 1))
    fi

    # Check required directories
    if [ ! -d "backend" ]; then
        print_message "$RED" "backend directory not found"
        errors=$((errors + 1))
    fi

    if [ ! -d "frontend" ]; then
        print_message "$RED" "frontend directory not found"
        errors=$((errors + 1))
    fi

    return $errors
}

# Main setup process
print_message "$GREEN" "Starting environment setup..."

# Validate environment
print_message "$YELLOW" "Validating environment..."
if ! validate_environment; then
    print_message "$RED" "Environment validation failed. Please fix the issues above."
    exit 1
fi

# Create .env files from templates
print_message "$YELLOW" "Setting up environment files..."
create_env_file "backend/.env.template" "backend/.env"
create_env_file "frontend/.env.template" "frontend/.env"

# Create required directories
print_message "$YELLOW" "Creating required directories..."
mkdir -p backend/logs
mkdir -p frontend/logs

# Install backend dependencies
print_message "$YELLOW" "Installing backend dependencies..."
cd backend || exit 1
pip install -r requirements.txt
cd ..

# Install frontend dependencies
print_message "$YELLOW" "Installing frontend dependencies..."
cd frontend || exit 1
npm install
cd ..

print_message "$GREEN" "Environment setup completed successfully!"
print_message "$YELLOW" "Please review the .env files in both backend and frontend directories and adjust the values as needed."
print_message "$YELLOW" "You can now start the servers using ./server-control.sh start"