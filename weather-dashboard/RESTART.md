# Weather Dashboard Server Management

This document outlines the server management process for the Weather Dashboard application. The process is designed to be reliable, safe, and provide clear feedback about what's happening.

## Quick Start

To start or restart the application:

```bash
cd weather-dashboard
chmod +x start.sh restart.sh
./start.sh
```

## Server Management Scripts

The application provides two main scripts for server management:

1. **start.sh** (Primary Entry Point)
   - Main script to use for starting the application
   - Automatically detects if servers are running
   - Ensures clean server state using restart.sh
   - Logs all operations to `logs/start.log`

2. **restart.sh** (Internal Process)
   - Handles the actual server restart process
   - Called automatically by start.sh
   - Can be used directly if needed
   - Logs all operations to `logs/restart.log`

## What the Process Does

The server management process performs the following steps in sequence:

1. **Process Cleanup**
   - Terminates ALL existing Python and Node.js processes
   - Verifies no Python or Node.js processes are running
   - Ensures ports 5003 (backend) and 3001 (frontend) are free

2. **Backend Startup**
   - Starts the Python/Uvicorn backend server in detached mode
   - Monitors backend logs for startup success or errors
   - Verifies the backend is responding by checking the `/weather/codes` endpoint
   - Logs the backend process ID

3. **Frontend Startup**
   - Starts the React frontend application in detached mode
   - Monitors frontend logs for startup success or errors
   - Verifies the frontend is responding
   - Logs the frontend process ID

## Logging

All operations are logged to the `logs` directory:

- `logs/start.log`: Overall server management logs
- `logs/restart.log`: Detailed restart process logs
- `logs/backend.log`: Backend server logs
- `logs/frontend.log`: Frontend server logs

## Error Detection

The process actively monitors server logs for:

- Error messages and exceptions
- Failed startup attempts
- Interactive prompts requiring user input
- Successful startup indicators
- Timeout conditions

## Error Handling

The process includes robust error handling:

- Automatic retry mechanism (3 attempts) for server startup verification
- Clear error messages with timestamps
- Graceful cleanup on script interruption
- Port availability checking
- Process termination verification
- Log monitoring for startup issues
- Timeout protection (30 seconds per server)

## Best Practices

1. **Always use start.sh**
   - This ensures consistent server management
   - Automatically handles running servers
   - Maintains proper logging

2. **Check logs for issues**
   - All operations are logged
   - Error messages are clearly marked
   - Timestamps help track sequence of events

3. **Avoid manual server management**
   - Don't start servers directly
   - Don't kill processes manually
   - Use the provided scripts for all operations

## Troubleshooting

If the process fails:

1. Check the logs in the `logs` directory
2. Look for specific error messages in the server logs
3. Verify no other processes are using ports 5003 or 3001
4. Check that both backend and frontend dependencies are installed
5. Ensure you have necessary permissions to kill processes

## Configuration

The scripts use the following default configuration:

- Backend Port: 5003
- Frontend Port: 3001
- Maximum Retry Attempts: 3
- Wait Time Between Retries: 5 seconds
- Log Check Timeout: 30 seconds

## Safety Features

- Comprehensive process cleanup
- Directory existence verification
- Port availability checking
- Process termination confirmation
- Server response verification
- Log monitoring for errors and prompts
- Comprehensive logging
- Interrupt signal handling
- Detached process execution

## Requirements

- Bash shell
- Python 3.x with uvicorn
- Node.js and npm
- lsof command-line utility
- curl command-line utility
- pkill command-line utility
- pgrep command-line utility
