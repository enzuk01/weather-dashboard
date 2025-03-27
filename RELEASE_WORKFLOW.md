# Release Workflow

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

3. **Quality Checks**
   - [ ] Run all tests: `npm test`
   - [ ] Check for linting errors: `npm run lint`
   - [ ] Verify all CI checks pass
   - [ ] Test both frontend and backend locally

## Release Process

1. **Commit Release Changes**

   ```bash
   git add .
   git commit -m "release: prepare v{version}"
   ```

2. **Create Pull Request**
   - Create PR from `release/v{version}` to `main`
   - Use title format: "Release v{version}"
   - Include changelog entries in PR description
   - Get required approvals

3. **Merge and Tag**

   ```bash
   # After PR is approved
   git checkout main
   git pull origin main
   git tag -a v{version} -m "Release v{version}"
   git push origin main --tags
   ```

4. **Create GitHub Release**
   - Go to GitHub Releases
   - Click "Draft a new release"
   - Choose the tag
   - Title: "v{version}"
   - Description: Copy relevant CHANGELOG.md section
   - Publish release

5. **Post-Release**
   - [ ] Verify deployment was successful
   - [ ] Check all services are running correctly
   - [ ] Clean up release branch: `git branch -d release/v{version}`

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

3. **Release Hotfix**

   ```bash
   git add .
   git commit -m "hotfix: v{version}.{patch}"
   git checkout main
   git merge hotfix/v{version}.{patch}
   git tag -a v{version}.{patch} -m "Hotfix v{version}.{patch}"
   git push origin main --tags
   ```

## Version Numbering

- **Major Version** (x.0.0): Breaking changes
- **Minor Version** (1.x.0): New features, backward-compatible
- **Patch Version** (1.0.x): Bug fixes, backward-compatible

## Scripts

- `scripts/check-versions.sh`: Ensures version numbers match across all files
- `scripts/prepare-release.sh`: Automates version updates and changelog preparation
- `scripts/create-release.sh`: Automates the release process

## Common Issues and Solutions

### Version Mismatch

If the version check script fails:

1. Check all version numbers in package.json and pyproject.toml
2. Ensure CHANGELOG.md has the correct version
3. Run version check script again

### Failed Release

If the release process fails:

1. Check the error messages
2. Revert any local changes: `git reset --hard origin/main`
3. Delete the local tag: `git tag -d v{version}`
4. Start the process again

### Merge Conflicts

If conflicts occur during release:

1. Resolve conflicts locally
2. Run version check script
3. Commit resolved changes
4. Continue with release process
