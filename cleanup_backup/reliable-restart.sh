#!/bin/bash

# reliable-restart.sh - Simple, reliable script to restart the Weather Dashboard servers

# Set to exit on error
set -e

# Set constants
BACKEND_PORT=5003
FRONTEND_PORT=3000
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
LOGS_DIR="$SCRIPT_DIR/logs"

# Color codes for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create logs directory if it doesn't exist
mkdir -p "$LOGS_DIR"

# Print functions
print_message() {
  echo -e "${BLUE}==>${NC} $1"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}!${NC} $1"
}

# Kill process running on a specific port
kill_port_process() {
  local port=$1
  local pids

  print_message "Killing any process on port $port..."

  # Get PIDs using lsof
  pids=$(lsof -ti:$port 2>/dev/null)

  if [ -n "$pids" ]; then
    echo "Killing PIDs: $pids"
    kill -9 $pids 2>/dev/null || true
    print_success "Process(es) on port $port terminated"
  else
    print_message "No process found on port $port"
  fi
}

# Kill processes by pattern
kill_by_pattern() {
  local pattern=$1
  local pids

  print_message "Killing processes matching pattern: $pattern"

  # Use pkill for pattern matching
  pkill -f "$pattern" 2>/dev/null || true

  print_message "Pattern-matching processes terminated"
}

# Start the backend server
start_backend() {
  print_message "Starting backend server..."

  cd "$SCRIPT_DIR/backend" || exit 1

  # Start the Flask app
  ../venv/bin/python app.py --no-debug > "$LOGS_DIR/backend.log" 2>&1 &
  local BACKEND_PID=$!

  # Wait for backend to start
  print_message "Waiting for backend to start on port $BACKEND_PORT..."
  local start_time=$(date +%s)
  local timeout=15  # 15 seconds timeout

  while true; do
    sleep 1
    if lsof -ti:$BACKEND_PORT >/dev/null 2>&1; then
      print_success "Backend server is running on port $BACKEND_PORT with PID $BACKEND_PID"
      break
    fi

    local current_time=$(date +%s)
    local elapsed=$((current_time - start_time))

    if [ $elapsed -ge $timeout ]; then
      print_error "Timed out waiting for backend server to start"
      print_warning "Check logs at $LOGS_DIR/backend.log for details"
      return 1
    fi

    echo -n "."
  done

  # Return to original directory
  cd "$SCRIPT_DIR" || exit 1
  return 0
}

# Start the frontend server
start_frontend() {
  print_message "Starting frontend server..."

  cd "$SCRIPT_DIR/frontend" || exit 1

  # Set environment variables and start the React app
  BROWSER=none \
  DISABLE_ESLINT_PLUGIN=true \
  TSC_COMPILE_ON_ERROR=true \
  ESLINT_NO_DEV_ERRORS=true \
  PORT=$FRONTEND_PORT \
  npm start > "$LOGS_DIR/frontend.log" 2>&1 &

  local FRONTEND_PID=$!

  # Wait for frontend process to start
  print_message "Waiting for frontend to start on port $FRONTEND_PORT..."
  local start_time=$(date +%s)
  local timeout=30  # 30 seconds timeout

  while true; do
    sleep 1
    if ps -p $FRONTEND_PID >/dev/null && lsof -ti:$FRONTEND_PORT >/dev/null 2>&1; then
      print_success "Frontend server is running on port $FRONTEND_PORT with PID $FRONTEND_PID"
      break
    fi

    # Check if process died
    if ! ps -p $FRONTEND_PID >/dev/null; then
      print_error "Frontend process $FRONTEND_PID died"
      print_warning "Check logs at $LOGS_DIR/frontend.log for details"
      return 1
    fi

    local current_time=$(date +%s)
    local elapsed=$((current_time - start_time))

    if [ $elapsed -ge $timeout ]; then
      print_warning "Timed out waiting for frontend server to listen on port $FRONTEND_PORT"
      print_warning "Process is still running (PID $FRONTEND_PID), but may not be listening yet"
      break
    fi

    echo -n "."
  done

  # Return to original directory
  cd "$SCRIPT_DIR" || exit 1
  return 0
}

# Restart the backend server
restart_backend() {
  print_message "Restarting backend server..."

  # Kill existing backend processes
  kill_port_process $BACKEND_PORT
  kill_by_pattern "python.*app.py"

  # Start backend server
  start_backend

  print_message "Backend restart complete"
}

# Restart the frontend server
restart_frontend() {
  print_message "Restarting frontend server..."

  # Kill existing frontend processes
  kill_port_process $FRONTEND_PORT
  kill_by_pattern "node.*react-scripts"

  # Start frontend server
  start_frontend

  print_message "Frontend restart complete"
}

# Restart both servers
restart_all() {
  print_message "Restarting all servers..."

  # Kill existing processes
  kill_port_process $BACKEND_PORT
  kill_port_process $FRONTEND_PORT
  kill_by_pattern "python.*app.py"
  kill_by_pattern "node.*react-scripts"

  # Start backend first
  start_backend

  # Then start frontend
  start_frontend

  print_success "All servers restarted"
  print_message "Dashboard should be available at: http://localhost:$FRONTEND_PORT"
  print_message "API should be available at: http://localhost:$BACKEND_PORT/api"
  print_message "Health endpoint: http://localhost:$BACKEND_PORT/api/health"
}

# Show help
show_help() {
  echo "Usage: $0 [backend|frontend|all|help]"
  echo
  echo "Options:"
  echo "  backend   Restart only the backend server"
  echo "  frontend  Restart only the frontend server"
  echo "  all       Restart both servers (default if no option provided)"
  echo "  help      Show this help message"
  echo
  echo "Examples:"
  echo "  $0             # Restart both servers"
  echo "  $0 backend     # Restart only the backend server"
  echo "  $0 frontend    # Restart only the frontend server"
}

# Main execution
case "$1" in
  "backend")
    restart_backend
    ;;
  "frontend")
    restart_frontend
    ;;
  "help")
    show_help
    ;;
  "all"|"")
    restart_all
    ;;
  *)
    print_error "Unknown option: $1"
    show_help
    exit 1
    ;;
esac

exit 0