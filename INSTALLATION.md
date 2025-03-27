# Weather Dashboard Installation Guide

This guide will help you set up and run the Weather Dashboard application.

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm 6 or higher

## Backend Setup

1. Navigate to the backend directory:

   ```
   cd weather-dashboard/backend
   ```

2. Install the required Python packages:

   ```
   pip3 install -r requirements.txt
   ```

3. Start the backend server:

   ```
   python3 main.py
   ```

   The backend server will run on port 5001 by default to avoid conflicts with AirPlay Receiver on macOS.

## Frontend Setup

1. Navigate to the frontend directory:

   ```
   cd weather-dashboard/frontend
   ```

2. Install the required npm packages:

   ```
   npm install
   ```

3. Start the frontend development server:

   ```
   npm start
   ```

   The frontend server will run on port 3000 by default.

## Quick Start

For a quicker setup, you can use the npm scripts defined in the root package.json:

1. From the project root:

   ```
   npm run install:backend
   npm run install:frontend
   ```

2. Then start both servers:

   ```
   npm run start:backend
   ```

   In a separate terminal:

   ```
   npm run start
   ```

## Troubleshooting

### Port Conflicts

- **Backend Port Conflict**: If you see an error about port 5001 being in use, you can modify the port in `weather-dashboard/backend/main.py`.

- **Frontend Port Conflict**: If port 3000 is in use, React will prompt you to use a different port (typically 3001).

### Missing Dependencies

- **Backend Dependencies**: If you encounter module import errors, ensure you've installed all requirements with `pip3 install -r requirements.txt`.

- **Frontend Dependencies**: If you see module not found errors, try running `npm install` again in the frontend directory.

### Python Command Not Found

- If you see "python: command not found", try using `python3` instead.

## Running Tests

- To run backend tests:

  ```
  cd weather-dashboard/backend
  python3 run_tests.py
  ```

- To run frontend tests:

  ```
  cd weather-dashboard/frontend
  npm test
  ```
