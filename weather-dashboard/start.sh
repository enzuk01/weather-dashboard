#!/bin/bash

# Constants
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESTART_SCRIPT="${SCRIPT_DIR}/restart.sh"
LOG_DIR="${SCRIPT_DIR}/logs"
START_LOG="${LOG_DIR}/start.log"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Logging function
log() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $1" | tee -a "$START_LOG"
}

# Check if restart script exists and is executable
if [ ! -x "$RESTART_SCRIPT" ]; then
    echo "Error: restart.sh not found or not executable"
    echo "Please run: chmod +x restart.sh"
    exit 1
fi

# Function to check if servers are already running
check_running_servers() {
    local backend_running=$(pgrep -f "uvicorn main:app --host 0.0.0.0 --port 5003")
    local frontend_running=$(pgrep -f "PORT=3001 npm start")

    if [ ! -z "$backend_running" ] || [ ! -z "$frontend_running" ]; then
        return 0  # Servers are running
    fi
    return 1  # No servers running
}

# Main function
main() {
    log "Starting Weather Dashboard servers..."

    # Check if servers are already running
    if check_running_servers; then
        log "Servers are already running. Using restart script to ensure clean state..."
        "$RESTART_SCRIPT"
    else
        log "No servers running. Starting fresh..."
        "$RESTART_SCRIPT"
    fi

    log "Server startup process completed. Check logs for details."
}

# Execute main function
main