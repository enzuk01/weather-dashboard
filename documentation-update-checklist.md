# Documentation Update Checklist

After cleaning up zombie files and code, the following documentation files need to be reviewed and updated to ensure consistency.

## Core Files to Check

- [ ] `README.md` - Main project documentation
- [ ] `WEATHER_DASHBOARD_PLAN.md` - Development roadmap
- [ ] `RELEASE_WORKFLOW.md` - Release process documentation
- [ ] `weather-dashboard/README.md` - Application-specific documentation
- [ ] `weather-dashboard/CHANGELOG.md` - Version history
- [ ] `weather-dashboard/docs/SERVER_MANAGEMENT.md` - Server management guide

## Review for References to

### Removed Scripts

- [ ] `reliable-restart.sh`
- [ ] `restart-servers.sh`
- [ ] `restart-servers-new.sh`
- [ ] `weather-dashboard/restart-servers.sh`
- [ ] `weather-dashboard/simple-start.sh`
- [ ] `weather-dashboard/start-servers.sh`
- [ ] `weather-dashboard/run.sh`

### Removed Backup Files

- [ ] `weather-dashboard/backend/app.py.bak`
- [ ] Any other `.bak` files

## Documentation Updates Required

### Script References

1. **Ensure all documentation refers to the current recommended scripts:**
   - [ ] `server-restart.sh` - Primary server management script
   - [ ] `direct-start.sh` - Alternative development script
   - [ ] `start-with-pm2.sh` - Production deployment option

2. **Update any code examples or commands**
   - [ ] Check and update any command examples
   - [ ] Verify script paths are correct

### README Updates

1. **Main README.md:**
   - [ ] Update "Getting Started" instructions if needed
   - [ ] Verify "Server Management Scripts" section
   - [ ] Check "Development" section for outdated references

2. **Application README.md:**
   - [ ] Update server startup instructions
   - [ ] Review environment variables section
   - [ ] Ensure development guide is current

## Update PR Description Template

When creating a PR for the cleanup, include:

1. List of files removed
2. Documentation updates made
3. Verification steps performed
4. Any remaining items that need manual attention

## Post-Cleanup Review

- [ ] Verify all scripts mentioned in docs actually exist
- [ ] Ensure no dangling references to removed files
- [ ] Confirm startup instructions work as documented
- [ ] Test release process documentation for accuracy
