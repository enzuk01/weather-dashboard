# Weather Dashboard Server Management Guide

This guide provides detailed information about the server management scripts in the Weather Dashboard project, their organization, and best practices for using them.

## Script Organization

The server management scripts have been reorganized to improve maintainability and reduce code duplication:

```
weather-dashboard/
├── scripts/                   # Script directory
│   ├── server-utils.sh        # Utility functions
│   ├── direct-start.sh        # Automatic server startup
│   ├── server-restart.sh      # Simple server restart
│   └── check-python-syntax.sh # Syntax checking utility
├── direct-start.sh            # Symlink to scripts/direct-start.sh
├── server-utils.sh            # Symlink to scripts/server-utils.sh
└── logs/                      # Server logs
```

## Server Management Options

### Option 1: Simple Server Restart (Recommended for Development)

The `server-restart.sh` script provides the most reliable and flexible option for development:

```bash
cd weather-dashboard
./scripts/server-restart.sh         # or just ./server-restart.sh
```

**Features:**

- Color-coded status output
- Selective restart (backend, frontend, or both)
- Health checking and verification
- Clear error reporting

**Usage Options:**

```bash
./server-restart.sh           # Restart both servers
./server-restart.sh backend   # Restart only backend
./server-restart.sh frontend  # Restart only frontend
./server-restart.sh health    # Check server health
./server-restart.sh help      # Show usage information
```

### Option 2: Automatic Server Management

The `direct-start.sh` script provides a comprehensive solution with automatic monitoring:

```bash
cd weather-dashboard
./scripts/direct-start.sh     # or just ./direct-start.sh
```

**Features:**

- Automatic port conflict resolution
- Process monitoring and crash recovery
- Comprehensive error handling
- Detailed logging
- Graceful cleanup on exit (Ctrl+C)

**Usage:**

- Start with `./direct-start.sh`
- Stop with Ctrl+C

### Option 3: PM2-based Server Management (Production Recommended)

For production environments, PM2 provides the most robust solution:

```bash
cd weather-dashboard
pm2 start ecosystem.config.js
```

**Features:**

- Process persistence across system reboots
- Advanced monitoring and statistics
- Cluster mode for load balancing
- Log rotation

**Common Commands:**

```bash
pm2 logs                # View live logs
pm2 status              # Check process status
pm2 monit               # Open real-time monitor
pm2 restart all         # Restart all processes
pm2 stop all            # Stop all processes
pm2 delete all          # Remove all processes
pm2 save                # Save current process list
pm2 startup             # Configure PM2 to start on boot
```

## Utility Scripts

### Server Utilities

The `server-utils.sh` script provides common functions used by other scripts:

```bash
source ./scripts/server-utils.sh
```

This script includes functions for:

- Server health checking
- Port availability testing
- Process management
- Error logging and diagnostics

**Usage in Custom Scripts:**

```bash
#!/bin/bash
source "$(dirname "$0")/scripts/server-utils.sh"

# Now you can use utility functions
check_port 5003
check_url "http://localhost:5003/api/health" 10
```

### Python Syntax Checker

The `check-python-syntax.sh` script verifies Python syntax before running:

```bash
cd weather-dashboard
./scripts/check-python-syntax.sh
```

## Port Configuration

The application uses consistent port configuration:

- **Backend API**: Port 5003
  - Health endpoint: <http://localhost:5003/api/health>
  - Weather endpoints: <http://localhost:5003/api/weather/>*

- **Frontend**: Port 3000
  - User interface: <http://localhost:3000>

## Troubleshooting

### Common Issues

1. **Port conflicts:**

   ```bash
   # Manual port release
   kill $(lsof -ti :3000) 2>/dev/null || true
   kill $(lsof -ti :5003) 2>/dev/null || true
   ```

2. **Backend not starting:**
   - Check `logs/backend.log` for errors
   - Verify virtual environment: `ls -la venv/`
   - Check for proper API configuration in `frontend/.env`

3. **Frontend build failures:**
   - Check `logs/frontend.log` for errors
   - Verify node_modules: `ls -la frontend/node_modules/`
   - Run npm install: `cd frontend && npm install`

4. **"Connection refused" errors:**
   - Ensure backend is running: `curl http://localhost:5003/api/health`
   - Check API configuration: `cat frontend/.env`

### Running Diagnostics

The server utilities include a diagnostics function:

```bash
cd weather-dashboard
source ./scripts/server-utils.sh
run_full_diagnostics
```

This will check:

- Port availability
- Process status
- Server health
- Log files for errors
- Configuration issues

## Best Practices

1. **Use symbolic links** for backward compatibility, not script duplicates

2. **Always check logs** when troubleshooting:

   ```bash
   tail -f logs/backend.log
   tail -f logs/frontend.log
   ```

3. **Restart both servers** after code changes to ensure consistency

4. **Use health checks** to verify services are running properly:

   ```bash
   curl http://localhost:5003/api/health
   ```

5. **Keep scripts in the scripts/ directory** for better organization

## Contributing

When modifying server scripts:

1. Add new utilities to `server-utils.sh`, not individual scripts
2. Maintain backward compatibility with symbolic links
3. Update this documentation when changing functionality
4. Follow the error handling patterns in existing scripts

## Common Issues and Solutions

### Backend Issues

1. **AttributeError: 'OpenMeteoClient' object has no attribute 'format_daily_forecast'**

   This error occurs when the backend attempts to call `format_daily_forecast` as a method of the `OpenMeteoClient` class, but it's actually a standalone function.

   **Solution**: Update the import in `weather_service.py` to include the standalone function:

   ```python
   from openmeteo_client import OpenMeteoClient, format_daily_forecast
   ```

   And call it as a standalone function rather than a method:

   ```python
   # Incorrect:
   # return om.format_daily_forecast(response, days)

   # Correct:
   return format_daily_forecast(response, days)
   ```
