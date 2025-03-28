#!/bin/bash

# Print script header
echo -e "\n\033[1;36m====== Weather Dashboard Server Manager ======\033[0m\n"

# Kill existing processes
echo -e "\033[1;35mStopping existing servers...\033[0m"
pkill -f "python3 main.py" || true
pkill -f "node" || true

# Wait a moment to ensure ports are freed
echo -e "\033[1;35mWaiting for ports to be released...\033[0m"
sleep 2

# Get the current directory
CURRENT_DIR=$(pwd)
BASE_DIR="/Users/robmcconnell/Coding/Vibe Coding/python-requests-main"

# Check Python dependencies
echo -e "\033[1;35mChecking Python dependencies...\033[0m"
python3 -m pip install -q fastapi uvicorn python-dotenv requests || {
    echo -e "\033[1;31mFailed to install Python dependencies\033[0m"
    exit 1
}

# Start backend server
echo -e "\033[1;35mStarting backend server...\033[0m"
if [[ "$CURRENT_DIR" != "$BASE_DIR/backend" ]]; then
    cd "$BASE_DIR/backend" || { echo "Backend directory not found!"; exit 1; }
fi
python3 -m uvicorn main:app --host 0.0.0.0 --port 5003 --reload &
BACKEND_PID=$!
echo -e "\033[1;32m✓ Backend server started on port 5003\033[0m"

# Start frontend server
echo -e "\033[1;35mStarting frontend server...\033[0m"
if [[ "$CURRENT_DIR" != "$BASE_DIR/weather-dashboard/frontend" ]]; then
    cd "$BASE_DIR/weather-dashboard/frontend" || { echo "Frontend directory not found!"; exit 1; }
fi
npm start &
FRONTEND_PID=$!
echo -e "\033[1;32m✓ Frontend server started\033[0m"

echo -e "\n\033[1;36m====== Servers Started ======\033[0m"
echo -e "\033[1;37mBackend PID: $BACKEND_PID\033[0m"
echo -e "\033[1;37mFrontend PID: $FRONTEND_PID\033[0m"
echo -e "\033[1;37mPress Ctrl+C to stop all servers\033[0m\n"

# Handle script termination
trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo -e "\n\033[1;36mServers stopped\033[0m\n"; exit 0' INT

# Keep the script running
wait