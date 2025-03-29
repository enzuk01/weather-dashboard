# Server Management Guide

## Overview

This document provides comprehensive guidance for managing the Weather Dashboard application servers, including setup, maintenance, and troubleshooting procedures.

## Server Architecture

The Weather Dashboard application consists of two main components:

1. **Frontend Server**: React application that renders the user interface
   - Default port: 3000
   - Fallback ports: 3001, 3002, 3003, 3004 (used if primary port is unavailable)

2. **Backend Server**: Flask API that interfaces with the Open-Meteo Weather API
   - Fixed port: 5003
   - Provides REST API endpoints with prefix `/api`

## Starting the Servers

### Recommended Method: server-restart.sh

The `server-restart.sh` script is the recommended way to start and manage both servers:

```bash
cd weather-dashboard
./server-restart.sh
```

**Features:**

- Simple, reliable server control with real-time status feedback
- Color-coded output showing process status and health checks
- Selective restart options (backend, frontend, or both)
- Proper process termination and startup verification
- Automatic logging to dedicated log files
- Timeout handling for server startup with health verification

**Usage Options:**

```bash
./server-restart.sh           # Restart both servers
./server-restart.sh backend   # Restart only backend
./server-restart.sh frontend  # Restart only frontend
./server-restart.sh help      # Show usage information
```

### Alternative Methods

#### Starting Backend Only

```bash
cd weather-dashboard/backend
python app.py
```

#### Starting Frontend Only

```bash
cd weather-dashboard/frontend
npm start
```

## Server Health Verification

### Health Check Endpoints

The backend provides a health check endpoint at:

```
http://localhost:5003/api/health
```

Example response:

```json
{
  "status": "healthy",
  "performance_metrics": {
    "memory_usage_mb": 50,
    "uptime_seconds": 3600
  }
}
```

### Checking Server Status

To check if servers are running:

```bash
# Check Backend
lsof -i :5003 | grep LISTEN

# Check Frontend
lsof -i :3000 | grep LISTEN
```

## Common Issues and Solutions

### Syntax Errors in Python Files

The system now includes a dedicated syntax checker script:

```bash
cd weather-dashboard
./scripts/check-python-syntax.sh
```

Run this script before deployment to catch syntax errors that could prevent server startup.

### Port Conflicts

If you experience port conflicts:

1. Check for processes using the required ports:

   ```bash
   lsof -i :5003   # Check backend port
   lsof -i :3000   # Check frontend port
   ```

2. Terminate conflicting processes:

   ```bash
   kill -9 <PID>
   ```

3. Use the server-restart.sh script which automatically handles conflicts

### Server Crashes

If servers crash unexpectedly:

1. Check the log files:

   ```bash
   cat weather-dashboard/logs/backend.log
   cat weather-dashboard/logs/frontend.log
   ```

2. Check for syntax errors:

   ```bash
   weather-dashboard/scripts/check-python-syntax.sh
   ```

3. Verify API configuration consistency:

   ```bash
   cat weather-dashboard/frontend/src/config/api.ts
   ```

## Recent Improvements

The following improvements have been made to enhance server reliability:

1. **New server-restart.sh Script**
   - Simple, reliable server management with color-coded feedback
   - Process verification with timeout handling
   - Support for selective server restarts (backend/frontend)
   - Real-time health status reporting

2. **Error Handling**
   - Improved error handling in server startup scripts
   - Added detailed logging for startup failures
   - Created centralized error logs for easier debugging

3. **Port Management**
   - Standardized port usage (backend: 5003, frontend: 3000)
   - Implemented automatic port conflict resolution
   - Added fallback port mechanism for frontend server

4. **Documentation**
   - Updated release workflow with syntax validation steps
   - Added server management documentation
   - Enhanced troubleshooting guidance

## Best Practices

1. **Always use server-restart.sh**
   - This script handles all common issues automatically
   - Provides consistent startup behavior
   - Ensures proper cleanup on termination

2. **Check logs for errors**
   - `logs/backend.log` contains backend server information
   - `logs/frontend.log` contains frontend server information

3. **Run syntax validation before deployment**
   - Use `scripts/check-python-syntax.sh` to validate Python files
   - Fix syntax errors before attempting to start servers
   - Include syntax validation in release workflow
