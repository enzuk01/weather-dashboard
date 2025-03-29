#!/bin/bash

# Weather Dashboard Project Cleanup Script
# This script implements the cleanup plan to remove zombie files and code

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to create backups
backup_file() {
    local file=$1
    if [ -f "$file" ]; then
        cp -v "$file" "${file}.cleanup-bak"
        print_success "Created backup of $file"
    else
        print_warning "Cannot backup: $file does not exist"
    fi
}

# Verify we're in the right directory
if [ ! -d "weather-dashboard" ]; then
    print_error "Script must be run from the project root directory!"
    exit 1
fi

# Create a backup directory
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
BACKUP_DIR="cleanup_backup_${TIMESTAMP}"
mkdir -p "$BACKUP_DIR"
print_message "Created backup directory: $BACKUP_DIR"

# Function to safely remove a file
remove_file() {
    local file=$1
    if [ -f "$file" ]; then
        local backup_path="${BACKUP_DIR}/$(basename "$file")"
        cp "$file" "$backup_path"
        rm -f "$file"
        print_success "Removed $file (backup saved to $backup_path)"
    else
        print_warning "File not found: $file"
    fi
}

# Confirm with user before proceeding
echo -e "${YELLOW}=== Weather Dashboard Cleanup ===${NC}"
echo "This script will remove unnecessary files from the project."
echo "All removed files will be backed up to $BACKUP_DIR directory."
echo ""
echo "The following files will be removed:"
echo "1. Redundant server management scripts"
echo "2. Backup and temporary files"
echo ""
read -p "Do you want to proceed? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_message "Operation cancelled by user"
    exit 1
fi

# First, run tests to ensure baseline functionality
print_message "Running baseline tests..."
cd weather-dashboard/frontend && npm test
if [ $? -ne 0 ]; then
    print_error "Baseline tests failed! Stopping cleanup to prevent further issues."
    exit 1
fi
cd ../..

# 1. Remove redundant server management scripts
print_message "Removing redundant server management scripts..."

# Root directory scripts
remove_file "reliable-restart.sh"
remove_file "restart-servers.sh"
remove_file "restart-servers-new.sh"

# Weather dashboard directory scripts
remove_file "weather-dashboard/restart-servers.sh"
remove_file "weather-dashboard/simple-start.sh"
remove_file "weather-dashboard/start-servers.sh"
remove_file "weather-dashboard/run.sh"

# 2. Remove backup and temporary files
print_message "Removing backup and temporary files..."
remove_file "weather-dashboard/backend/app.py.bak"
remove_file "response.json"

# Find and remove any other .bak files
print_message "Searching for other .bak files..."
find . -name "*.bak" | while read -r bakfile; do
    if [[ ! "$bakfile" == *"/node_modules/"* ]] && [[ ! "$bakfile" == *"/venv/"* ]]; then
        remove_file "$bakfile"
    fi
done

# Run tests again to verify nothing broke
print_message "Running tests to verify functionality..."
cd weather-dashboard/frontend && npm test
if [ $? -ne 0 ]; then
    print_error "Tests failed after cleanup! You may need to restore from backups."
    print_error "Backups are located in $BACKUP_DIR directory."
    exit 1
fi
cd ../..

print_success "Cleanup completed successfully!"
echo -e "${GREEN}Summary:${NC}"
echo "- Removed redundant server management scripts"
echo "- Removed backup and temporary files"
echo "- All removed files were backed up to: $BACKUP_DIR"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update documentation references if needed"
echo "2. Consider consolidating remaining scripts into weather-dashboard/scripts/"
echo "3. Commit changes: git add -A && git commit -m \"chore: remove zombie files and code\""