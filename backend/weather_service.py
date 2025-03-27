from datetime import date, datetime, timedelta
import requests
from typing import Dict, Any, List, Optional

# Base URL for the Open-Meteo API
OPEN_METEO_URL = "https://api.open-meteo.com/v1"

def fetch_current_weather(latitude: float, longitude: float) -> Dict[str, Any]:
    """Fetch current weather data for a specific location"""

    endpoint = f"{OPEN_METEO_URL}/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": ["temperature_2m", "relative_humidity_2m", "precipitation", "weather_code", "wind_speed_10m", "wind_direction_10m", "is_day"],
        "timezone": "auto"
    }

    response = requests.get(endpoint, params=params)
    response.raise_for_status()
    data = response.json()

    # Transform the response to our API format
    current = data.get("current", {})

    return {
        "temperature": current.get("temperature_2m"),
        "humidity": current.get("relative_humidity_2m"),
        "precipitation": current.get("precipitation"),
        "weatherCode": current.get("weather_code"),
        "windSpeed": current.get("wind_speed_10m"),
        "windDirection": current.get("wind_direction_10m"),
        "isDay": current.get("is_day") == 1,
        "time": current.get("time")
    }

def fetch_hourly_forecast(latitude: float, longitude: float, hours: int = 24) -> Dict[str, Any]:
    """Fetch hourly forecast data for a specific location"""

    endpoint = f"{OPEN_METEO_URL}/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": ["temperature_2m", "precipitation_probability", "precipitation", "weather_code", "is_day"],
        "forecast_hours": hours,
        "timezone": "auto"
    }

    response = requests.get(endpoint, params=params)
    response.raise_for_status()
    data = response.json()

    # Transform the response to our API format
    hourly = data.get("hourly", {})

    return {
        "time": hourly.get("time", [])[:hours],
        "temperature": hourly.get("temperature_2m", [])[:hours],
        "precipitation": hourly.get("precipitation", [])[:hours],
        "weatherCode": hourly.get("weather_code", [])[:hours],
        "isDay": [is_day == 1 for is_day in hourly.get("is_day", [])[:hours]]
    }

def fetch_historical_weather(
    latitude: float,
    longitude: float,
    start_date: date,
    end_date: date
) -> Dict[str, Any]:
    """Fetch historical weather data for a specific location and date range"""

    # Format dates as strings for the API
    start_date_str = start_date.strftime("%Y-%m-%d")
    end_date_str = end_date.strftime("%Y-%m-%d")

    endpoint = f"{OPEN_METEO_URL}/archive"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "start_date": start_date_str,
        "end_date": end_date_str,
        "daily": ["temperature_2m_max", "temperature_2m_min", "temperature_2m_mean",
                  "precipitation_sum", "rain_sum", "snowfall_sum",
                  "precipitation_hours", "weather_code"],
        "timezone": "auto"
    }

    response = requests.get(endpoint, params=params)
    response.raise_for_status()
    data = response.json()

    # Transform the response to our API format
    daily = data.get("daily", {})

    return {
        "latitude": data.get("latitude"),
        "longitude": data.get("longitude"),
        "timezone": data.get("timezone"),
        "dates": daily.get("time", []),
        "temperatureMax": daily.get("temperature_2m_max", []),
        "temperatureMin": daily.get("temperature_2m_min", []),
        "temperatureMean": daily.get("temperature_2m_mean", []),
        "precipitationSum": daily.get("precipitation_sum", []),
        "rainSum": daily.get("rain_sum", []),
        "snowfallSum": daily.get("snowfall_sum", []),
        "precipitationHours": daily.get("precipitation_hours", []),
        "weatherCode": daily.get("weather_code", [])
    }