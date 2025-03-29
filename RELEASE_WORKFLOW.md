# Release Workflow

## Pre-Release Checklist

1. **Prepare for Release**
   - [ ] Ensure you are on the main branch: `git checkout main`
   - [ ] Pull latest changes: `git pull origin main`
   - [ ] Create a release branch: `git checkout -b release/v{version}`

2. **Version Updates**
   - [ ] Update version in `weather-dashboard/frontend/package.json`
   - [ ] Update version in `weather-dashboard/backend/app.py` (if version exists there)
   - [ ] Update CHANGELOG.md (move [Unreleased] items to new version)
   - [ ] Run version check script: `./scripts/check-versions.sh`

3. **API Configuration Checks**
   - [ ] Verify frontend correctly imports API (not API_CONFIG) from config files
   - [ ] Confirm buildApiUrl function uses API.BASE_URL
   - [ ] Check consistent port usage (backend: 5003, frontend: 3000)
   - [ ] Run API configuration check script: `./scripts/check-api-config.sh`

4. **Quality Checks**
   - [ ] Run all tests: `cd weather-dashboard/frontend && npm test`
   - [ ] Check for linting errors: `npm run lint`
   - [ ] Test both frontend and backend locally
   - [ ] Verify frontend connects to backend API successfully

## Release Process (Solo Developer)

1. **Commit Release Changes**

   ```bash
   git add .
   git commit -m "chore: prepare release v{version}"
   ```

2. **Create Tag for the Release Branch**

   ```bash
   git tag -a v{version} -m "Release v{version}"
   git push origin v{version}
   ```

3. **Direct Merge to Main (Simple Approach)**

   ```bash
   git checkout main
   git pull origin main
   git merge release/v{version}
   git push origin main
   ```

4. **Clean Up**

   ```bash
   git branch -D release/v{version}
   git push origin --delete release/v{version}
   ```

5. **Create GitHub Release**
   - Go to GitHub Releases
   - Click "Draft a new release"
   - Choose the tag
   - Title: "v{version}"
   - Description: Copy relevant CHANGELOG.md section
   - Publish release

6. **Post-Release**
   - [ ] Verify deployment was successful
   - [ ] Check all services are running correctly
   - [ ] Test frontend connectivity to backend API

## Hotfix Process

1. **Create Hotfix Branch**

   ```bash
   git checkout main
   git checkout -b hotfix/v{version}.{patch}
   ```

2. **Make Changes**
   - Fix the issue
   - Update version numbers
   - Update CHANGELOG.md
   - Run version check script
   - Run API configuration check script

3. **Release Hotfix**

   ```bash
   git add .
   git commit -m "fix: hotfix v{version}.{patch}"
   git tag -a v{version}.{patch} -m "Hotfix v{version}.{patch}"
   git checkout main
   git merge hotfix/v{version}.{patch}
   git push origin main
   git push origin v{version}.{patch}
   git branch -D hotfix/v{version}.{patch}
   ```

## Version Numbering

- **Major Version** (x.0.0): Breaking changes
- **Minor Version** (1.x.0): New features, backward-compatible
- **Patch Version** (1.0.x): Bug fixes, backward-compatible

## Scripts

- `scripts/check-versions.sh`: Ensures version numbers match across all files
- `scripts/check-api-config.sh`: Verifies API configuration consistency

## Common Issues and Solutions

### Version Mismatch

If the version check script fails:

1. Check all version numbers in package.json and app.py
2. Ensure CHANGELOG.md has the correct version
3. Run version check script again

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

### Branch Protection Rules

If you encounter issues pushing directly to main:

1. Go to repository Settings → Branches
2. Find the "main" branch protection rule
3. Review the restrictions that may be blocking your push:
   - Require pull request reviews
   - Require linear history
   - Require status checks to pass
4. Temporarily adjust these settings as needed for your workflow
5. Remember to restore protection settings after the release if needed
