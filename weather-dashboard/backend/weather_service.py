"""
Weather Service - Open-Meteo API Client Integration

This module handles weather data fetching using the Open-Meteo API.
It uses a basic implementation for stability and maintainability.
"""

import logging
from datetime import datetime, timezone
import traceback
import math

# Import our basic client implementation
from openmeteo_client import OpenMeteoClient, format_current_weather, format_hourly_forecast

# Initialize the client
om = OpenMeteoClient()
logging.info("Using basic OpenMeteo client implementation")

def calculate_feels_like_temperature(temperature, humidity, wind_speed):
    """
    Calculate the "feels like" temperature based on temperature, humidity, and wind speed.
    Uses a combination of heat index for hot weather and wind chill for cold weather.

    Args:
        temperature (float): Temperature in Celsius
        humidity (float): Relative humidity (%)
        wind_speed (float): Wind speed in km/h

    Returns:
        float: The apparent temperature ("feels like") in Celsius
    """
    # Convert wind speed from km/h to m/s for calculations
    wind_speed_ms = wind_speed / 3.6

    # If it's cold (< 10°C), use wind chill
    if temperature < 10:
        # Wind chill formula (for temperatures <= 10°C and wind speed > 4.8 km/h)
        if wind_speed > 4.8:
            wind_chill = 13.12 + 0.6215 * temperature - 11.37 * pow(wind_speed_ms, 0.16) + 0.3965 * temperature * pow(wind_speed_ms, 0.16)
            return wind_chill
        else:
            return temperature

    # If it's hot (> 27°C), use heat index
    elif temperature > 27:
        # Heat index formula (simplified Steadman's formula)
        heat_index = (
            -8.784695 +
            1.61139411 * temperature +
            2.338549 * humidity -
            0.14611605 * temperature * humidity -
            0.012308094 * temperature**2 -
            0.016424828 * humidity**2 +
            0.002211732 * temperature**2 * humidity +
            0.00072546 * temperature * humidity**2 -
            0.000003582 * temperature**2 * humidity**2
        )
        return heat_index

    # For temperatures between 10°C and 27°C, use a weighted average
    else:
        # Calculate both heat index and wind chill
        heat_weight = (temperature - 10) / 17  # Scale from 0 at 10°C to 1 at 27°C

        # Calculate a basic heat index even in moderate temperatures
        simple_heat_index = temperature + 0.348 * humidity / 100 * 5.39 - 0.7 * wind_speed_ms

        # Calculate a moderate wind chill
        simple_wind_chill = temperature - 0.5 * wind_speed_ms

        # Weighted average based on how hot it is
        return simple_wind_chill * (1 - heat_weight) + simple_heat_index * heat_weight

def get_current_weather(latitude, longitude):
    """
    Get current weather conditions for a specific location

    Args:
        latitude (float): The latitude of the location
        longitude (float): The longitude of the location

    Returns:
        dict: Current weather data
    """
    try:
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": ["temperature_2m", "relative_humidity_2m", "precipitation", "weather_code",
                       "wind_speed_10m", "wind_direction_10m", "is_day"],
            "timezone": "auto"
        }

        # Using basic implementation
        response = om.get_weather(params)
        weather_data = format_current_weather(response)

        # Calculate feels like temperature if we have the required data
        if (weather_data["temperature_2m"] is not None and
            weather_data["relative_humidity_2m"] is not None and
            weather_data["wind_speed_10m"] is not None):
            weather_data["feels_like_temperature"] = calculate_feels_like_temperature(
                weather_data["temperature_2m"],
                weather_data["relative_humidity_2m"],
                weather_data["wind_speed_10m"]
            )

        return weather_data

    except Exception as e:
        logging.error(f"Error getting current weather: {str(e)}")
        logging.error(traceback.format_exc())
        raise

def get_hourly_forecast(latitude, longitude, hours=48):
    """
    Get hourly forecast data for a specific location

    Args:
        latitude (float): The latitude of the location
        longitude (float): The longitude of the location
        hours (int): Number of hours to forecast

    Returns:
        dict: Hourly forecast data
    """
    try:
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "hourly": ["temperature_2m", "precipitation_probability", "precipitation",
                      "weather_code", "wind_speed_10m", "wind_direction_10m", "is_day",
                      "relative_humidity_2m"],
            "forecast_days": (hours + 23) // 24,  # Convert hours to days, rounding up
            "timezone": "auto"
        }

        # Using basic implementation
        response = om.get_weather(params)
        forecast_data = format_hourly_forecast(response, hours)

        # Calculate feels like temperature for each hour if we have all required data
        if ("temperature_2m" in forecast_data and
            "relative_humidity_2m" in forecast_data and
            "wind_speed_10m" in forecast_data):
            forecast_data["feels_like_temperature"] = [
                calculate_feels_like_temperature(temp, humidity, wind)
                for temp, humidity, wind in zip(
                    forecast_data["temperature_2m"],
                    forecast_data["relative_humidity_2m"],
                    forecast_data["wind_speed_10m"]
                )
            ]

        return forecast_data

    except Exception as e:
        logging.error(f"Error getting hourly forecast: {str(e)}")
        logging.error(traceback.format_exc())
        raise

def get_daily_forecast(latitude, longitude, days=7):
    """
    Get daily forecast data for a specific location

    Args:
        latitude (float): The latitude of the location
        longitude (float): The longitude of the location
        days (int): Number of days to forecast

    Returns:
        dict: Daily forecast data
    """
    try:
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "daily": [
                "temperature_2m_max", "temperature_2m_min",
                "apparent_temperature_max", "apparent_temperature_min",
                "sunrise", "sunset", "uv_index_max", "precipitation_sum",
                "rain_sum", "snowfall_sum", "precipitation_probability_max",
                "weather_code", "wind_speed_10m_max", "wind_direction_10m_dominant"
            ],
            "forecast_days": days,
            "timezone": "auto"
        }

        # Using basic implementation
        response = om.get_weather(params)

        # Extract and format the daily forecast data
        daily = response.get('daily', {})

        return {
            "time": daily.get('time', [])[:days],
            "temperature_2m_max": daily.get('temperature_2m_max', [])[:days],
            "temperature_2m_min": daily.get('temperature_2m_min', [])[:days],
            "apparent_temperature_max": daily.get('apparent_temperature_max', [])[:days],
            "apparent_temperature_min": daily.get('apparent_temperature_min', [])[:days],
            "sunrise": daily.get('sunrise', [])[:days],
            "sunset": daily.get('sunset', [])[:days],
            "uv_index_max": daily.get('uv_index_max', [])[:days],
            "precipitation_sum": daily.get('precipitation_sum', [])[:days],
            "rain_sum": daily.get('rain_sum', [])[:days],
            "snowfall_sum": daily.get('snowfall_sum', [])[:days],
            "precipitation_probability_max": daily.get('precipitation_probability_max', [])[:days],
            "weather_code": daily.get('weather_code', [])[:days],
            "wind_speed_10m_max": daily.get('wind_speed_10m_max', [])[:days],
            "wind_direction_10m_dominant": daily.get('wind_direction_10m_dominant', [])[:days],
            "latitude": response.get('latitude'),
            "longitude": response.get('longitude'),
            "elevation": response.get('elevation'),
            "timezone": response.get('timezone')
        }

    except Exception as e:
        logging.error(f"Error getting daily forecast: {str(e)}")
        logging.error(traceback.format_exc())
        raise