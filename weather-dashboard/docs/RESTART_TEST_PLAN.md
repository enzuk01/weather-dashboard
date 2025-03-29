# Weather Dashboard Restart Test Plan

## Overview

This document outlines a comprehensive test plan for validating the restart process of the Weather Dashboard application. We'll document each step, identify potential issues, and propose improvements.

## Test Scenarios

We'll test the following restart scenarios:

1. **Clean restart** - Starting the application when no instances are running
2. **Forced restart** - Killing existing processes and restarting
3. **Partial crash restart** - Simulating a backend crash while frontend is running
4. **Port conflict restart** - Simulating other applications using required ports
5. **Syntax error recovery** - Introducing and fixing syntax errors to test recovery

## Test Environment

- **Operating System**: macOS
- **Python Version**: 3.13.2
- **Node.js Version**: 10.9.2
- **Project Location**: `/Users/robmcconnell/Coding/Vibe Coding/python-requests-main/weather-dashboard`

## Test Procedure

### 1. Clean Restart Test

#### Steps

1. Ensure no Flask or Node processes are running

   ```bash
   pkill -f "flask run" || true && pkill -f "node.*react-scripts" || true
   ```

2. Verify ports are free

   ```bash
   lsof -i :5003 | grep LISTEN
   lsof -i :3000 | grep LISTEN
   ```

3. Start application using server-restart.sh

   ```bash
   ./server-restart.sh
   ```

4. Wait 30 seconds, then verify both servers are running

   ```bash
   lsof -i :5003 | grep LISTEN && echo "Backend running"
   lsof -i :3000 | grep LISTEN && echo "Frontend running"
   ```

5. Test API health check

   ```bash
   curl -s http://localhost:5003/api/health | jq
   ```

6. Test frontend loading

   ```bash
   curl -s http://localhost:3000 | grep -i "weather"
   ```

7. Document results

### 2. Forced Restart Test

#### Steps

1. Start application if not already running

   ```bash
   ./server-restart.sh
   ```

2. Force kill all processes

   ```bash
   pkill -f "flask run" && pkill -f "node.*react-scripts"
   ```

3. Immediately start application again

   ```bash
   ./server-restart.sh
   ```

4. Verify both servers restart properly

   ```bash
   lsof -i :5003 | grep LISTEN && echo "Backend running"
   lsof -i :3000 | grep LISTEN && echo "Frontend running"
   ```

5. Document results

### 3. Partial Crash Restart Test

#### Steps

1. Start application

   ```bash
   ./server-restart.sh
   ```

2. Kill only the backend server

   ```bash
   pkill -f "flask run"
   ```

3. Test selective restart of the backend only

   ```bash
   ./server-restart.sh backend
   ```

4. Verify that backend is running again while frontend remains unaffected

   ```bash
   lsof -i :5003 | grep LISTEN && echo "Backend running"
   lsof -i :3000 | grep LISTEN && echo "Frontend running"
   ```

5. Repeat for frontend only using selective restart

   ```bash
   pkill -f "node.*react-scripts"
   ./server-restart.sh frontend
   sleep 10 && lsof -i :3000 | grep LISTEN && echo "Frontend running"
   ```

6. Document results

### 4. Port Conflict Test

#### Steps

1. Start a dummy server on port 5003

   ```bash
   python3 -m http.server 5003 &
   ```

2. Attempt to start the application

   ```bash
   ./server-restart.sh
   ```

3. Check logs to see how conflict was handled

   ```bash
   cat logs/backend.log | tail -30
   ```

4. Repeat for frontend port (3000)

   ```bash
   python3 -m http.server 3000 &
   ./server-restart.sh
   ```

5. Check if application handles the conflict properly

   ```bash
   lsof -i :3000 | grep LISTEN
   ```

6. Document results

### 5. Syntax Error Recovery Test

#### Steps

1. Introduce a syntax error in app.py

   ```bash
   # Add a deliberate syntax error
   echo "PORT = 5003)" >> backend/app.py
   ```

2. Run health check script

   ```bash
   ./scripts/check-python-syntax.sh
   ```

3. Attempt to start application

   ```bash
   ./server-restart.sh
   ```

4. Check logs for error reporting

   ```bash
   cat logs/backend.log | tail -20
   ```

5. Fix the syntax error

   ```bash
   # Fix syntax error
   sed -i '' 's/PORT = 5003)/PORT = 5003/' backend/app.py
   ```

6. Restart and verify recovery

   ```bash
   ./server-restart.sh
   lsof -i :5003 | grep LISTEN && echo "Backend recovered"
   ```

7. Document results

## Documentation Collection

For each test, collect and document:

1. Command output
2. Log entries
3. Error messages
4. Timing information
5. Observed behavior
6. Any manual steps required

## Issue Identification

After testing, identify common issues:

1. Process termination problems
2. Port release delays
3. Error detection and reporting
4. Health check effectiveness
5. Syntax validation completeness

## Test Results Template

### Test Case: [Name]

**Date/Time:** [Date and time of test]

**Steps Executed:**

```
[Command output from each step]
```

**Logs:**

```
[Relevant log entries]
```

**Observations:**

- [Key observations]

**Issues Identified:**

- [List of issues]

**Success Rate:** [Success/Total attempts]

## Improvement Recommendations

Based on test results, we'll generate recommendations for:

1. Script enhancements
2. Error handling improvements
3. Process management updates
4. Monitoring additions
5. Documentation updates

Each recommendation will include:

- Issue description
- Proposed solution
- Implementation priority
- Expected impact
