# Weather Dashboard Implementation Guide

This document provides implementation guidelines for the Weather Dashboard application, with a focus on properly using the Open-Meteo API client.

## Backend Setup

### Setting Up the Open-Meteo Client

Our FastAPI backend will use the Open-Meteo client with caching and retry functionality for optimal performance:

```python
# In backend/weather_service.py

import openmeteo_requests
import requests_cache
from retry_requests import retry
from openmeteo_sdk.Variable import Variable

# Setup the client with caching and retry
cache_session = requests_cache.CachedSession('.cache', expire_after=3600)  # Cache for 1 hour
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
om = openmeteo_requests.Client(session=retry_session)

def get_current_weather(latitude, longitude):
    """
    Get current weather conditions for a specific location
    """
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": ["temperature_2m", "relative_humidity_2m", "precipitation", "wind_speed_10m", "wind_direction_10m"]
    }

    responses = om.weather_api("https://api.open-meteo.com/v1/forecast", params=params)
    response = responses[0]

    # Process current weather data
    current = response.Current()
    current_variables = list(map(lambda i: current.Variables(i), range(0, current.VariablesLength())))

    # Extract data using the FlatBuffers approach
    current_data = {}

    # Get temperature
    temperature = next(filter(lambda x: x.Variable() == Variable.temperature and x.Altitude() == 2, current_variables), None)
    if temperature:
        current_data["temperature_2m"] = temperature.Value()

    # Get humidity
    humidity = next(filter(lambda x: x.Variable() == Variable.relative_humidity and x.Altitude() == 2, current_variables), None)
    if humidity:
        current_data["relative_humidity_2m"] = humidity.Value()

    # Get precipitation
    precipitation = next(filter(lambda x: x.Variable() == Variable.precipitation, current_variables), None)
    if precipitation:
        current_data["precipitation"] = precipitation.Value()

    # Get wind speed
    wind_speed = next(filter(lambda x: x.Variable() == Variable.wind_speed and x.Altitude() == 10, current_variables), None)
    if wind_speed:
        current_data["wind_speed_10m"] = wind_speed.Value()

    # Get wind direction
    wind_direction = next(filter(lambda x: x.Variable() == Variable.wind_direction and x.Altitude() == 10, current_variables), None)
    if wind_direction:
        current_data["wind_direction_10m"] = wind_direction.Value()

    # Add metadata
    current_data["timestamp"] = current.Time()
    current_data["latitude"] = response.Latitude()
    current_data["longitude"] = response.Longitude()
    current_data["elevation"] = response.Elevation()
    current_data["timezone"] = response.Timezone()

    return current_data

def get_hourly_forecast(latitude, longitude, hours=48):
    """
    Get hourly forecast data for a specific location
    """
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": ["temperature_2m", "precipitation_probability", "precipitation", "wind_speed_10m", "wind_direction_10m"]
    }

    responses = om.weather_api("https://api.open-meteo.com/v1/forecast", params=params)
    response = responses[0]

    # Process hourly forecast data
    hourly = response.Hourly()
    hourly_variables = list(map(lambda i: hourly.Variables(i), range(0, hourly.VariablesLength())))

    # Create time series using the interval information
    start_time = hourly.Time()
    end_time = hourly.TimeEnd()
    interval = hourly.Interval()

    # Get temperature data as NumPy array
    temperature = next(filter(lambda x: x.Variable() == Variable.temperature and x.Altitude() == 2, hourly_variables), None)
    temperature_data = temperature.ValuesAsNumpy() if temperature else None

    # Get precipitation probability data
    precip_prob = next(filter(lambda x: x.Variable() == Variable.precipitation_probability, hourly_variables), None)
    precip_prob_data = precip_prob.ValuesAsNumpy() if precip_prob else None

    # Get precipitation data
    precipitation = next(filter(lambda x: x.Variable() == Variable.precipitation, hourly_variables), None)
    precipitation_data = precipitation.ValuesAsNumpy() if precipitation else None

    # Get wind speed data
    wind_speed = next(filter(lambda x: x.Variable() == Variable.wind_speed and x.Altitude() == 10, hourly_variables), None)
    wind_speed_data = wind_speed.ValuesAsNumpy() if wind_speed else None

    # Get wind direction data
    wind_direction = next(filter(lambda x: x.Variable() == Variable.wind_direction and x.Altitude() == 10, hourly_variables), None)
    wind_direction_data = wind_direction.ValuesAsNumpy() if wind_direction else None

    # Create a more web-friendly format
    import numpy as np
    from datetime import datetime, timedelta

    timestamps = [start_time + i * interval for i in range(min(hours, len(temperature_data) if temperature_data is not None else 0))]
    formatted_times = [datetime.fromtimestamp(ts).isoformat() for ts in timestamps]

    forecast_data = {
        "timestamps": formatted_times,
        "temperature_2m": temperature_data[:hours].tolist() if temperature_data is not None else [],
        "precipitation_probability": precip_prob_data[:hours].tolist() if precip_prob_data is not None else [],
        "precipitation": precipitation_data[:hours].tolist() if precipitation_data is not None else [],
        "wind_speed_10m": wind_speed_data[:hours].tolist() if wind_speed_data is not None else [],
        "wind_direction_10m": wind_direction_data[:hours].tolist() if wind_direction_data is not None else []
    }

    # Add metadata
    forecast_data["latitude"] = response.Latitude()
    forecast_data["longitude"] = response.Longitude()
    forecast_data["elevation"] = response.Elevation()
    forecast_data["timezone"] = response.Timezone()

    return forecast_data
```

### FastAPI Endpoints

Set up the FastAPI endpoints to serve the weather data:

```python
# In backend/main.py

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional

from .weather_service import get_current_weather, get_hourly_forecast

app = FastAPI(title="Weather Dashboard API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/current-weather")
async def current_weather(
    latitude: float = Query(..., description="Latitude of the location"),
    longitude: float = Query(..., description="Longitude of the location")
):
    """Get current weather conditions for a location"""
    return get_current_weather(latitude, longitude)

@app.get("/api/hourly-forecast")
async def hourly_forecast(
    latitude: float = Query(..., description="Latitude of the location"),
    longitude: float = Query(..., description="Longitude of the location"),
    hours: Optional[int] = Query(48, description="Number of hours to forecast")
):
    """Get hourly forecast for a location"""
    return get_hourly_forecast(latitude, longitude, hours)
```

## Frontend Integration

### Weather Service

Create a service to interact with the backend API:

```typescript
// In src/services/weatherService.ts

export interface CurrentWeather {
  temperature_2m: number;
  relative_humidity_2m: number;
  precipitation: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  timestamp: number;
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
}

export interface HourlyForecast {
  timestamps: string[];
  temperature_2m: number[];
  precipitation_probability: number[];
  precipitation: number[];
  wind_speed_10m: number[];
  wind_direction_10m: number[];
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
}

const API_BASE_URL = 'http://localhost:8000/api';

export const fetchCurrentWeather = async (latitude: number, longitude: number): Promise<CurrentWeather> => {
  const response = await fetch(`${API_BASE_URL}/current-weather?latitude=${latitude}&longitude=${longitude}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch current weather: ${response.statusText}`);
  }

  return await response.json();
};

export const fetchHourlyForecast = async (
  latitude: number,
  longitude: number,
  hours: number = 48
): Promise<HourlyForecast> => {
  const response = await fetch(
    `${API_BASE_URL}/hourly-forecast?latitude=${latitude}&longitude=${longitude}&hours=${hours}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch forecast: ${response.statusText}`);
  }

  return await response.json();
};
```

## Data Visualization Examples

### Temperature Chart Component

```tsx
// In src/components/TemperatureChart.tsx

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TemperatureChartProps {
  timestamps: string[];
  temperatures: number[];
}

const TemperatureChart: React.FC<TemperatureChartProps> = ({ timestamps, temperatures }) => {
  // Prepare data for Recharts
  const data = timestamps.map((time, index) => ({
    time: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: temperatures[index],
  }));

  return (
    <div className="h-64 w-full bg-white/10 backdrop-blur-md rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2">Temperature Forecast</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis
            dataKey="time"
            tick={{ fill: '#ddd' }}
            tickFormatter={(value) => value}
          />
          <YAxis tick={{ fill: '#ddd' }} unit="°C" />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', borderColor: '#666' }}
            labelStyle={{ color: '#ddd' }}
          />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="#FF6B6B"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, stroke: '#FF6B6B', strokeWidth: 2, fill: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TemperatureChart;
```

## Best Practices

### Error Handling

Always implement proper error handling for API requests:

```typescript
try {
  setLoading(true);
  const weatherData = await fetchCurrentWeather(latitude, longitude);
  setCurrentWeather(weatherData);
} catch (error) {
  console.error('Failed to fetch weather data:', error);
  setError('Unable to fetch weather data. Please try again later.');
} finally {
  setLoading(false);
}
```

### Caching Considerations

The backend already implements caching via requests-cache, but for frontend optimizations:

1. Use React Query or SWR for data fetching with built-in caching
2. Implement proper cache invalidation strategies
3. Consider localStorage for persisting user preferences and favorite locations

## Performance Tips

1. Implement lazy loading for components not visible in the initial viewport
2. Use React.memo for pure components that render frequently
3. Implement virtualization for long lists (e.g., hourly forecasts)
4. Optimize images and assets for faster loading
5. Implement code splitting to reduce initial bundle size

## Next Steps

Refer to the `WEATHER_DASHBOARD_PLAN.md` checklist to track development progress and ensure all features are implemented according to specifications.
