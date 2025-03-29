# Weather Dashboard Server Management

This document provides detailed information about managing the Weather Dashboard servers, including startup, monitoring, and troubleshooting procedures.

## Recommended Server Management Solution

The `server-restart.sh` script is now the recommended method for starting and managing the Weather Dashboard servers:

```bash
# From the project root directory
cd weather-dashboard
./server-restart.sh
```

This script:

- Reliably terminates any existing processes on the required ports
- Starts both frontend and backend servers with proper environment variables
- Includes health checks with timeout handling to verify server startup
- Provides real-time status updates with color-coded feedback
- Allows individual server restart (backend/frontend)
- Creates detailed logs in the logs directory

**Usage Examples:**

```bash
# Restart both servers (default behavior)
./server-restart.sh

# Restart only the backend
./server-restart.sh backend

# Restart only the frontend
./server-restart.sh frontend

# Show help information
./server-restart.sh help
```

## Alternative Server Management Options

The project supports several approaches to server management:

### 1. Direct Start Script

The `direct-start.sh` script provides another way to manage servers without external dependencies:

**Features:**

- Automatic termination of existing processes on required ports (3000, 5003)
- Parallel startup of both frontend and backend servers
- Health checks to verify successful startup
- Detailed logging to dedicated log files
- Graceful shutdown when terminated with Ctrl+C
- Process monitoring and restart on failure

**Usage:**

```bash
cd weather-dashboard
./direct-start.sh
```

**Logs:**

- Frontend: `logs/frontend.log`
- Backend: `logs/backend.log`

### 2. PM2 Process Manager (Recommended for Production)

For production-like environments, PM2 provides additional monitoring and management capabilities:

**Features:**

- Automatic restarts on crashes
- Load balancing
- Process monitoring dashboard
- Log management
- Startup scripts

**Usage:**

```bash
# Install PM2 globally if not already installed
npm install -g pm2

# Start the servers using the ecosystem config
cd weather-dashboard
pm2 start ecosystem.config.js

# Monitor the processes
pm2 monit

# View logs
pm2 logs

# Stop all processes
pm2 stop all
```

## Troubleshooting

### Port Conflicts

If you encounter port conflicts:

```bash
# Check for processes using the frontend port (3000)
lsof -i :3000

# Check for processes using the backend port (5003)
lsof -i :5003

# Kill processes manually if needed
kill -9 <PID>

# Or use the built-in cleanup functionality in server-restart.sh
./server-restart.sh
```

### Incomplete Shutdown

If servers weren't shut down properly:

```bash
# Clean up all node and python processes (use with caution)
pkill -f node
pkill -f python

# Or use the safer targeted approach in server-restart.sh
./server-restart.sh
```

### Checking Server Health

To verify if servers are running correctly:

```bash
# Check frontend
curl -I http://localhost:3000

# Check backend
curl http://localhost:5003/api/health

# Check a specific API endpoint
curl http://localhost:5003/api/weather/current?latitude=51.5074&longitude=-0.1278
```

### API Configuration Issues

If you encounter issues with the frontend not connecting to the backend, check:

1. The `.env` file in `frontend/` should have:

   ```
   REACT_APP_API_URL=http://localhost:5003/api
   PORT=3000
   ```

2. Ensure API configuration in `src/config/api.ts` is importing and exporting correctly:
   - The module exports `API` (not `API_CONFIG`)
   - Services should import `{ API, buildApiUrl }` (not `API_CONFIG`)
   - The `buildApiUrl` function should reference `API.BASE_URL` (not `API_CONFIG.BASE_URL`)

3. After making changes to API configuration, restart both servers with:

   ```bash
   ./server-restart.sh
   ```

## Recent Improvements

The server management infrastructure has been significantly enhanced:

1. **New server-restart.sh Script:**
   - Robust error handling with color-coded feedback
   - Process verification with timeout handling
   - Targeted process termination by port and pattern
   - Wait loop confirmation that processes have started correctly
   - Support for separate backend and frontend management
   - Comprehensive PID tracking and status reporting

2. **Reliable Startup Process:**
   - Consistent port usage (backend: 5003, frontend: 3000)
   - Automatic termination of conflicting processes
   - Health checks to verify successful startup

3. **Enhanced Error Handling:**
   - Detailed logging for troubleshooting
   - Graceful handling of startup failures
   - Process monitoring and automatic restart capabilities

4. **Standardized Configuration:**
   - Environment variable management
   - Consistent port configuration
   - Centralized server settings

5. **Fixed API Configuration:**
   - Corrected import/export naming in API configuration
   - Fixed API endpoint URL construction
   - Ensured consistent API access across components

## Best Practices

- **Always use server-restart.sh** during development to ensure consistency
- Check the logs if you encounter issues
- Keep a terminal window open with the server output for monitoring
- Use Ctrl+C to gracefully shut down the servers
- Avoid manual server management to prevent inconsistent state
- When making changes to API configuration, restart both servers
