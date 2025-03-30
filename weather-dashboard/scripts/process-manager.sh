#!/bin/bash

# Weather Dashboard Process Manager
# This script manages the frontend and backend processes, ensuring clean startup and shutdown

# Set the root directory relative to this script's location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." &>/dev/null && pwd)"
FRONTEND_DIR="${ROOT_DIR}/frontend"
BACKEND_DIR="${ROOT_DIR}/backend"
LOGS_DIR="${ROOT_DIR}/logs"

# Log file paths
mkdir -p "${LOGS_DIR}"
FRONTEND_LOG="${LOGS_DIR}/frontend.log"
BACKEND_LOG="${LOGS_DIR}/backend.log"
PROCESS_LOG="${LOGS_DIR}/process-manager.log"

# PID file paths
FRONTEND_PID_FILE="${LOGS_DIR}/frontend.pid"
BACKEND_PID_FILE="${LOGS_DIR}/backend.pid"

# Port configuration
FRONTEND_PORT=3000
BACKEND_PORT=5003

# Color codes for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log() {
    local message="$1"
    local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    echo -e "${BLUE}[${timestamp}]${NC} $message"
    echo "[${timestamp}] $message" >> "${PROCESS_LOG}"
}

success() {
    log "${GREEN}✓ $1${NC}"
}

warn() {
    log "${YELLOW}⚠ $1${NC}"
}

error() {
    log "${RED}✗ $1${NC}"
}

is_port_in_use() {
    local port=$1
    if command -v lsof >/dev/null 2>&1; then
        lsof -i :"$port" >/dev/null 2>&1
        return $?
    elif command -v netstat >/dev/null 2>&1; then
        netstat -tuln | grep -q ":$port "
        return $?
    else
        # If neither lsof nor netstat is available, assume port is free
        return 1
    fi
}

kill_process_on_port() {
    local port=$1
    if command -v lsof >/dev/null 2>&1; then
        local pid=$(lsof -ti :$port)
        if [ -n "$pid" ]; then
            warn "Killing process $pid running on port $port"
            kill -9 $pid 2>/dev/null
            return $?
        fi
    elif command -v netstat >/dev/null 2>&1; then
        # This is more complex with netstat and varies by OS
        warn "Using netstat to find processes (less reliable)"
        local pid=$(netstat -tlnp 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f1)
        if [ -n "$pid" ]; then
            warn "Killing process $pid running on port $port"
            kill -9 $pid 2>/dev/null
            return $?
        fi
    fi
    return 1
}

# Function to start the backend server
start_backend() {
    log "Starting backend server on port ${BACKEND_PORT}..."

    # Check if port is already in use
    if is_port_in_use "${BACKEND_PORT}"; then
        warn "Port ${BACKEND_PORT} is already in use. Attempting to kill the process..."
        kill_process_on_port "${BACKEND_PORT}"
        sleep 2
        if is_port_in_use "${BACKEND_PORT}"; then
            error "Failed to free port ${BACKEND_PORT}. Backend cannot start."
            return 1
        fi
    fi

    # Navigate to backend directory and start the server
    cd "${BACKEND_DIR}" || { error "Backend directory not found"; return 1; }

    # Determine if we should activate a virtual environment
    if [ -d "venv" ]; then
        PYTHON_CMD="venv/bin/python"
    elif [ -d "../venv" ]; then
        PYTHON_CMD="../venv/bin/python"
    else
        PYTHON_CMD="python"
    fi

    # Start the backend with proper environment variables
    if [ -f "./app.py" ]; then
        nohup ${PYTHON_CMD} app.py > "${BACKEND_LOG}" 2>&1 &
        echo $! > "${BACKEND_PID_FILE}"
        success "Backend server started with PID $(cat "${BACKEND_PID_FILE}")"
        return 0
    else
        error "Backend app.py not found"
        return 1
    fi
}

# Function to start the frontend server
start_frontend() {
    log "Starting frontend server on port ${FRONTEND_PORT}..."

    # Check if port is already in use
    if is_port_in_use "${FRONTEND_PORT}"; then
        warn "Port ${FRONTEND_PORT} is already in use. Attempting to kill the process..."
        kill_process_on_port "${FRONTEND_PORT}"
        sleep 2
        if is_port_in_use "${FRONTEND_PORT}"; then
            error "Failed to free port ${FRONTEND_PORT}. Frontend cannot start."
            return 1
        fi
    fi

    # Navigate to frontend directory and start the server
    cd "${FRONTEND_DIR}" || { error "Frontend directory not found"; return 1; }

    # Set API URL environment variable to point to our backend
    export REACT_APP_API_URL="http://localhost:${BACKEND_PORT}/api"
    export PORT="${FRONTEND_PORT}"

    # Start the frontend with npm or yarn
    if [ -f "package.json" ]; then
        if [ -f "yarn.lock" ]; then
            nohup yarn start > "${FRONTEND_LOG}" 2>&1 &
        else
            nohup npm start > "${FRONTEND_LOG}" 2>&1 &
        fi
        echo $! > "${FRONTEND_PID_FILE}"
        success "Frontend server started with PID $(cat "${FRONTEND_PID_FILE}")"
        return 0
    else
        error "Frontend package.json not found"
        return 1
    fi
}

# Function to stop the backend server
stop_backend() {
    log "Stopping backend server..."
    if [ -f "${BACKEND_PID_FILE}" ]; then
        local pid=$(cat "${BACKEND_PID_FILE}")
        if ps -p "${pid}" > /dev/null; then
            kill -15 "${pid}" 2>/dev/null || kill -9 "${pid}" 2>/dev/null
            rm "${BACKEND_PID_FILE}"
            success "Backend server stopped"
        else
            warn "Backend server was not running (stale PID file)"
            rm "${BACKEND_PID_FILE}"
        fi
    else
        # Try to kill by port
        if is_port_in_use "${BACKEND_PORT}"; then
            warn "Backend PID file not found, but port ${BACKEND_PORT} is in use"
            kill_process_on_port "${BACKEND_PORT}"
            success "Backend server stopped via port"
        else
            warn "Backend server was not running"
        fi
    fi
}

# Function to stop the frontend server
stop_frontend() {
    log "Stopping frontend server..."
    if [ -f "${FRONTEND_PID_FILE}" ]; then
        local pid=$(cat "${FRONTEND_PID_FILE}")
        if ps -p "${pid}" > /dev/null; then
            kill -15 "${pid}" 2>/dev/null || kill -9 "${pid}" 2>/dev/null
            rm "${FRONTEND_PID_FILE}"
            success "Frontend server stopped"
        else
            warn "Frontend server was not running (stale PID file)"
            rm "${FRONTEND_PID_FILE}"
        fi
    else
        # Try to kill by port
        if is_port_in_use "${FRONTEND_PORT}"; then
            warn "Frontend PID file not found, but port ${FRONTEND_PORT} is in use"
            kill_process_on_port "${FRONTEND_PORT}"
            success "Frontend server stopped via port"
        else
            warn "Frontend server was not running"
        fi
    fi
}

# Function to check the status of the servers
check_status() {
    local backend_running=false
    local frontend_running=false

    echo -e "${BLUE}=== Weather Dashboard Status ===${NC}"

    # Check backend
    if [ -f "${BACKEND_PID_FILE}" ]; then
        local pid=$(cat "${BACKEND_PID_FILE}")
        if ps -p "${pid}" > /dev/null; then
            echo -e "${GREEN}Backend:${NC} Running (PID: ${pid})"
            backend_running=true
        else
            echo -e "${RED}Backend:${NC} Not running (stale PID file)"
        fi
    elif is_port_in_use "${BACKEND_PORT}"; then
        echo -e "${YELLOW}Backend:${NC} Running on port ${BACKEND_PORT} (PID unknown)"
        backend_running=true
    else
        echo -e "${RED}Backend:${NC} Not running"
    fi

    # Check frontend
    if [ -f "${FRONTEND_PID_FILE}" ]; then
        local pid=$(cat "${FRONTEND_PID_FILE}")
        if ps -p "${pid}" > /dev/null; then
            echo -e "${GREEN}Frontend:${NC} Running (PID: ${pid})"
            frontend_running=true
        else
            echo -e "${RED}Frontend:${NC} Not running (stale PID file)"
        fi
    elif is_port_in_use "${FRONTEND_PORT}"; then
        echo -e "${YELLOW}Frontend:${NC} Running on port ${FRONTEND_PORT} (PID unknown)"
        frontend_running=true
    else
        echo -e "${RED}Frontend:${NC} Not running"
    fi

    # URLs
    if $backend_running; then
        echo -e "${BLUE}Backend URL:${NC} http://localhost:${BACKEND_PORT}/api/health"
    fi
    if $frontend_running; then
        echo -e "${BLUE}Frontend URL:${NC} http://localhost:${FRONTEND_PORT}"
    fi

    # Log files
    echo -e "${BLUE}Log files:${NC}"
    echo -e "  Frontend: ${FRONTEND_LOG}"
    echo -e "  Backend: ${BACKEND_LOG}"
    echo -e "  Process manager: ${PROCESS_LOG}"
}

# Function to start all servers
start_all() {
    log "Starting all services..."
    start_backend
    # Wait for backend to be ready before starting frontend
    sleep 2
    start_frontend
    success "All services started"
    check_status
}

# Function to stop all servers
stop_all() {
    log "Stopping all services..."
    stop_frontend
    stop_backend
    success "All services stopped"
}

# Function to restart all servers
restart_all() {
    log "Restarting all services..."
    stop_all
    # Wait for ports to be freed
    sleep 3
    start_all
    success "All services restarted"
}

# Function to display help
show_help() {
    cat << EOF
Weather Dashboard Process Manager

Usage: ${0} [command]

Commands:
  start       Start all services
  stop        Stop all services
  restart     Restart all services
  status      Check the status of all services
  logs        Show the last 50 lines of logs
  start-back  Start only the backend
  start-front Start only the frontend
  stop-back   Stop only the backend
  stop-front  Stop only the frontend
  help        Show this help message

Examples:
  ${0} start        # Start both frontend and backend
  ${0} logs         # Show logs
  ${0} stop-front   # Stop only the frontend
EOF
}

# Function to display logs
show_logs() {
    echo -e "${BLUE}=== Backend Log (last 50 lines) ===${NC}"
    if [ -f "${BACKEND_LOG}" ]; then
        tail -n 50 "${BACKEND_LOG}"
    else
        echo "No backend log file found"
    fi

    echo -e "\n${BLUE}=== Frontend Log (last 50 lines) ===${NC}"
    if [ -f "${FRONTEND_LOG}" ]; then
        tail -n 50 "${FRONTEND_LOG}"
    else
        echo "No frontend log file found"
    fi
}

# Main command processing
case "$1" in
    start)
        start_all
        ;;
    stop)
        stop_all
        ;;
    restart)
        restart_all
        ;;
    status)
        check_status
        ;;
    logs)
        show_logs
        ;;
    start-back)
        start_backend
        ;;
    start-front)
        start_frontend
        ;;
    stop-back)
        stop_backend
        ;;
    stop-front)
        stop_frontend
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "Unknown command: $1"
        show_help
        exit 1
        ;;
esac

exit 0