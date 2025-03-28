# Weather Dashboard Application

[Previous content remains unchanged until API Documentation section...]

## API Documentation

### Server Configuration

The application runs on the following ports:

- Frontend: Port 3001
- Backend: Port 5003

### Endpoints

1. **Current Weather**

   ```
   GET /api/current-weather
   ```

   Parameters:
   - `latitude` (float): Latitude of the location
   - `longitude` (float): Longitude of the location

   Response includes current temperature, humidity, precipitation, wind conditions, and weather code.

2. **Hourly Forecast**

   ```
   GET /api/hourly-forecast
   ```

   Parameters:
   - `latitude` (float): Latitude of the location
   - `longitude` (float): Longitude of the location
   - `hours` (int, optional): Number of hours to forecast (default: 24)

   Response includes hourly predictions for temperature, precipitation probability, wind conditions, etc.

3. **Daily Forecast**

   ```
   GET /api/daily-forecast
   ```

   Parameters:
   - `latitude` (float): Latitude of the location
   - `longitude` (float): Longitude of the location
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

4. **Health Check**

   ```
   GET /api/health
   ```

   Response:

   ```json
   {
     "status": "healthy"
   }
   ```

### Error Handling

All endpoints follow a consistent error response format:

```json
{
  "message": "Error description",
  "status": 400
}
```

Common error codes:

- 400: Bad Request (invalid parameters)
- 404: Not Found
- 500: Internal Server Error

[Remaining content unchanged...]
