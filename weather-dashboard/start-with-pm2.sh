#!/bin/bash

# Simplified Weather Dashboard startup script using PM2
# This is a more robust approach than the direct-start.sh script

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

# Update Flask config.py port
echo "Updating backend port configuration..."
cat > ./backend/config.py <<EOF
"""
Configuration settings for the Weather Dashboard backend
"""

import os
import re

# Strip non-numeric characters from string values that should be numbers
def clean_port_value(value, default=5003):
    if not value:
        return default

    # Try to extract just the digits from the port value
    digits = re.sub(r'[^\d]', '', str(value))

    try:
        port = int(digits)
        # Validate port range
        if port < 1024 or port > 65535:
            return default
        return port
    except (ValueError, TypeError):
        return default

# Environment variables with safe defaults
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
PORT = 5003
HOST = os.environ.get('HOST', '0.0.0.0')

# API configuration
WEATHER_API_BASE_URL = 'https://api.open-meteo.com/v1'

class Config:
    # API settings
    API_PREFIX = '/api'
    CORS_ORIGINS = '*'

    # Server settings
    DEBUG = DEBUG
    PORT = PORT
    HOST = HOST

    # API configuration
    WEATHER_API_BASE_URL = WEATHER_API_BASE_URL

    @classmethod
    def init_app(cls):
        """Initialize application configuration"""
        # Make sure port is clean and numeric
        try:
            port_env = os.getenv('PORT', '5003')
            if port_env:
                # Extract only the numeric part
                numeric_part = re.sub(r'[^0-9]', '', port_env)
                if numeric_part:
                    cls.PORT = int(numeric_part)
        except Exception as e:
            print(f"Error processing PORT: {e}")
            cls.PORT = 5003  # Fallback to default

        return cls
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

# Start services with PM2
echo "Starting services with PM2..."
which pm2 > /dev/null 2>&1 || npm install -g pm2
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js

echo "Waiting for services to initialize..."
sleep 10

# Check health
echo "Checking server health..."
BACKEND_HEALTH=$(curl -s http://localhost:5003/api/health 2>/dev/null)
if [[ "$BACKEND_HEALTH" == *"healthy"* ]]; then
    echo "✅ Backend server is healthy"
else
    echo "❌ Backend server health check failed"
    pm2 logs
    exit 1
fi

# Monitor with PM2
echo ""
echo "======================================================================"
echo "🚀 Weather Dashboard is now running!"
echo "📱 Frontend: http://localhost:3000"
echo "🔌 Backend API: http://localhost:5003/api"
echo "🩺 Health Check: http://localhost:5003/api/health"
echo "📋 Monitor with: pm2 logs"
echo "📊 Dashboard: pm2 monit"
echo "🛑 Stop with: pm2 stop all"
echo "======================================================================"
echo ""

# Show logs
echo "Showing logs (Ctrl+C to exit log view)..."
pm2 logs --lines 20