#!/bin/bash

# Ultra simple startup script for Weather Dashboard
# This script starts the backend and frontend without advanced process management
# For production use, prefer start-with-pm2.sh

# Setup log directory
mkdir -p logs

# Kill any existing processes on our ports
echo "Cleaning up existing processes..."
lsof -ti:5003 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Configure environment
echo "Setting up frontend API configuration..."
cat > ./frontend/.env <<EOF
# API Configuration
REACT_APP_API_URL=http://localhost:5003/api
PORT=3000
BROWSER=none
SKIP_PREFLIGHT_CHECK=true
DISABLE_ESLINT_PLUGIN=true
TSC_COMPILE_ON_ERROR=true
ESLINT_NO_DEV_ERRORS=true
GENERATE_SOURCEMAP=false
EOF

# Setup virtual environment if it doesn't exist
if [ ! -d ./venv ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Install backend dependencies
echo "Installing backend dependencies..."
source ./venv/bin/activate
pip install -r ./backend/requirements.txt

# Start backend
echo "Starting backend server..."
cd ./backend || exit 1
../venv/bin/python app.py --no-debug > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend to start..."
ATTEMPTS=0
MAX_ATTEMPTS=10
while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
    if curl -s http://localhost:5003/api/health > /dev/null 2>&1; then
        echo "✅ Backend server is running"
        break
    fi
    ATTEMPTS=$((ATTEMPTS + 1))
    echo "Waiting for backend... ($ATTEMPTS/$MAX_ATTEMPTS)"
    sleep 2
done

if [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; then
    echo "❌ Backend failed to start. Check logs/backend.log"
    exit 1
fi

# Start frontend
echo "Starting frontend server..."
cd ./frontend || exit 1
BROWSER=none \
DISABLE_ESLINT_PLUGIN=true \
TSC_COMPILE_ON_ERROR=true \
ESLINT_NO_DEV_ERRORS=true \
npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo "Frontend started with PID $FRONTEND_PID"
echo ""
echo "======================================================================"
echo "🚀 Weather Dashboard is now running!"
echo "📱 Frontend: http://localhost:3000"
echo "🔌 Backend API: http://localhost:5003/api"
echo "🩺 Health Check: http://localhost:5003/api/health"
echo "📋 Logs: ./logs"
echo "🚫 To stop: pkill -f 'python.*app.py' && pkill -f 'node.*react-scripts'"
echo "======================================================================"
echo ""
echo "Showing backend logs (Ctrl+C to exit, servers will keep running)..."
tail -f logs/backend.log