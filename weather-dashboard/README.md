# Weather Dashboard

A modern, responsive weather dashboard application with real-time weather data, forecasts, and visualizations.

## Latest Updates

The application has been significantly improved with:

- **Enhanced stability** through better error handling and defensive programming
- **Improved cache management** with memory caching and data validation
- **New troubleshooting tools** to easily reset the application if needed
- **TypeScript improvements** for better type safety across components
- **Resilient data handling** to prevent rendering errors with incomplete data

## Features

- Current weather conditions
- Hourly and daily forecasts
- Interactive daylight visualization
- Wind and precipitation data
- Favorite locations management
- Responsive design for all devices
- Dark/Light mode support
- Offline capabilities

## Getting Started

### Prerequisites

- Node.js (v16+)
- Python 3.9+
- An API key from a supported weather provider

### Installation

1. Clone the repository
2. Install dependencies:

   ```
   cd weather-dashboard/frontend && npm install
   cd ../backend && pip install -r requirements.txt
   ```

3. Configure your API key in `backend/config.py`
4. Start the application:

   ```
   ./direct-start.sh
   ```

## Troubleshooting

If you encounter any issues with the application:

1. **Use the cache clearing script**:

   ```
   ./scripts/clear-and-refresh.sh
   ```

   This script will:
   - Clear all frontend build artifacts
   - Generate a new cache buster
   - Clean backend cache files
   - Stop any running servers
   - Restart the application fresh

2. **Check the logs**:
   - Frontend logs: `weather-dashboard/logs/frontend.log`
   - Backend logs: `weather-dashboard/logs/backend.log`

3. **Common issues**:
   - If visualization doesn't sync with forecast (known issue, being addressed)
   - If weather data doesn't load, check your API key and network connection
   - If UI appears broken, try clearing your browser cache

## Development

### Project Structure

- `/frontend` - React-based UI
- `/backend` - Python Flask API server
- `/scripts` - Utility scripts for development and maintenance
- `/logs` - Application logs

### Key Technologies

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Python, Flask
- **Data**: OpenMeteo Weather API

## Contributing

Please see our [contribution guidelines](CONTRIBUTING.md) for details on code style, branch naming, and pull request processes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

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

## Feature Flags

The Weather Dashboard includes a feature flag system that allows toggling between original and enhanced UI components:

### Available Feature Flags

- **Enhanced Current Weather**: Toggles between the original and enhanced current weather display component.
- **Enhanced Sunrise & Sunset**: Toggles between the original and enhanced sunrise/sunset visualization.

### How to Use Feature Flags

1. Click on the "UI Options" button in the header
2. Toggle the switches to enable/disable enhanced features
3. Changes take effect immediately without page reload

### For Developers

The feature flags system is implemented using React Context:

- `FeatureFlagsContext.tsx`: Manages flag state and provides methods to toggle flags
- `FeatureFlagsPanel.tsx`: Provides the UI for toggling flags

To add a new feature flag:

1. Add the flag to the `FeatureFlags` interface in `FeatureFlagsContext.tsx`
2. Update the `FeatureFlagsPanel` component to include the new flag
3. Use conditional rendering with the feature flag in your components

Example:

```tsx
const { flags } = useFeatureFlags();

return (
  <>
    {flags.yourNewFeatureFlag ? (
      <EnhancedComponent />
    ) : (
      <OriginalComponent />
    )}
  </>
);
```

## Documentation

- [Server Management](SERVER_MANAGEMENT.md) - Detailed server management instructions
- [Test Plan](TEST_PLAN.md) - Comprehensive testing strategy
- [Feature Flags](FEATURE_FLAGS.md) - Feature flag system overview and usage
- [Performance Optimizations](PERFORMANCE_OPTIMIZATIONS.md) - Performance improvements and strategies
- [Release Workflow](RELEASE_WORKFLOW.md) - Release process and versioning
- [Changelog](CHANGELOG.md) - Detailed version history
