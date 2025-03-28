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
        "current": [
            "temperature_2m",
            "apparent_temperature",
            "relative_humidity_2m",
            "precipitation",
            "weather_code",
            "wind_speed_10m",
            "wind_direction_10m",
            "surface_pressure",
            "is_day"
        ],
        "timezone": "auto"
    }

    response = requests.get(endpoint, params=params)
    response.raise_for_status()
    data = response.json()

    # Transform the response to match frontend's expected format
    current = data.get("current", {})

    return {
        "temperature_2m": current.get("temperature_2m"),
        "apparent_temperature": current.get("apparent_temperature"),
        "relative_humidity_2m": current.get("relative_humidity_2m"),
        "precipitation": current.get("precipitation"),
        "weather_code": current.get("weather_code"),
        "wind_speed_10m": current.get("wind_speed_10m"),
        "wind_direction_10m": current.get("wind_direction_10m"),
        "surface_pressure": current.get("surface_pressure"),
        "is_day": current.get("is_day"),
        "timestamp": current.get("time")
    }

def fetch_hourly_forecast(latitude: float, longitude: float, hours: int = 24) -> Dict[str, Any]:
    """Fetch hourly forecast data for a specific location"""

    endpoint = f"{OPEN_METEO_URL}/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": [
            "temperature_2m",
            "apparent_temperature",
            "precipitation_probability",
            "precipitation",
            "rain",
            "showers",
            "snowfall",
            "cloud_cover",
            "weather_code",
            "wind_speed_10m",
            "wind_direction_10m",
            "relative_humidity_2m",
            "wind_gusts_10m",
            "is_day"
        ],
        "forecast_hours": hours,
        "timezone": "auto"
    }

    response = requests.get(endpoint, params=params)
    response.raise_for_status()
    data = response.json()

    # Transform the response to match frontend's expected format
    hourly = data.get("hourly", {})
    times = hourly.get("time", [])[:hours]

    return {
        "timestamps": times,
        "temperature_2m": hourly.get("temperature_2m", [])[:hours],
        "apparent_temperature": hourly.get("apparent_temperature", [])[:hours],
        "precipitation_probability": hourly.get("precipitation_probability", [])[:hours],
        "precipitation": hourly.get("precipitation", [])[:hours],
        "rain": hourly.get("rain", [])[:hours],
        "showers": hourly.get("showers", [])[:hours],
        "snowfall": hourly.get("snowfall", [])[:hours],
        "cloud_cover": hourly.get("cloud_cover", [])[:hours],
        "weather_code": hourly.get("weather_code", [])[:hours],
        "wind_speed_10m": hourly.get("wind_speed_10m", [])[:hours],
        "wind_direction_10m": hourly.get("wind_direction_10m", [])[:hours],
        "relative_humidity_2m": hourly.get("relative_humidity_2m", [])[:hours],
        "wind_gusts_10m": hourly.get("wind_gusts_10m", [])[:hours],
        "is_day": hourly.get("is_day", [])[:hours]
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

    endpoint = f"{OPEN_METEO_URL}/forecast"  # Changed to forecast endpoint for daily forecast

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "daily": [
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_sum",
            "precipitation_probability_max",
            "wind_speed_10m_max",
            "wind_direction_10m_dominant",
            "weather_code"
        ],
        "timezone": "auto",
        "start_date": start_date_str,
        "end_date": end_date_str
    }

    response = requests.get(endpoint, params=params)
    response.raise_for_status()
    data = response.json()

    # Transform the response to match frontend's expected format
    daily = data.get("daily", {})

    return {
        "time": daily.get("time", []),
        "temperature_2m_max": daily.get("temperature_2m_max", []),
        "temperature_2m_min": daily.get("temperature_2m_min", []),
        "precipitation_sum": daily.get("precipitation_sum", []),
        "precipitation_probability_max": daily.get("precipitation_probability_max", []),
        "wind_speed_10m_max": daily.get("wind_speed_10m_max", []),
        "wind_direction_10m_dominant": daily.get("wind_direction_10m_dominant", []),
        "weather_code": daily.get("weather_code", [])
    }