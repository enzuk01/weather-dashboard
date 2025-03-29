#!/bin/bash

# Get the absolute path to the project root directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# Print script header
echo -e "\n\033[1;36m====== Weather Dashboard Direct Startup ======\033[0m\n"

# Function to check if a port is in use
check_port() {
    lsof -i :$1 >/dev/null 2>&1
    return $?
}

# Function to kill process using a specific port
kill_port_process() {
    local port=$1
    if check_port $port; then
        echo -e "\033[1;33mKilling process on port $port...\033[0m"
        lsof -ti :$port | xargs kill -9 2>/dev/null
        sleep 1
    fi
}

# Function to wait for a port to be available
wait_for_url() {
    local url=$1
    local max_attempts=30
    local attempt=1

    echo -e "\033[1;35mWaiting for $url to be available...\033[0m"

    while ! curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|304"; do
        if [ $attempt -gt $max_attempts ]; then
            echo -e "\033[1;31mService at $url failed to start after $max_attempts attempts\033[0m"
            return 1
        fi
        echo -e "\033[1;33mAttempt $attempt: $url not ready, waiting...\033[0m"
        sleep 1
        ((attempt++))
    done

    echo -e "\033[1;32mService at $url is ready!\033[0m"
    return 0
}

# Kill any existing processes on our ports
echo -e "\033[1;35mChecking for existing processes...\033[0m"
kill_port_process 5003
kill_port_process 3000

# Create logs directory
mkdir -p "$SCRIPT_DIR/logs"

# Start backend server
echo -e "\033[1;35mStarting backend server...\033[0m"
cd "$BACKEND_DIR"
export FLASK_APP=app.py
export FLASK_ENV=development
export FLASK_DEBUG=1

# Start Flask in the background
python -m flask run --host=0.0.0.0 --port=5003 >> "$SCRIPT_DIR/logs/backend.log" 2>&1 &
BACKEND_PID=$!
echo -e "\033[1;32mBackend server started with PID $BACKEND_PID\033[0m"

# Verify backend started correctly
if ! ps -p $BACKEND_PID > /dev/null; then
    echo -e "\033[1;31mBackend server failed to start! Check logs/backend.log for details.\033[0m"
    exit 1
fi

# Wait for backend to be ready
if ! wait_for_url "http://localhost:5003/api/health"; then
    echo -e "\033[1;31mBackend server not responding! Check logs/backend.log for details.\033[0m"
    kill -9 $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend server
echo -e "\033[1;35mStarting frontend server...\033[0m"
cd "$FRONTEND_DIR"

# Start React in the background
npm start >> "$SCRIPT_DIR/logs/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo -e "\033[1;32mFrontend server started with PID $FRONTEND_PID\033[0m"

# Verify frontend started correctly
sleep 3
if ! ps -p $FRONTEND_PID > /dev/null; then
    echo -e "\033[1;31mFrontend server failed to start! Check logs/frontend.log for details.\033[0m"
    kill -9 $BACKEND_PID 2>/dev/null
    exit 1
fi

# Wait for frontend to be ready
if ! wait_for_url "http://localhost:3000"; then
    echo -e "\033[1;31mFrontend server not responding! Check logs/frontend.log for details.\033[0m"
    kill -9 $BACKEND_PID 2>/dev/null
    kill -9 $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo -e "\n\033[1;36m====== Servers Started Successfully ======\033[0m"
echo -e "\033[1;37mBackend PID: $BACKEND_PID (Port 5003)\033[0m"
echo -e "\033[1;37mFrontend PID: $FRONTEND_PID (Port 3000)\033[0m"
echo -e "\033[1;37mBackend logs: $SCRIPT_DIR/logs/backend.log\033[0m"
echo -e "\033[1;37mFrontend logs: $SCRIPT_DIR/logs/frontend.log\033[0m"
echo -e "\033[1;37mPress Ctrl+C to stop all servers\033[0m\n"

# Setup cleanup on exit
cleanup() {
    echo -e "\n\033[1;36mStopping servers...\033[0m"
    kill -9 $BACKEND_PID 2>/dev/null
    kill -9 $FRONTEND_PID 2>/dev/null
    echo -e "\033[1;32mAll servers stopped\033[0m"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running and monitor server health
echo -e "\033[1;35mMonitoring servers...\033[0m"
while true; do
    # Check if backend is still running
    if ! ps -p $BACKEND_PID > /dev/null; then
        echo -e "\033[1;31mBackend server (PID $BACKEND_PID) crashed! Restarting...\033[0m"
        cd "$BACKEND_DIR"
        python -m flask run --host=0.0.0.0 --port=5003 >> "$SCRIPT_DIR/logs/backend.log" 2>&1 &
        BACKEND_PID=$!
        echo -e "\033[1;32mBackend server restarted with PID $BACKEND_PID\033[0m"
    fi

    # Check if frontend is still running
    if ! ps -p $FRONTEND_PID > /dev/null; then
        echo -e "\033[1;31mFrontend server (PID $FRONTEND_PID) crashed! Restarting...\033[0m"
        cd "$FRONTEND_DIR"
        npm start >> "$SCRIPT_DIR/logs/frontend.log" 2>&1 &
        FRONTEND_PID=$!
        echo -e "\033[1;32mFrontend server restarted with PID $FRONTEND_PID\033[0m"
    fi

    # Check if backend API is responding
    if ! curl -s "http://localhost:5003/api/health" > /dev/null; then
        echo -e "\033[1;31mBackend API not responding! Restarting backend...\033[0m"
        kill -9 $BACKEND_PID 2>/dev/null
        cd "$BACKEND_DIR"
        python -m flask run --host=0.0.0.0 --port=5003 >> "$SCRIPT_DIR/logs/backend.log" 2>&1 &
        BACKEND_PID=$!
        echo -e "\033[1;32mBackend server restarted with PID $BACKEND_PID\033[0m"
    fi

    # Sleep before next check
    sleep 5
done