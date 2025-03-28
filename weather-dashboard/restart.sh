#!/bin/bash

# Get the absolute path of the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Constants
BACKEND_PORT=5003
FRONTEND_PORT=3001
LOG_DIR="$SCRIPT_DIR/logs"
BACKEND_LOG_DIR="$LOG_DIR/backend"
FRONTEND_LOG_DIR="$LOG_DIR/frontend"
LOG_FILE="$LOG_DIR/restart.log"
MAX_RETRIES=2
WAIT_TIME=2
LOG_CHECK_TIMEOUT=10
PYTHON_MIN_VERSION="3.8"

# Create log directory structure
create_log_dirs() {
    for dir in "$LOG_DIR" "$BACKEND_LOG_DIR" "$FRONTEND_LOG_DIR"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            echo "Created log directory: $dir"
        fi
    done
}

# Create log directories before any logging starts
create_log_dirs

# Check required files
check_required_files() {
    local required_files=(
        "backend/app.py"
        "backend/requirements.txt"
        "frontend/package.json"
    )

    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            log_message "ERROR: Required file not found: $file"
            return 1
        fi
    done
    return 0
}

# Logging function with log rotation
log_message() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local message="[$timestamp] $1"
    echo "$message"
    echo "$message" >> "$LOG_FILE"

    # Rotate log if it gets too large (>1MB)
    if [ -f "$LOG_FILE" ] && [ $(stat -f%z "$LOG_FILE") -gt 1048576 ]; then
        mv "$LOG_FILE" "$LOG_FILE.old"
    fi
}

# Progress indicator with timeout
show_progress() {
    local message=$1
    local duration=${2:-1}
    local end_time=$((SECONDS + duration))
    local dots=""

    while [ $SECONDS -lt $end_time ]; do
        echo -ne "\r$message$dots"
        dots="$dots."
        sleep 0.5
        if [ ${#dots} -gt 3 ]; then
            dots=""
        fi
    done
    echo -ne "\r$message...done\n"
}

# Enhanced process detection
find_app_processes() {
    local backend_pattern="python.*[^]]$BACKEND_PORT"
    local frontend_pattern="node.*$FRONTEND_PORT"

    # Use ps with specific columns and filtering
    ps aux | grep -E "$backend_pattern|$frontend_pattern" | grep -v grep | awk '{print $2}'
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -i ":$port" >/dev/null 2>&1; then
        return 0  # Port is in use
    fi
    return 1  # Port is free
}

# Enhanced port cleanup
cleanup_ports() {
    local ports=($BACKEND_PORT $FRONTEND_PORT)
    for port in "${ports[@]}"; do
        log_message "Checking port $port"
        if check_port "$port"; then
            local pids=$(lsof -ti :$port)
            if [ ! -z "$pids" ]; then
                log_message "Found processes using port $port: $pids"
                for pid in $pids; do
                    log_message "Attempting to terminate process $pid gracefully"
                    kill -15 $pid 2>/dev/null
                    sleep 1
                    if check_port "$port"; then
                        log_message "Force killing process $pid"
                        kill -9 $pid 2>/dev/null
                    fi
                done
            fi
        else
            log_message "Port $port is free"
        fi
    done
}

# Enhanced Python environment setup
setup_python_env() {
    log_message "Setting up Python environment"

    # Check Python version
    local python_version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
    log_message "Detected Python version: $python_version"

    # Compare version numbers properly
    if ! python3 -c "import sys; exit(0 if tuple(map(int, '$python_version'.split('.'))) >= tuple(map(int, '$PYTHON_MIN_VERSION'.split('.'))) else 1)"; then
        log_message "ERROR: Python version $python_version is below minimum required version $PYTHON_MIN_VERSION"
        return 1
    fi

    if [ ! -f "backend/requirements.txt" ]; then
        log_message "ERROR: requirements.txt not found in backend directory"
        return 1
    fi

    # Create or update virtual environment
    if [ ! -d "backend/venv" ]; then
        log_message "Creating virtual environment"
        python3 -m venv backend/venv
    fi

    # Activate virtual environment and install requirements
    log_message "Installing Python dependencies"
    source backend/venv/bin/activate
    pip install --upgrade pip
    pip install -r backend/requirements.txt
    deactivate
}

# Enhanced server verification with health check
verify_server() {
    local base_url=$1
    local health_endpoint=${2:-"/"}
    local retries=$MAX_RETRIES
    local wait_time=$WAIT_TIME

    for ((i=1; i<=$retries; i++)); do
        local response=$(curl -s -w "%{http_code}" "$base_url$health_endpoint" -o /dev/null)
        if [ "$response" = "200" ]; then
            log_message "Server verified at $base_url$health_endpoint"
            return 0
        fi
        show_progress "Attempt $i: Verifying server" $wait_time
    done

    log_message "ERROR: Failed to verify server at $base_url$health_endpoint"
    return 1
}

check_frontend_errors() {
    echo "Checking frontend logs for errors..."
    sleep 5  # Give the frontend time to initialize and potentially encounter errors

    # Look for critical errors in the frontend logs
    ERROR_COUNT=$(tail -n 50 "$FRONTEND_LOG_DIR/frontend_$(date +%Y%m%d).log" | grep -iE "error:|failed to|undefined is not|cannot read property|TypeError:" | wc -l)

    if [ $ERROR_COUNT -gt 0 ]; then
        echo "⚠️ Found $ERROR_COUNT potential errors in frontend logs:"
        tail -n 50 "$FRONTEND_LOG_DIR/frontend_$(date +%Y%m%d).log" | grep -iE "error:|failed to|undefined is not|cannot read property|TypeError:" | sed 's/^/    /'
        return 1
    else
        echo "✅ No critical frontend errors detected"
        return 0
    fi
}

check_weather_api_endpoints() {
    echo "Checking weather API endpoints..."

    # Test coordinates for Washington, DC
    LAT=38.8951
    LON=-77.0364

    # Check current weather endpoint
    echo "Checking current weather endpoint..."
    CURRENT_RESPONSE=$(curl -s "http://localhost:5003/api/current-weather?latitude=$LAT&longitude=$LON")
    if ! echo "$CURRENT_RESPONSE" | grep -q "temperature_2m\|relative_humidity_2m"; then
        echo "❌ Current weather endpoint failed:"
        echo "$CURRENT_RESPONSE" | sed 's/^/    /'
        return 1
    fi

    # Check hourly forecast endpoint
    echo "Checking hourly forecast endpoint..."
    HOURLY_RESPONSE=$(curl -s "http://localhost:5003/api/hourly-forecast?latitude=$LAT&longitude=$LON")
    if ! echo "$HOURLY_RESPONSE" | grep -q "temperature_2m\|precipitation_probability"; then
        echo "❌ Hourly forecast endpoint failed:"
        echo "$HOURLY_RESPONSE" | sed 's/^/    /'
        return 1
    fi

    # Check daily forecast endpoint
    echo "Checking daily forecast endpoint..."
    DAILY_RESPONSE=$(curl -s "http://localhost:5003/api/daily-forecast?latitude=$LAT&longitude=$LON")
    if ! echo "$DAILY_RESPONSE" | grep -q "temperature_2m_max\|precipitation_sum"; then
        echo "❌ Daily forecast endpoint failed:"
        echo "$DAILY_RESPONSE" | sed 's/^/    /'
        return 1
    fi

    echo "✅ All weather API endpoints are responding correctly"
    return 0
}

check_frontend_application() {
    echo "Checking frontend application state..."

    # First verify the server is up
    if ! curl -s -f http://localhost:3001 > /dev/null; then
        echo "❌ Frontend server is not responding"
        return 1
    fi

    # Check if the backend APIs are working
    if ! check_weather_api_endpoints; then
        echo "❌ Weather API endpoints are not functioning correctly"
        return 1
    fi

    # Give the frontend time to load and render
    echo "Waiting for application to initialize..."
    sleep 10

    # Check if we can access the frontend
    if ! curl -s -f http://localhost:3001 > /dev/null; then
        echo "❌ Frontend application became unresponsive"
        return 1
    fi

    echo "✅ Frontend application and API endpoints verified"
    return 0
}

# Main restart function
main() {
    log_message "Starting restart process"

    # Check required files
    if ! check_required_files; then
        return 1
    fi

    # Clean up ports first
    cleanup_ports

    # Find and kill existing processes
    local pids=$(find_app_processes)
    if [ ! -z "$pids" ]; then
        log_message "Killing existing processes: $pids"
        kill_processes "$pids"
    fi

    # Setup Python environment
    if ! setup_python_env; then
        log_message "ERROR: Failed to setup Python environment"
        return 1
    fi

    # Start backend server
    log_message "Starting backend server"
    cd "$SCRIPT_DIR/backend" || {
        log_message "ERROR: Failed to change to backend directory"
        return 1
    }

    # Activate virtual environment and start server
    source venv/bin/activate

    # Create a new backend log file
    local backend_log="$BACKEND_LOG_DIR/backend_$(date +%Y%m%d).log"
    touch "$backend_log"

    # Start the Flask app with proper configuration
    FLASK_APP=app.py \
    FLASK_ENV=development \
    FLASK_DEBUG=1 \
    python3 -m flask run --host=0.0.0.0 --port=$BACKEND_PORT > "$backend_log" 2>&1 &

    backend_pid=$!
    log_message "Backend started with PID $backend_pid"

    # Wait for backend to start
    sleep 2  # Give Flask a moment to initialize
    if ! verify_server "http://localhost:$BACKEND_PORT" "/api/health"; then
        log_message "ERROR: Backend server failed to start"
        log_message "Last 10 lines of backend log:"
        tail -n 10 "$backend_log" | while read -r line; do
            log_message "  $line"
        done
        deactivate
        return 1
    fi
    deactivate

    # Start frontend server
    log_message "Starting frontend server"
    cd "$SCRIPT_DIR/frontend" || {
        log_message "ERROR: Failed to change to frontend directory"
        return 1
    }

    # Install npm dependencies if needed
    if [ ! -d "node_modules" ]; then
        log_message "Installing frontend dependencies"
        npm install
    fi

    # Start frontend server
    PORT=$FRONTEND_PORT npm start > "$FRONTEND_LOG_DIR/frontend_$(date +%Y%m%d).log" 2>&1 &
    frontend_pid=$!
    log_message "Frontend started with PID $frontend_pid"

    # Verify frontend server
    if ! verify_server "http://localhost:$FRONTEND_PORT"; then
        log_message "ERROR: Frontend server failed to start"
        return 1
    fi

    # Check frontend errors
    if ! check_frontend_errors; then
        echo "❌ Frontend application has errors that may affect functionality"
        echo "Check the frontend logs at $FRONTEND_LOG_DIR/frontend_$(date +%Y%m%d).log for more details"
        return 1
    fi

    # Check frontend application state
    if ! check_frontend_application; then
        echo "❌ Application is not functioning correctly"
        echo "Please check:"
        echo "  1. Frontend application: http://localhost:3001"
        echo "  2. Backend health: http://localhost:5003/api/health"
        echo "  3. Frontend logs: logs/frontend/frontend_$(date +%Y%m%d).log"
        echo "  4. Backend logs: logs/backend/backend_$(date +%Y%m%d).log"
        echo "  5. Weather API endpoints:"
        echo "     - Current: http://localhost:5003/api/current-weather?latitude=38.8951&longitude=-77.0364"
        echo "     - Hourly: http://localhost:5003/api/hourly-forecast?latitude=38.8951&longitude=-77.0364"
        echo "     - Daily: http://localhost:5003/api/daily-forecast?latitude=38.8951&longitude=-77.0364"
        exit 1
    fi

    # Only show success message if all checks pass
    echo "✅ Application restart completed successfully with all endpoints verified"
    log_message "Restart completed successfully"
    log_message "Backend PID: $backend_pid"
    log_message "Frontend PID: $frontend_pid"
    return 0
}

# Run main function
main