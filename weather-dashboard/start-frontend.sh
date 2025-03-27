#!/bin/bash

# Set the frontend directory
FRONTEND_DIR="/Users/robmcconnell/Coding/Vibe Coding/python-requests-main/weather-dashboard/frontend"

# Print header
echo -e "\n\033[1;36m====== Weather Dashboard Frontend Server ======\033[0m\n"

# Kill any existing React servers on common development ports
echo -e "\033[1;35mChecking for existing React servers...\033[0m"
for PORT in 3000 3001 3002 3003 3004 3005 3006; do
    PROCESS_PID=$(lsof -i :$PORT | grep LISTEN | awk '{print $2}' | head -n 1)
    if [ -n "$PROCESS_PID" ]; then
        echo -e "\033[1;33mKilling process with PID $PROCESS_PID on port $PORT...\033[0m"
        kill -9 $PROCESS_PID
        echo -e "\033[1;32m✓ Process terminated\033[0m"
    fi
done

# Also check for any React-related node processes
NODE_PIDS=$(ps aux | grep "node" | grep "react-scripts" | awk '{print $2}')
if [ -n "$NODE_PIDS" ]; then
    echo -e "\033[1;33mKilling additional React development processes...\033[0m"
    echo $NODE_PIDS | xargs kill -9 2>/dev/null
    echo -e "\033[1;32m✓ Additional processes terminated\033[0m"
else
    echo -e "\033[0;34mNo additional React processes found\033[0m"
fi

# Wait a moment to ensure ports are freed
echo -e "\033[1;35mWaiting for ports to be released...\033[0m"
sleep 1

# Start the frontend server
echo -e "\033[1;35mStarting frontend server...\033[0m"
cd "$FRONTEND_DIR" || { echo "Frontend directory not found!"; exit 1; }

# Start the server
npm start