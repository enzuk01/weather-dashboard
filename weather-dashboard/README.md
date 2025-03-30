# Weather Dashboard

A modern weather dashboard application with a React frontend and Flask backend.

## Features

- Current weather conditions display
- 24-hour forecast with temperature, precipitation, and wind data
- 7-day forecast with daily highs and lows
- Interactive weather map with multiple layers (temperature, precipitation, wind, clouds)
- Sunrise and sunset visualization
- Location search and favorites management
- Responsive design for desktop and mobile devices

## Architecture

The application consists of two main components:

1. **Frontend**: React application built with TypeScript, Tailwind CSS, and Chart.js
2. **Backend**: Flask API server that fetches data from the Open-Meteo API and serves it to the frontend

## Prerequisites

- Node.js (v16+)
- Python (v3.9+)
- npm or yarn

## Setup

### Clone the repository

```bash
git clone [repository-url]
cd weather-dashboard
```

### Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
# or with yarn
yarn install
```

## Environment Configuration

### Backend Configuration

Edit `backend/config.py` to change:

- Port (default: 5003)
- Debug mode
- API configuration

### Frontend Configuration

The frontend connects to the backend API. Configure the API URL in `frontend/src/config/api.ts`:

```typescript
export const API = {
  baseUrl: 'http://localhost:5003/api',
  // other settings...
};
```

## Running the Application

### Using the Process Manager (Recommended)

We provide a process manager script that handles starting and stopping both frontend and backend services cleanly:

```bash
# Make sure the script is executable
chmod +x scripts/process-manager.sh

# Start both services
./scripts/process-manager.sh start

# Check status
./scripts/process-manager.sh status

# View logs
./scripts/process-manager.sh logs

# Stop services
./scripts/process-manager.sh stop

# Restart services
./scripts/process-manager.sh restart
```

### Manual Startup

#### Start the Backend

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```

The backend will start on <http://localhost:5003>

#### Start the Frontend

```bash
cd frontend
npm start
# or with yarn
yarn start
```

The frontend will start on <http://localhost:3000>

## Type Safety

This project uses TypeScript for type safety. The interface files in `frontend/src/types/` define the data structures used throughout the application.

**Important**: When modifying service functions or data structures, ensure that the returned data matches the interfaces in `weatherTypes.ts`. This is critical for application stability.

## Testing

### Backend Tests

```bash
cd backend
python -m pytest
```

### Frontend Tests

```bash
cd frontend
npm test
# or with yarn
yarn test
```

## Troubleshooting

### Port Conflicts

If you encounter an error about ports being in use:

```bash
# Check for processes using the frontend port (3000)
lsof -i :3000

# Check for processes using the backend port (5003)
lsof -i :5003

# Kill a process using a specific port
kill -9 [PID]

# Or use our process manager to clean up
./scripts/process-manager.sh stop
```

### Type Errors

If you encounter TypeScript errors related to types not matching:

1. Check the interfaces in `frontend/src/types/weatherTypes.ts`
2. Ensure that the data returned by the service functions in `frontend/src/services/weatherService.ts` matches these interfaces
3. Use optional properties for fields that might not always be present in responses

### React Hook Errors

If you see errors about React hooks not being found:

1. Check your React imports to ensure you're importing the hooks correctly:

   ```typescript
   import React, { useState, useEffect } from 'react';
   ```

2. Ensure you're using functional components, not class components, when using hooks
3. Make sure the React version in package.json is compatible with hooks (16.8.0+)

## Development Guidelines

### Code Organization

- Keep components small and focused on a single responsibility
- Use types and interfaces to define data structures
- Use hooks for state management and side effects
- Follow naming conventions throughout the codebase

### API Integration

- All API calls should go through the service layer
- Handle loading and error states for all data fetching
- Use optional chaining and nullish coalescing for safe property access
- Implement fallbacks for missing data

### Testing

- Write tests for critical functionality
- Test both success and error cases
- Use mocks for API calls

## Deployment

For production deployment:

1. Build the frontend:

   ```bash
   cd frontend
   npm run build
   # or with yarn
   yarn build
   ```

2. Serve the built files from the backend or a static file server

3. Configure the backend for production (disable debug mode, set appropriate CORS settings)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
