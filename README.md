# Open-Meteo API Python Client

This ia an API client to get weather data from the [Open-Meteo Weather API](https://open-meteo.com) based on the Python library `requests`.

Instead of using JSON, the API client uses FlatBuffers to transfer data. Encoding data in FlatBuffers is more efficient for long time-series data. Data can be transferred to `numpy`, `pandas`, or `polars` using [Zero-Copy](https://en.wikipedia.org/wiki/Zero-copy) to analyze large amount of data quickly. The schema definition files can be found on [GitHub open-meteo/sdk](https://github.com/open-meteo/sdk).

This library is primarily designed for data-scientists to process weather data. In combination with the [Open-Meteo Historical Weather API](https://open-meteo.com/en/docs/historical-weather-api) data from 1940 onwards can be analyzed quickly.

## Basic Usage

The following example gets an hourly temperature, wind speed and precipitation forecast for Berlin. Additionally, the current temperature and relative humidity is retrieved. It is recommended to only specify the required weather variables.

```python
# pip install openmeteo-requests

import openmeteo_requests
from openmeteo_sdk.Variable import Variable

om = openmeteo_requests.Client()
params = {
    "latitude": 52.54,
    "longitude": 13.41,
    "hourly": ["temperature_2m", "precipitation", "wind_speed_10m"],
    "current": ["temperature_2m", "relative_humidity_2m"]
}

responses = om.weather_api("https://api.open-meteo.com/v1/forecast", params=params)
response = responses[0]
print(f"Coordinates {response.Latitude()}°N {response.Longitude()}°E")
print(f"Elevation {response.Elevation()} m asl")
print(f"Timezone {response.Timezone()} {response.TimezoneAbbreviation()}")
print(f"Timezone difference to GMT+0 {response.UtcOffsetSeconds()} s")

# Current values
current = response.Current()
current_variables = list(map(lambda i: current.Variables(i), range(0, current.VariablesLength())))
current_temperature_2m = next(filter(lambda x: x.Variable() == Variable.temperature and x.Altitude() == 2, current_variables))
current_relative_humidity_2m = next(filter(lambda x: x.Variable() == Variable.relative_humidity and x.Altitude() == 2, current_variables))

print(f"Current time {current.Time()}")
print(f"Current temperature_2m {current_temperature_2m.Value()}")
print(f"Current relative_humidity_2m {current_relative_humidity_2m.Value()}")
```

Note 1: You can also supply a list of latitude and longitude coordinates to get data for multiple locations. The API will return a array of results, hence in this example, we only consider the first location with `response = responses[0]`.

Note 2: Please note the function calls `()` for each attribute like `Latitude()`. Those function calls are necessary due to the FlatBuffers format to dynamically get data from an attribute without expensive parsing.

### NumPy

If you are using `NumPy` you can easily get hourly or daily data as `NumPy` array of type float.

```python
import numpy as np

hourly = response.Hourly()
hourly_time = range(hourly.Time(), hourly.TimeEnd(), hourly.Interval())
hourly_variables = list(map(lambda i: hourly.Variables(i), range(0, hourly.VariablesLength())))

hourly_temperature_2m = next(filter(lambda x: x.Variable() == Variable.temperature and x.Altitude() == 2, hourly_variables)).ValuesAsNumpy()
hourly_precipitation = next(filter(lambda x: x.Variable() == Variable.precipitation, hourly_variables)).ValuesAsNumpy()
hourly_wind_speed_10m = next(filter(lambda x: x.Variable() == Variable.wind_speed and x.Altitude() == 10, hourly_variables)).ValuesAsNumpy()
```

### Pandas

After using `NumPy` to create arrays for hourly data, you can use `Pandas` to create a DataFrame from hourly data like follows:

```python
import pandas as pd

hourly_data = {"date": pd.date_range(
 start = pd.to_datetime(hourly.Time(), unit = "s"),
 end = pd.to_datetime(hourly.TimeEnd(), unit = "s"),
 freq = pd.Timedelta(seconds = hourly.Interval()),
 inclusive = "left"
)}
hourly_data["temperature_2m"] = hourly_temperature_2m
hourly_data["precipitation"] = hourly_precipitation
hourly_data["wind_speed_10m"] = hourly_wind_speed_10m

hourly_dataframe_pd = pd.DataFrame(data = hourly_data)
print(hourly_dataframe_pd)
#                    date  temperature_2m  precipitation  wind_speed_10m
# 0   2024-06-21 00:00:00       17.437000            0.0        6.569383
# 1   2024-06-21 01:00:00       17.087000            0.0        6.151683
# 2   2024-06-21 02:00:00       16.786999            0.0        7.421590
# 3   2024-06-21 03:00:00       16.337000            0.0        5.154416
```

### Polars

Additionally, `Polars` can also be used to create a DataFrame from hourly data using the `NumPy` arrays created previously:

```python
import polars as pl
from datetime import datetime, timedelta, timezone

start = datetime.fromtimestamp(hourly.Time(), timezone.utc)
end = datetime.fromtimestamp(hourly.TimeEnd(), timezone.utc)
freq = timedelta(seconds = hourly.Interval())

hourly_dataframe_pl = pl.select(
    date = pl.datetime_range(start, end, freq, closed = "left"),
    temperature_2m = hourly_temperature_2m,
    precipitation = hourly_precipitation,
    wind_speed_10m = hourly_wind_speed_10m
)
print(hourly_dataframe_pl)
# ┌─────────────────────────┬────────────────┬───────────────┬────────────────┐
# │ date                    ┆ temperature_2m ┆ precipitation ┆ wind_speed_10m │
# │ ---                     ┆ ---            ┆ ---           ┆ ---            │
# │ datetime[μs, UTC]       ┆ f32            ┆ f32           ┆ f32            │
# ╞═════════════════════════╪════════════════╪═══════════════╪════════════════╡
# │ 2024-06-21 00:00:00 UTC ┆ 17.437         ┆ 0.0           ┆ 6.569383       │
# │ 2024-06-21 01:00:00 UTC ┆ 17.087         ┆ 0.0           ┆ 6.151683       │
# │ 2024-06-21 02:00:00 UTC ┆ 16.786999      ┆ 0.0           ┆ 7.42159        │
# │ 2024-06-21 03:00:00 UTC ┆ 16.337         ┆ 0.0           ┆ 5.154416       │
```

### Caching Data

If you are working with large amounts of data, caching data can make it easier to develop. You can pass a cached session from the library `requests-cache` to the Open-Meteo API client.

The following example stores all data indefinitely (`expire_after=-1`) in a SQLite database called `.cache.sqlite`. For more options read the [requests-cache documentation](https://pypi.org/project/requests-cache/).

Additionally, `retry-requests` to automatically retry failed API calls in case there has been any unexpected network or server error.

```python
# pip install openmeteo-requests
# pip install requests-cache retry-requests

import openmeteo_requests
import requests_cache
from retry_requests import retry

# Setup the Open-Meteo API client with a cache and retry mechanism
cache_session = requests_cache.CachedSession('.cache', expire_after=-1)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
om = openmeteo_requests.Client(session=retry_session)

# Using the client object `om` will now cache all weather data
```

# TODO

- Document multi location/timeinterval usage
- Document FlatBuffers data structure
- Document time start/end/interval
- Document timezones behavior
- Document pressure level and upper level
- Document endpoints for air quality, etc
- Consider dedicated pandas library to convert responses quickly

# License

MIT

# Weather Dashboard Application

This project is a modern weather dashboard application that showcases the capabilities of the [Open-Meteo Weather API](https://open-meteo.com) using their official Python client.

![Weather Dashboard Preview](assets/dashboard-preview.png)

## Features

- 🌤️ **Current Weather**: Real-time weather conditions including temperature, humidity, precipitation, and wind
- 📅 **Hourly & Daily Forecasts**: Detailed weather predictions for up to 7 days
- 🗺️ **Weather Map** (Beta):
  - Interactive map with OpenStreetMap integration
  - Layer controls for different weather types (temperature, precipitation, wind, clouds)
  - Location marker for selected location
  - Color scale legend for weather data visualization
  - Note: Weather data visualization is currently under development
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 🔄 **Auto-Refresh**: Weather data automatically updates at regular intervals
- 📍 **Location-Based**: Get weather for your current location or search for any place
- ⭐ **Favorites**: Save your frequently checked locations
- 📴 **Offline Mode**: Access previously loaded weather data when you're offline
- 🌓 **Dark Mode**: Easy on the eyes at night

## Technology Stack

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: FastAPI with the Open-Meteo Python client
- **Data Visualization**: D3.js and Recharts
- **Data Processing**: NumPy, Pandas

## Project Structure

- **`/backend`**: FastAPI server that interfaces with the Open-Meteo API
- **`/frontend`**: React application with the dashboard UI
- **`/docs`**: Project documentation

## Documentation Maintenance Guidelines

### Regular Documentation Updates

1. **CHANGELOG.md Updates**
   - Add entries immediately when:
     - Implementing new features
     - Fixing bugs
     - Making significant changes
     - Modifying user-facing functionality
   - Keep entries under the [Unreleased] section until a new version is released
   - Include both technical and user-facing changes
   - Maintain sections for Added, Changed, Fixed, and Pending Implementation

2. **Development Plan Updates**
   - Update WEATHER_DASHBOARD_PLAN.md when:
     - Starting new tasks (mark as [-] In Progress)
     - Completing tasks (mark as [x] Developed)
     - Changing task priorities
     - Adding new requirements
     - Removing or deferring features
   - Keep the Completed in Last Sprint section current
   - Regularly review and update Next Development Focus

3. **Documentation Commit Rules**
   - Make documentation updates in the same commit as code changes
   - Use semantic commit prefixes:
     - `docs:` for documentation-only changes
     - `feat:` for new features
     - `fix:` for bug fixes
     - `refactor:` for code improvements
     - `style:` for styling changes
     - `test:` for test additions/modifications
   - Include detailed commit messages explaining why changes were made

4. **Version Control Best Practices**
   - Commit documentation changes alongside related code
   - Create restore points before major changes
   - Push documentation updates to remote repository daily
   - Review documentation during code review process
   - Keep README.md updated with new features and changes

5. **Quality Checks**
   - Verify all code examples are current and working
   - Ensure documentation reflects the actual codebase
   - Check for broken links and outdated references
   - Maintain consistent formatting and style
   - Update installation and setup instructions as dependencies change

## Version Control with Git

The project uses Git for version control. Here are the key commands for working with the repository:

### Restoring to a Previous Version

The project has a stable restore point tagged as `v1.0-stable`. To restore your project to this version:

```bash
# View available tags
git tag -l

# Restore to the stable version
git checkout v1.0-stable
```

This will put your project in a "detached HEAD" state. If you want to make changes from this point:

```bash
# Create a new branch from the stable point
git checkout -b my-new-feature v1.0-stable
```

### Committing Changes

To save your changes to Git:

```bash
# Check which files have changed
git status

# Stage specific files
git add file1.tsx file2.ts

# Stage all changed files
git add .

# Commit the changes with a descriptive message
git commit -m "Brief description of the changes made"
```

### Working with Branches

Branches let you work on features or fixes without affecting the main codebase:

```bash
# Create a new branch for a feature
git checkout -b feature/new-weather-component

# Switch between branches
git checkout main
git checkout feature/new-weather-component

# List all branches
git branch
```

### Merging Changes

After completing work on a branch, merge it back to the main branch:

```bash
# First, switch to the destination branch
git checkout main

# Merge your feature branch into main
git merge feature/new-weather-component

# If there are conflicts, resolve them, then:
git add .
git commit -m "Resolved merge conflicts"
```

### Common Git Workflows

For a new feature:

1. `git checkout main` - Start from the main branch
2. `git pull` - Get the latest changes
3. `git checkout -b feature/name` - Create a feature branch
4. Make your changes
5. `git add .` && `git commit -m "Description"` - Save changes
6. `git push -u origin feature/name` - Push to remote
7. Create a pull request (if using GitHub)
8. `git checkout main` && `git merge feature/name` - Merge locally

For a hotfix:

1. `git checkout v1.0-stable` - Start from the stable version
2. `git checkout -b hotfix/issue` - Create a hotfix branch
3. Fix the issue
4. `git add .` && `git commit -m "Fixed issue"` - Save changes
5. `git checkout main` && `git merge hotfix/issue` - Merge to main

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Python 3.8+ with pip

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/weather-dashboard.git
   cd weather-dashboard
   ```

2. Install backend dependencies:

   ```bash
   # Using the install script
   chmod +x install_backend.sh
   ./install_backend.sh

   # Or manually
   cd weather-dashboard/backend
   pip install -r requirements.txt
   ```

3. Run the backend server:

   ```bash
   cd weather-dashboard/backend
   python3 main.py
   ```

   The backend server will start on port 5001 by default.

4. Install frontend dependencies:

   ```bash
   cd weather-dashboard/frontend
   npm install
   ```

5. Run the frontend development server:

   ```bash
   npm start
   ```

   The frontend will start on port 3000 and automatically open in your browser.

### Server Management Scripts

For easier development, the project includes scripts to manage server processes:

1. To start both backend and frontend servers with automatic process management:

   ```bash
   cd weather-dashboard
   ./start-servers.sh
   ```

2. For quick frontend-only testing:

   ```bash
   cd weather-dashboard
   ./start-frontend.sh
   ```

These scripts automatically:

- Kill any existing React/Python processes to prevent port conflicts
- Start the required servers
- Provide visual feedback on the terminal

### Using NPM Scripts from Root

For convenience, you can also use the project-wide npm scripts from the root directory:

```bash
# Install dependencies for both frontend and backend
npm install

# Start both backend and frontend concurrently
npm start

# Run all tests
npm test

# Build the frontend for production
npm run build
```

## Development

See the following documentation files for development guidelines:

- [Development Plan](WEATHER_DASHBOARD_PLAN.md) - Checklist of tasks for development
- [Implementation Guide](WEATHER_DASHBOARD_IMPLEMENTATION.md) - Guide for implementing the API client
- [Styling Guide](WEATHER_DASHBOARD_STYLING.md) - Guidelines for styling and UI components

## API Integration

This project uses the Open-Meteo API client for Python. Here's a basic example of using the client:

```python
import openmeteo_requests
from openmeteo_sdk.Variable import Variable

# Create the client
om = openmeteo_requests.Client()

# Set parameters for the API request
params = {
    "latitude": 52.54,
    "longitude": 13.41,
    "hourly": ["temperature_2m", "precipitation", "wind_speed_10m"],
    "current": ["temperature_2m", "relative_humidity_2m"]
}

# Make the API request
responses = om.weather_api("https://api.open-meteo.com/v1/forecast", params=params)
response = responses[0]

# Access the current weather data
current = response.Current()
current_variables = list(map(lambda i: current.Variables(i), range(0, current.VariablesLength())))
current_temperature_2m = next(filter(lambda x: x.Variable() == Variable.temperature and x.Altitude() == 2, current_variables))
print(f"Current temperature: {current_temperature_2m.Value()}°C")
```

For detailed API usage, see the [Open-Meteo API Python Client documentation](https://github.com/open-meteo/python-requests).

## Contributing

1. Check the [Development Plan](WEATHER_DASHBOARD_PLAN.md) for tasks that need implementation
2. Fork the repository
3. Create your feature branch: `git checkout -b feature/amazing-feature`
4. Commit your changes: `git commit -m 'Add some amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Open-Meteo](https://open-meteo.com) for providing the free Weather API
- [Open-Meteo Python Client](https://github.com/open-meteo/python-requests) for the API client library
- Weather background images from [Unsplash](https://unsplash.com)
- Weather icons from [Weather Icons](https://erikflowers.github.io/weather-icons/)
