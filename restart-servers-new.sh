#!/bin/bash

# restart-servers.sh - Utility script to restart Weather Dashboard servers
# This script handles restarting servers with either Supervisor or PM2

# Set to exit on error when running commands, but allow command checks to fail
set -e

# Project ports
BACKEND_PORT=5003
FRONTEND_PORT=3000

# Check if running as root (required for some supervisor operations)
if [ "$EUID" -eq 0 ]; then
  SUDO=""
else
  SUDO="sudo"
fi

# Color codes for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print messages
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

# Check if services are running on expected ports
check_running_services() {
  backend_running=false
  frontend_running=false

  if lsof -ti:$BACKEND_PORT &>/dev/null; then
    backend_running=true
  fi

  if lsof -ti:$FRONTEND_PORT &>/dev/null; then
    frontend_running=true
  fi

  if $backend_running || $frontend_running; then
    return 0  # At least one service is running
  else
    return 1  # No services running
  fi
}

# Check if supervisor is installed and running our services
check_supervisor() {
  # First check if supervisor is installed
  if ! command -v supervisorctl &>/dev/null; then
    return 1
  fi

  # Try a non-sudo command first to see if we have permissions
  if supervisorctl status 2>/dev/null | grep -q "weather-dashboard"; then
    return 0
  fi

  # If we need sudo, check if there are any services running before asking for password
  if check_running_services; then
    # Only try sudo if we have services running that might be managed by supervisor
    if $SUDO supervisorctl status 2>/dev/null | grep -q "weather-dashboard"; then
      return 0
    fi
  fi

  return 1
}

# Check if PM2 is installed and running our services
check_pm2() {
  # First check if pm2 is installed
  if ! command -v pm2 &>/dev/null; then
    return 1
  fi

  # Check if PM2 is managing our services
  if pm2 list 2>/dev/null | grep -q "weather-dashboard"; then
    return 0
  fi

  return 1
}

# Restart with supervisor
restart_with_supervisor() {
  print_message "Restarting services with Supervisor..."

  case "$1" in
    "backend")
      print_message "Restarting backend service..."
      $SUDO supervisorctl restart weather-dashboard-backend
      print_success "Backend service restarted"
      ;;
    "frontend")
      print_message "Restarting frontend service..."
      $SUDO supervisorctl restart weather-dashboard-frontend
      print_success "Frontend service restarted"
      ;;
    *)
      print_message "Restarting all services..."
      $SUDO supervisorctl restart weather-dashboard-backend weather-dashboard-frontend
      print_success "All services restarted"
      ;;
  esac
}

# Restart with PM2
restart_with_pm2() {
  print_message "Restarting services with PM2..."

  case "$1" in
    "backend")
      print_message "Restarting backend service..."
      pm2 restart weather-dashboard-backend
      print_success "Backend service restarted"
      ;;
    "frontend")
      print_message "Restarting frontend service..."
      pm2 restart weather-dashboard-frontend
      print_success "Frontend service restarted"
      ;;
    *)
      print_message "Restarting all services..."
      pm2 restart all
      print_success "All services restarted"
      ;;
  esac
}

# Get PIDs for processes listening on our ports
get_port_pids() {
  local port=$1
  lsof -ti:$port 2>/dev/null || echo ""
}

# Perform a restart using direct process management
restart_direct() {
  print_message "Performing direct process restart..."

  case "$1" in
    "backend")
      print_message "Restarting backend service..."
      local backend_pid=$(get_port_pids $BACKEND_PORT)
      if [ -n "$backend_pid" ]; then
        kill -9 $backend_pid 2>/dev/null || true
        print_message "Backend process terminated"
      else
        print_warning "No backend process found running on port $BACKEND_PORT"
      fi

      # Start backend
      cd "$(dirname "$0")" || exit 1
      if [ -f "./simple-start.sh" ]; then
        print_message "Starting backend service..."
        cd backend || exit 1
        ../venv/bin/python app.py --no-debug > ../logs/backend.log 2>&1 &
        cd ..
        print_success "Backend service started"
      else
        print_error "Could not find app.py. Please start backend manually."
      fi
      ;;

    "frontend")
      print_message "Restarting frontend service..."
      local frontend_pid=$(get_port_pids $FRONTEND_PORT)
      if [ -n "$frontend_pid" ]; then
        kill -9 $frontend_pid 2>/dev/null || true
        print_message "Frontend process terminated"
      else
        print_warning "No frontend process found running on port $FRONTEND_PORT"
      fi

      # Start frontend
      cd "$(dirname "$0")" || exit 1
      if [ -f "./frontend/package.json" ]; then
        print_message "Starting frontend service..."
        cd frontend || exit 1
        BROWSER=none \
        DISABLE_ESLINT_PLUGIN=true \
        TSC_COMPILE_ON_ERROR=true \
        ESLINT_NO_DEV_ERRORS=true \
        PORT=3000 \
        npm start > ../logs/frontend.log 2>&1 &
        cd ..
        print_success "Frontend service started with PID $!"
      else
        print_error "Could not find frontend/package.json. Please start frontend manually."
      fi
      ;;

    *)
      print_message "Restarting all services..."
      local backend_pid=$(get_port_pids $BACKEND_PORT)
      local frontend_pid=$(get_port_pids $FRONTEND_PORT)

      if [ -n "$backend_pid" ]; then
        kill -9 $backend_pid 2>/dev/null || true
        print_message "Backend process terminated"
      fi

      if [ -n "$frontend_pid" ]; then
        kill -9 $frontend_pid 2>/dev/null || true
        print_message "Frontend process terminated"
      fi

      # Start both services using simple-start.sh
      cd "$(dirname "$0")" || exit 1
      if [ -f "./simple-start.sh" ]; then
        print_message "Starting services with simple-start.sh..."
        chmod +x ./simple-start.sh
        ./simple-start.sh &
        print_success "Services started with simple-start.sh"
      else
        print_error "Could not find simple-start.sh. Please start services manually."
      fi
      ;;
  esac
}

# Perform a clean restart (stop everything and start fresh)
clean_restart() {
  print_message "Performing clean restart of all services..."

  # Check if a specific method was requested
  case "$1" in
    "supervisor")
      if command -v supervisorctl &>/dev/null; then
        $SUDO supervisorctl stop weather-dashboard-backend weather-dashboard-frontend
        $SUDO supervisorctl remove weather-dashboard-backend weather-dashboard-frontend
        $SUDO supervisorctl reread
        $SUDO supervisorctl update
        $SUDO supervisorctl start weather-dashboard-backend weather-dashboard-frontend
        print_success "Clean restart with Supervisor completed"
      else
        print_error "Supervisor not found. Using direct restart instead."
        restart_direct "all"
      fi
      ;;

    "pm2")
      if command -v pm2 &>/dev/null; then
        pm2 delete all
        cd "$(dirname "$0")" || exit 1
        if [ -f "./start-with-pm2.sh" ]; then
          chmod +x ./start-with-pm2.sh
          ./start-with-pm2.sh
          print_success "Clean restart with PM2 completed"
        else
          print_error "Could not find start-with-pm2.sh. Using simple-start.sh instead."
          restart_direct "all"
        fi
      else
        print_error "PM2 not found. Using direct restart instead."
        restart_direct "all"
      fi
      ;;

    *)
      # Default to direct restart which doesn't require sudo
      print_message "Using direct process management for clean restart..."
      restart_direct "all"
      ;;
  esac
}

# Show the status of all services
show_status() {
  print_message "Checking service status..."

  # Always start with direct check, which doesn't require sudo
  print_message "Checking ports directly (no sudo required):"

  echo -e "\nBackend (port $BACKEND_PORT):"
  if lsof -i:$BACKEND_PORT 2>/dev/null; then
    print_success "Backend is running"
  else
    print_warning "Backend is not running"
  fi

  echo -e "\nFrontend (port $FRONTEND_PORT):"
  if lsof -i:$FRONTEND_PORT 2>/dev/null; then
    print_success "Frontend is running"
  else
    print_warning "Frontend is not running"
  fi

  echo ""

  # Then check with process managers if requested
  if [ "$1" = "full" ]; then
    if check_supervisor; then
      print_message "Services managed by Supervisor:"
      if [ "$SUDO" = "sudo" ]; then
        print_warning "Note: Some operations may require sudo privileges"
      fi
      $SUDO supervisorctl status
    elif check_pm2; then
      print_message "Services managed by PM2:"
      pm2 list
    else
      print_message "No process manager detected."
    fi
  else
    print_message "For process manager details, run: ./restart-servers.sh status full"
  fi
}

# Show usage information
show_help() {
  echo "Usage: ./restart-servers.sh [OPTION] [SUBOPTION]"
  echo
  echo "Restart Weather Dashboard servers using either Supervisor, PM2, or direct process management."
  echo
  echo "Options:"
  echo "  backend              Restart only the backend service"
  echo "  frontend             Restart only the frontend service"
  echo "  all                  Restart both services (default if no option provided)"
  echo "  clean [METHOD]       Perform a complete stop and fresh restart of all services"
  echo "                         METHOD can be: supervisor, pm2 (default: direct)"
  echo "  status [full]        Show the status of all services"
  echo "                         Add 'full' to check process manager details (may require sudo)"
  echo "  direct [service]     Force direct process management (kill and restart)"
  echo "                         service can be: backend, frontend (default: all)"
  echo "  diagnostics [TYPE]   Run diagnostics and health checks"
  echo "                         TYPE can be: backend, frontend, logs, info (default: all)"
  echo "  diag                 Alias for diagnostics"
  echo "  check                Alias for diagnostics"
  echo "  help                 Show this help message"
  echo
  echo "Examples:"
  echo "  ./restart-servers.sh                  # Restart all services"
  echo "  ./restart-servers.sh backend          # Restart only the backend"
  echo "  ./restart-servers.sh clean            # Perform a clean restart (direct method)"
  echo "  ./restart-servers.sh clean pm2        # Perform a clean restart using PM2"
  echo "  ./restart-servers.sh status           # Show current status (no sudo required)"
  echo "  ./restart-servers.sh status full      # Show detailed status with process manager info"
  echo "  ./restart-servers.sh direct           # Force direct process management for all services"
  echo "  ./restart-servers.sh direct backend   # Force direct process management for backend only"
  echo "  ./restart-servers.sh diagnostics      # Run full diagnostics on all services"
  echo "  ./restart-servers.sh diagnostics logs # Check log files for errors"
}

# Main execution
case "$1" in
  "backend"|"frontend")
    if check_supervisor; then
      restart_with_supervisor "$1"
    elif check_pm2; then
      restart_with_pm2 "$1"
    else
      restart_direct "$1"
    fi
    ;;
  "clean")
    clean_restart "$2"
    ;;
  "status")
    show_status "$2"
    ;;
  "direct")
    restart_direct "$2"
    ;;
  "help")
    show_help
    ;;
  "diagnostics"|"diag"|"check")
    # Load the utility functions if not already loaded
    if ! command -v run_full_diagnostics &>/dev/null; then
      if [ -f "./server-utils.sh" ]; then
        print_message "Loading server utilities..."
        source ./server-utils.sh
      else
        print_error "Could not find server-utils.sh file"
        exit 1
      fi
    fi

    # Run diagnostics based on the subcommand
    case "$2" in
      "backend")
        print_message "Running backend diagnostics..."
        check_backend_health
        ;;
      "frontend")
        print_message "Running frontend diagnostics..."
        check_frontend_health
        ;;
      "logs")
        print_message "Checking log files for errors..."
        check_log_errors
        ;;
      "info")
        print_message "Getting service information..."
        get_process_info
        get_backend_info
        ;;
      *)
        print_message "Running full diagnostics..."
        run_full_diagnostics
        ;;
    esac
    ;;
  *)
    if [ -z "$1" ]; then
      if check_supervisor; then
        restart_with_supervisor "all"
      elif check_pm2; then
        restart_with_pm2 "$1"
      else
        restart_direct "all"
      fi
    else
      print_error "Unknown option: $1"
      show_help
      exit 1
    fi
    ;;
esac

exit 0