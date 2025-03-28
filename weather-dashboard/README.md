# Weather Dashboard Application

[Previous content remains unchanged...]

## API Documentation

### Endpoints

1. **Daily Forecast**

   ```
   GET /weather/forecast/daily
   ```

   Parameters:
   - `lat` (float): Latitude of the location
   - `lon` (float): Longitude of the location
   - `days` (int, optional): Number of days to forecast (default: 7)

   Response structure:

   ```typescript
   {
     time: string[];              // Array of dates in YYYY-MM-DD format
     temperature_2m_max: number[];// Daily maximum temperatures in °C
     temperature_2m_min: number[];// Daily minimum temperatures in °C
     precipitation_sum: number[]; // Daily precipitation sum in mm
     precipitation_probability_max: number[]; // Maximum precipitation probability (0-100)
     wind_speed_10m_max: number[];    // Maximum wind speed in km/h
     wind_direction_10m_dominant: number[]; // Dominant wind direction in degrees
     weather_code: number[];      // WMO weather codes
   }
   ```

2. **Hourly Forecast**

   ```
   GET /weather/forecast/hourly
   ```

   Parameters:
   - `lat` (float): Latitude of the location
   - `lon` (float): Longitude of the location
   - `hours` (int, optional): Number of hours to forecast (default: 24)

   Response structure:

   ```typescript
   {
     timestamps: string[];        // Array of timestamps in YYYY-MM-DDThh:mm format
     temperature_2m: number[];    // Temperature at 2m above ground in °C
     apparent_temperature: number[]; // Feels-like temperature in °C
     precipitation_probability: number[]; // Precipitation probability (0-100)
     precipitation: number[];     // Precipitation amount in mm
     rain: number[];             // Rain amount in mm
     showers: number[];          // Shower amount in mm
     snowfall: number[];         // Snowfall amount in mm
     cloud_cover: number[];      // Cloud cover percentage (0-100)
     weather_code: number[];     // WMO weather codes
     wind_speed_10m: number[];   // Wind speed at 10m in km/h
     wind_direction_10m: number[]; // Wind direction in degrees
     relative_humidity_2m: number[]; // Relative humidity at 2m (0-100)
     wind_gusts_10m: number[];   // Wind gusts at 10m in km/h
     is_day: number[];          // Daylight indicator (1 for day, 0 for night)
   }
   ```

3. **Weather Codes**

   ```
   GET /weather/codes
   ```

   Response structure:

   ```typescript
   {
     [key: string]: string;      // Mapping of WMO codes to descriptions
   }
   ```

   Example:

   ```json
   {
     "0": "Clear sky",
     "1": "Mainly clear",
     "2": "Partly cloudy",
     "3": "Overcast"
     // ... more codes
   }
   ```

### Data Structure Types

```typescript
// Combined weather data interface
export interface WeatherData {
    current: CurrentWeatherData;
    hourly: HourlyForecastData;
    daily: DailyForecastData;
    location: LocationData;
}

// Daily forecast data structure
export interface DailyForecastData {
    time: string[];                      // Array of dates
    temperature_2m_max: number[];        // Maximum temperatures
    temperature_2m_min: number[];        // Minimum temperatures
    precipitation_sum: number[];         // Daily precipitation totals
    precipitation_probability_max: number[]; // Maximum precipitation probability
    wind_speed_10m_max: number[];       // Maximum wind speeds
    wind_direction_10m_dominant: number[]; // Dominant wind directions
    weather_code: number[];             // Weather condition codes
}

// Hourly forecast data structure
export interface HourlyForecastData {
    timestamps: string[];               // Hourly timestamps
    temperature_2m: number[];          // Temperatures
    precipitation: number[];           // Precipitation amounts
    precipitation_probability: number[]; // Precipitation probabilities
    wind_speed_10m: number[];         // Wind speeds
    wind_direction_10m: number[];     // Wind directions
    weather_code: number[];           // Weather condition codes
    is_day: number[];                // Day/night indicators
}

// Location data structure
export interface LocationData {
    name: string;
    country: string;
    state?: string;
    latitude: number;
    longitude: number;
}
```

### Usage Examples

1. **Fetching Daily Forecast**

   ```typescript
   const response = await fetch(
     `${API_BASE_URL}/weather/forecast/daily?lat=51.5074&lon=-0.1278&days=7`
   );
   const dailyData: DailyForecastData = await response.json();
   ```

2. **Accessing Weather Data in Components**

   ```typescript
   const DailyForecastCards: React.FC<{ weatherData: WeatherData }> = ({ weatherData }) => {
     // Access daily forecast data through weatherData.daily
     const { time, temperature_2m_max, temperature_2m_min } = weatherData.daily;

     return (
       // Component implementation
     );
   };
   ```

### Error Handling

All endpoints return standard HTTP status codes:

- 200: Successful request
- 400: Invalid parameters
- 404: Location not found
- 500: Server error

Error response structure:

```typescript
{
    message: string;  // Error description
    status: number;   // HTTP status code
}
```

[Rest of README content remains unchanged...]
