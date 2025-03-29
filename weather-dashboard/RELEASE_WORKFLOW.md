## Pre-Release Checklist

1. **Prepare for Release**
   - [ ] Ensure you are on the main branch: `git checkout main`
   - [ ] Pull latest changes: `git pull origin main`
   - [ ] Create a release branch: `git checkout -b release/v{version}`

2. **Version Updates**
   - [ ] Update version in `weather-dashboard/frontend/package.json`
   - [ ] Update version in `weather-dashboard/backend/pyproject.toml`
   - [ ] Update CHANGELOG.md (move [Unreleased] items to new version)
   - [ ] Run version check script: `./scripts/check-versions.sh`

3. **API Configuration Checks**
   - [ ] Verify frontend correctly imports API (not API_CONFIG) from config files
   - [ ] Confirm buildApiUrl function uses API.BASE_URL
   - [ ] Check consistent port usage (backend: 5003, frontend: 3000)
   - [ ] Run API configuration check script: `./scripts/check-api-config.sh`

4. **Quality Checks**
   - [ ] Run all tests: `npm test`
   - [ ] Check for linting errors: `npm run lint`
   - [ ] Verify backend Python files for syntax errors: `python -m py_compile backend/app.py backend/weather_service.py`
   - [ ] Test server startup with server-restart.sh script
   - [ ] Verify all CI checks pass
   - [ ] Test both frontend and backend locally
   - [ ] Verify frontend connects to backend API successfully
   - [ ] Check all API endpoints return expected data

## Common Issues and Solutions

### API Configuration Issues

If the API configuration check script fails:

1. Verify API import/export naming in frontend files:
   - `src/config/api.ts` should export `API` (not `API_CONFIG`)
   - `src/services/weatherService.ts` should import `API` (not `API_CONFIG`)
   - The `buildApiUrl` function should use `API.BASE_URL`

2. Check port configurations:
   - Backend port should be 5003 in all configuration files
   - Frontend port should be 3000 in all configuration files
   - Frontend `.env` file should have `REACT_APP_API_URL=http://localhost:5003/api`

3. Run API configuration check script again

### Server Startup Issues

If the server fails to start during testing:

1. Check for syntax errors in Python files:

   ```bash
   python -m py_compile backend/app.py backend/weather_service.py
   ```

2. Verify port configuration is consistent:
   - `app.py` should use port 5003
   - server-restart.sh should use port 5003 for backend

3. Check logs for specific error messages:

   ```bash
   cat logs/backend.log
   cat logs/frontend.log
   ```

4. Fix any identified issues and restart testing with:

   ```bash
   ./server-restart.sh
   ```

### Failed Release
