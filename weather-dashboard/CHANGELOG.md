# Weather Dashboard Changelog

## [Unreleased]

### Added

- Added Husky pre-commit hook to remind about updating CHANGELOG

### Fixed

- Fixed WindDirectionIndicator test TypeScript error by using object syntax for style assertions

## [1.1.0] - 2025-03-27

### Added

- Enhanced error handling for API requests
- Weather alert notifications

### Fixed

- WindDirectionIndicator test TypeScript error for transform style property

## [1.0.0] - 2025-03-27

### Added

- Stable release with all core features
- Final UI polish and performance optimizations
- Complete documentation

### Changed

- Code refactoring for better maintainability
- Improved accessibility features

## [0.3.0] - 2025-03-26

### Added

- Time sampling utility for consistent data representation
- Weather units customization (metric/imperial)
- Vertically stacked layout for weather components

### Changed

- Aligned 24-hour, precipitation, and wind components to show 12 data points
- Changed default location from New York to London, UK
- Improved chart visualizations

### Fixed

- Fixed TailwindCSS animate plugin issues
- Fixed type errors in mockWeatherService
- Resolved port conflicts by changing backend server port to 5003

## [0.2.0] - 2025-03-26

### Added

- Dark mode functionality with smooth transitions
- Theme toggle button with animations
- Enhanced glass card components with improved styling

### Changed

- Improved responsive layout
- Better handling of weather data loading states

## [0.1.0] - 2025-03-26

### Added

- Initial project setup with React and TypeScript
- Basic weather dashboard layout with current weather display
- 24-hour forecast component
- Precipitation chart component
- Wind chart component
- 7-day forecast component
- Glass card component for consistent UI
- Integration with weather API for data fetching
