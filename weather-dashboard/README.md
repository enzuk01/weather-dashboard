## Server Management

For reliable development, the project includes multiple server management options:

### Option 1: Simple Server Restart Script (Recommended)

For reliable server management with an easy interface:

```bash
cd weather-dashboard
./server-restart.sh  # Symlink to scripts/server-restart.sh
```

This script provides:

- Simple, reliable server control with real-time status feedback
- Color-coded output showing process status and health checks
- Selective restart options (backend, frontend, or both)
- Proper process termination and startup verification
- Automatic logging to `logs/backend.log` and `logs/frontend.log`

Usage options:

```bash
./server-restart.sh           # Restart both servers
./server-restart.sh backend   # Restart only backend
./server-restart.sh frontend  # Restart only frontend
./server-restart.sh help      # Show usage information
```

### Option 2: Direct Server Management

For an alternative development approach:

```bash
cd weather-dashboard
./direct-start.sh  # Symlink to scripts/direct-start.sh
```

This script:

- Automatically kills any existing processes on ports 5003 and 3000
- Starts the backend Flask server on port 5003
- Starts the frontend React server on port 3000
- Monitors both processes and restarts them if they crash
- Directs logs to `logs/backend.log` and `logs/frontend.log`
- Can be stopped with Ctrl+C (cleans up both processes)

### Option 3: PM2-based Server Management (Recommended for Production)

For advanced process management with PM2:

```bash
cd weather-dashboard
pm2 start ecosystem.config.js
```

This approach:

- Uses PM2 to manage processes
- Includes automatic restarts, logging, and monitoring
- Persists across system reboots (with `pm2 save`)
- Provides advanced monitoring via `pm2 monit`

PM2 commands:

- `pm2 logs` - View logs
- `pm2 status` - Check status
- `pm2 monit` - Monitor in real-time
- `pm2 stop all` - Stop all processes
- `pm2 delete all` - Stop and remove all processes

### Script Organization

All server management scripts have been moved to the `scripts/` directory for better organization:

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

Symbolic links in the project root maintain backward compatibility.

### Legacy Server Scripts

The project also includes legacy server scripts:

```bash
# Start both servers
./start-servers.sh

# Start frontend only
./start-frontend.sh
```

These scripts are maintained for backward compatibility but are not recommended for new development.

### Port Configuration

The application uses the following consistent port configuration:

- **Backend API**: Port 5003
  - Health endpoint: <http://localhost:5003/api/health>
  - Weather endpoints: <http://localhost:5003/api/weather/>*

- **Frontend**: Port 3000
  - User interface: <http://localhost:3000>

All configuration files and scripts have been updated to maintain this consistent port usage. If you need to change ports, you'll need to update:

- `frontend/.env` - PORT and REACT_APP_API_URL
- `scripts/server-restart.sh` - BACKEND_PORT and FRONTEND_PORT
- `scripts/direct-start.sh` - FRONTEND_PRIMARY_PORT and BACKEND_PORT
- `ecosystem.config.js` - PORT environment variable

### API Configuration

The frontend connects to the backend API using correct configuration in:

- `src/config/api.ts` - Exports the API configuration
- `src/services/weatherService.ts` - Imports and uses the API configuration

If you encounter connectivity issues, verify:

1. The frontend imports `API` (not `API_CONFIG`) from the config file
2. All API URLs are built using the proper endpoint construction

### Troubleshooting

If you encounter server issues:

1. Check logs:
   - Direct start: `logs/backend.log` and `logs/frontend.log`
   - PM2: `pm2 logs`

2. Ensure correct ports:
   - Backend: 5003
   - Frontend: 3000

3. Kill existing processes:

   ```bash
   kill $(lsof -ti :3000) 2>/dev/null || true
   kill $(lsof -ti :5003) 2>/dev/null || true
   ```

4. If TypeScript errors appear, they're suppressed during development but can be reviewed in the console.

5. For detailed troubleshooting steps, see `SERVER_MANAGEMENT.md`
