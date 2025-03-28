#!/bin/bash

# Constants
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"
PM2_CONFIG="ecosystem.config.js"
SUPERVISOR_CONFIG="supervisord.conf"
FRONTEND_PORT=3000
BACKEND_PORT=5001

# Function to check if a process is running
check_process() {
    pgrep -f "$1" >/dev/null
    return $?
}

# Function to kill process using a specific port
kill_port() {
    local port=$1
    local pid=$(lsof -t -i:"$port")
    if [ ! -z "$pid" ]; then
        echo "Killing process using port $port (PID: $pid)"
        kill -9 "$pid" 2>/dev/null
    fi
}

# Function to create required directories
setup_directories() {
    mkdir -p "$FRONTEND_DIR/logs"
    mkdir -p "$BACKEND_DIR/logs"
}

# Function to start servers
start_servers() {
    echo "Starting servers..."

    # Kill any existing processes on our ports
    kill_port $FRONTEND_PORT
    kill_port $BACKEND_PORT

    # Start frontend
    if ! check_process "weather-dashboard-frontend"; then
        cd "$FRONTEND_DIR" || exit 1
        pm2 start "$PM2_CONFIG"
        cd ..
    else
        echo "Frontend is already running"
    fi

    # Start backend
    if ! check_process "weather-dashboard-backend"; then
        cd "$BACKEND_DIR" || exit 1
        supervisord -c "$SUPERVISOR_CONFIG"
        cd ..
    else
        echo "Backend is already running"
    fi
}

# Function to stop servers
stop_servers() {
    echo "Stopping servers..."

    # Stop frontend
    cd "$FRONTEND_DIR" || exit 1
    pm2 stop "$PM2_CONFIG"
    cd ..

    # Stop backend
    cd "$BACKEND_DIR" || exit 1
    supervisorctl -c "$SUPERVISOR_CONFIG" shutdown
    cd ..

    # Kill any remaining processes
    kill_port $FRONTEND_PORT
    kill_port $BACKEND_PORT
}

# Function to show status
status() {
    echo "Checking server status..."

    # Frontend status
    cd "$FRONTEND_DIR" || exit 1
    pm2 status
    cd ..

    # Backend status
    cd "$BACKEND_DIR" || exit 1
    supervisorctl -c "$SUPERVISOR_CONFIG" status
    cd ..
}

# Function to show logs
logs() {
    echo "Showing logs..."

    # Show frontend logs
    echo "Frontend logs:"
    tail -n 50 "$FRONTEND_DIR/logs/frontend.out.log"

    # Show backend logs
    echo -e "\nBackend logs:"
    tail -n 50 "$BACKEND_DIR/logs/backend.out.log"
}

# Main script logic
case "$1" in
    start)
        setup_directories
        start_servers
        ;;
    stop)
        stop_servers
        ;;
    restart)
        stop_servers
        sleep 2
        start_servers
        ;;
    status)
        status
        ;;
    logs)
        logs
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac

exit 0