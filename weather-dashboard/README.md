# Weather Dashboard

A modern, responsive weather application with real-time updates, dark mode support, and customizable settings.

## Features

- Real-time weather data with auto-refresh
- Dark mode support with smooth transitions
- Customizable units (temperature, wind speed, precipitation)
- Multiple language support
- Responsive design for all devices
- Hourly and daily forecasts
- Wind direction indicators
- UV index monitoring

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- Python (v3.8 or later)
- npm or yarn

### Installation

1. Clone the repository
2. Install frontend dependencies:

   ```
   cd frontend
   npm install
   ```

3. Install backend dependencies:

   ```
   cd ../backend
   pip install -r requirements.txt
   ```

### Running the Application

#### Using the Server Scripts

We provide convenience scripts to manage server processes automatically:

**Start both frontend and backend:**

```
./start-servers.sh
```

**Start only the frontend (for quick testing):**

```
./start-frontend.sh
```

These scripts will automatically:

- Kill any existing React/Python servers to prevent port conflicts
- Start the appropriate servers
- Provide status updates in the terminal

#### Manual Startup

**Frontend:**

```
cd frontend
npm start
```

**Backend:**

```
cd backend
python main.py
```

## Development

### Project Structure

- `frontend/` - React application
  - `src/components/` - UI components
  - `src/context/` - React context providers
  - `src/hooks/` - Custom React hooks
  - `src/types/` - TypeScript type definitions
  - `src/utils/` - Utility functions

- `backend/` - Python API server
  - `controllers/` - API route handlers
  - `models/` - Data models
  - `services/` - External API integrations

### Testing

Run tests with:

```
cd frontend
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
