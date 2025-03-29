# Dependency Audit Plan

This document outlines the process for auditing and cleaning up unnecessary dependencies in the Weather Dashboard project.

## Frontend Dependencies Review

### Production Dependencies

The following dependencies in `weather-dashboard/frontend/package.json` should be reviewed:

| Dependency | Current Usage | Keep? | Justification |
|------------|---------------|-------|---------------|
| @heroicons/react | Icons for UI components | ✅ | Used in components |
| @types/leaflet | TypeScript types for leaflet | ✅ | Required for leaflet |
| @types/node | TypeScript types for Node.js | ✅ | Required for React |
| @types/react | TypeScript types for React | ✅ | Required for React |
| @types/react-dom | TypeScript types for ReactDOM | ✅ | Required for React |
| clsx | Class name utility | ✅ | Used in multiple components |
| leaflet | Map library | ✅ | Used for WeatherMap component |
| react | Core React library | ✅ | Core framework |
| react-dom | React DOM renderer | ✅ | Core framework |
| react-leaflet | React components for leaflet | ✅ | Used for WeatherMap component |
| react-scripts | Create React App scripts | ✅ | Used for build process |
| tailwindcss-animate | Animation utilities | ⚠️ | Verify usage in components |
| typescript | TypeScript compiler | ✅ | Core language |
| web-vitals | Performance metrics | ⚠️ | Consider removing if not using analytics |
| workbox-* | PWA utilities | ⚠️ | Keep only if PWA functionality is needed |

### Development Dependencies

| Dependency | Current Usage | Keep? | Justification |
|------------|---------------|-------|---------------|
| @tailwindcss/forms | Form styling | ✅ | Used for form components |
| @testing-library/* | Testing utilities | ✅ | Used for component tests |
| @types/jest | TypeScript types for Jest | ✅ | Used for testing |
| autoprefixer | CSS post-processor | ✅ | Required for Tailwind CSS |
| husky | Git hooks | ✅ | Used for commit validation |
| identity-obj-proxy | Mock for CSS imports | ✅ | Used for testing |
| jest | Testing framework | ✅ | Used for testing |
| jest-environment-jsdom | Jest environment | ✅ | Used for testing |
| postcss | CSS post-processor | ✅ | Required for Tailwind CSS |
| tailwindcss | CSS framework | ✅ | Core styling library |
| ts-jest | TypeScript Jest integration | ✅ | Used for testing |

## Backend Dependencies Review

Review dependencies in `weather-dashboard/backend/requirements.txt`:

| Dependency | Current Usage | Keep? | Justification |
|------------|---------------|-------|---------------|
| Flask | Web framework | ✅ | Core backend framework |
| pytest-flask | Flask testing | ✅ | Used for backend testing |
| pytest-mock | Mocking for tests | ✅ | Used for backend testing |
| requests | HTTP client | ✅ | Used for API requests |
| requests-cache | Caching for HTTP requests | ✅ | Used for API caching |
| retry-requests | Retry mechanism | ✅ | Used for API reliability |

## Root Project Dependencies

Review dependencies in the root `package.json`:

| Dependency | Current Usage | Keep? | Justification |
|------------|---------------|-------|---------------|
| @commitlint/* | Commit message validation | ✅ | Used in git workflow |
| concurrently | Run multiple commands | ✅ | Used in npm scripts |
| husky | Git hooks | ✅ | Used for pre-commit hooks |
| lint-staged | Run linters on staged files | ✅ | Used with husky |

## Implementation Steps

1. **Preparation**:
   - Create a branch for dependency cleanup: `git checkout -b cleanup/dependencies`
   - Document current behavior with tests

2. **Frontend Dependencies**:
   - Review PWA usage and remove workbox dependencies if not needed
   - Check web-vitals usage
   - Verify tailwindcss-animate usage

3. **Execution**:
   - Edit `package.json` files
   - Run `npm prune` to remove unused packages
   - Run tests to verify functionality

4. **Security Audit**:
   - Run `npm audit` to identify security issues
   - Fix critical vulnerabilities
   - Document any vulnerabilities that cannot be immediately fixed

5. **Documentation**:
   - Update README with any changes to required dependencies
   - Document any new build or installation steps

## Risk Mitigation

- Run all tests before and after dependency changes
- Make incremental changes and test after each change
- Create snapshot of `node_modules` before cleanup
- Document any changes in build process
