#!/bin/bash

# Get absolute path to project root directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Print script header
echo -e "\n\033[1;36m====== Weather Dashboard Server Manager ======\033[0m\n"

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

# Make sure no processes are using our ports
echo -e "\033[1;35mChecking for existing processes...\033[0m"
kill_port_process 5003
kill_port_process 3000

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "\033[1;31mPM2 is not installed. Installing...\033[0m"
    npm install -g pm2
fi

# Stop any existing PM2 processes for our app
echo -e "\033[1;35mStopping any existing PM2 processes...\033[0m"
pm2 delete weather-backend >/dev/null 2>&1
pm2 delete weather-frontend >/dev/null 2>&1
pm2 delete all >/dev/null 2>&1

# Start servers using PM2
echo -e "\033[1;35mStarting servers with PM2...\033[0m"
cd "$SCRIPT_DIR"
pm2 start ecosystem.config.js

# Display server status
echo -e "\n\033[1;36m====== Servers Started Successfully ======\033[0m"
pm2 list

echo -e "\n\033[1;37mUse the following commands to manage servers:\033[0m"
echo -e "\033[1;37m- View logs: pm2 logs\033[0m"
echo -e "\033[1;37m- Monitor processes: pm2 monit\033[0m"
echo -e "\033[1;37m- Stop all: pm2 stop all\033[0m"
echo -e "\033[1;37m- Restart all: pm2 restart all\033[0m\n"