# Server Scripts Refactoring Plan

## Current Issues Identified

1. **Code Duplication**:
   - `server-utils.sh` contains utility functions for server management
   - `direct-start.sh` likely has overlapping functionality but doesn't import server-utils.sh
   - The scripts in the root and weather-dashboard directories are not consolidated

2. **Directory Structure**:
   - `server-restart.sh` has been moved to scripts/ directory with symbolic links for compatibility
   - Other server scripts are not in the scripts/ directory
   - There's no clear separation between utility functions and executable scripts

## Refactoring Plan

### Phase 1: Initial Assessment (Completed)

- [x] Identify server scripts and utility scripts
- [x] Catalog functionality in each script
- [x] Identify overlapping functionality
- [x] Move server-restart.sh to scripts/ directory

### Phase 2: Refactor Utility Functions

1. **Consolidate Utility Functions**:
   - Move all common utility functions from `direct-start.sh` to `server-utils.sh`
   - Ensure `server-utils.sh` has a complete set of utilities:
     - Server health checks
     - Port management
     - Process management
     - Logging functions
     - Error handling

2. **Move All Utility Scripts to scripts/ Directory**:
   - Move `server-utils.sh` to `scripts/`
   - Create symbolic links for backward compatibility

### Phase 3: Refactor Server Scripts

1. **Update Server Scripts to Use Utils**:
   - Modify `direct-start.sh` to source `scripts/server-utils.sh`
   - Remove duplicated functions from `direct-start.sh`
   - Ensure all scripts use consistent approach for:
     - Port detection
     - Process management
     - Health checks
     - Error handling

2. **Move All Server Scripts to scripts/ Directory**:
   - Move `direct-start.sh` to `scripts/`
   - Create symbolic links for backward compatibility

### Phase 4: Testing and Documentation

1. **Test All Server Scripts**:
   - Ensure `server-restart.sh` works as expected
   - Ensure `direct-start.sh` works as expected
   - Test all symbolic links

2. **Update Documentation**:
   - Update README.md to reference scripts in their new locations
   - Add comments to scripts to indicate their purpose
   - Create a server management guide in the docs/ directory

## Implementation Steps

1. Create backups of all scripts
2. Move server-utils.sh to scripts/ directory
3. Update direct-start.sh to source scripts/server-utils.sh
4. Remove duplicated functions from direct-start.sh
5. Move direct-start.sh to scripts/ directory
6. Create symbolic links for backward compatibility
7. Test all scripts
8. Update documentation

## Future Improvements

1. Consider creating a more robust server management solution:
   - Use a proper process manager like PM2
   - Implement a centralized configuration approach
   - Create a single entry point for all server management tasks

2. Consider using a more standardized approach:
   - Docker containers for consistent environments
   - Docker Compose for multi-service management
   - Kubernetes for production deployment
