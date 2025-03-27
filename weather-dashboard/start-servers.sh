#!/bin/bash

# Set the directories
FRONTEND_DIR="/Users/robmcconnell/Coding/Vibe Coding/python-requests-main/weather-dashboard/frontend"
BACKEND_DIR="/Users/robmcconnell/Coding/Vibe Coding/python-requests-main/weather-dashboard/backend"

# Print script header with some style
echo -e "\n\033[1;36m====== Weather Dashboard Server Manager ======\033[0m\n"

# Function to kill processes on a specific port
kill_process_on_port() {
    local PORT=$1
    local PROCESS_PID=$(lsof -i :$PORT | grep LISTEN | awk '{print $2}' | head -n 1)

    if [ -n "$PROCESS_PID" ]; then
        echo -e "\033[1;33mKilling process with PID $PROCESS_PID on port $PORT...\033[0m"
        kill -9 $PROCESS_PID
        echo -e "\033[1;32m✓ Process terminated\033[0m"
    else
        echo -e "\033[0;34mNo process found running on port $PORT\033[0m"
    fi
}

# Function to kill all Node.js servers (frontend)
kill_node_servers() {
    echo -e "\033[1;35mChecking for React development servers...\033[0m"

    # Common ports used by React development servers
    REACT_PORTS=(3000 3001 3002 3003 3004 3005 3006)

    for PORT in "${REACT_PORTS[@]}"; do
        kill_process_on_port $PORT
    done

    # Additional check for any remaining node processes related to React
    NODE_PIDS=$(ps aux | grep "node" | grep "react-scripts" | awk '{print $2}')
    if [ -n "$NODE_PIDS" ]; then
        echo -e "\033[1;33mKilling additional React development processes...\033[0m"
        echo $NODE_PIDS | xargs kill -9
        echo -e "\033[1;32m✓ Additional processes terminated\033[0m"
    fi
}

# Function to kill Python Flask/FastAPI servers (backend)
kill_python_servers() {
    echo -e "\033[1;35mChecking for Python backend servers...\033[0m"

    # Common ports used by the backend server
    BACKEND_PORTS=(5000 5001 5002 5003 5004 5005)

    for PORT in "${BACKEND_PORTS[@]}"; do
        kill_process_on_port $PORT
    done

    # Additional check for Python processes related to Flask/FastAPI
    PYTHON_PIDS=$(ps aux | grep "python" | grep -E "flask|main.py|fastapi" | awk '{print $2}')
    if [ -n "$PYTHON_PIDS" ]; then
        echo -e "\033[1;33mKilling additional Python backend processes...\033[0m"
        echo $PYTHON_PIDS | xargs kill -9
        echo -e "\033[1;32m✓ Additional processes terminated\033[0m"
    fi
}

# Kill existing services
kill_node_servers
kill_python_servers

# Wait a moment to ensure ports are freed
echo -e "\033[1;35mWaiting for ports to be released...\033[0m"
sleep 2

# Start backend server
echo -e "\033[1;35mStarting backend server...\033[0m"
cd "$BACKEND_DIR" || { echo "Backend directory not found!"; exit 1; }
python main.py &
BACKEND_PID=$!
echo -e "\033[1;32m✓ Backend server started on port 5003\033[0m"

# Start frontend server
echo -e "\033[1;35mStarting frontend server...\033[0m"
cd "$FRONTEND_DIR" || { echo "Frontend directory not found!"; exit 1; }
npm start &
FRONTEND_PID=$!
echo -e "\033[1;32m✓ Frontend server started\033[0m"

echo -e "\n\033[1;36m====== Servers Started ======\033[0m"
echo -e "\033[1;37mBackend PID: $BACKEND_PID\033[0m"
echo -e "\033[1;37mFrontend PID: $FRONTEND_PID\033[0m"
echo -e "\033[1;37mPress Ctrl+C to stop all servers\033[0m\n"

# Handle script termination
trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo -e "\n\033[1;36mServers stopped\033[0m\n"; exit 0' INT

# Keep the script running to maintain the servers
wait