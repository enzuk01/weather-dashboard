"""
OpenMeteo Client - Simple implementation

This is a basic implementation of a client to fetch data from the Open-Meteo API.
It provides core functionality to get weather data and format it for the frontend.
"""

import requests
import logging
from datetime import datetime
import traceback

API_URL = "https://api.open-meteo.com/v1/forecast"

class OpenMeteoClient:
    """A simple client for the Open-Meteo API"""

    def __init__(self):
        self.api_url = API_URL

    def get_weather(self, params):
        """
        Fetch weather data from the Open-Meteo API

        Args:
            params (dict): Parameters for the API request

        Returns:
            dict: Weather data response
        """
        try:
            response = requests.get(self.api_url, params=params)
            response.raise_for_status()  # Raise an error for bad responses
            return response.json()
        except requests.exceptions.RequestException as e:
            logging.error(f"Error fetching weather data: {str(e)}")
            logging.error(traceback.format_exc())
            raise

def format_current_weather(response):
    """
    Format the current weather data from the API response

    Args:
        response (dict): API response from Open-Meteo

    Returns:
        dict: Formatted current weather data
    """
    try:
        current = response.get('current', {})

        # Format the timestamp to ISO format
        timestamp = current.get('time')
        if timestamp:
            timestamp = datetime.fromisoformat(timestamp).isoformat()

        return {
            "timestamp": timestamp,
            "temperature_2m": current.get('temperature_2m'),
            "relative_humidity_2m": current.get('relative_humidity_2m'),
            "precipitation": current.get('precipitation'),
            "weather_code": current.get('weather_code'),
            "wind_speed_10m": current.get('wind_speed_10m'),
            "wind_direction_10m": current.get('wind_direction_10m'),
            "is_day": current.get('is_day'),
            "surface_pressure": current.get('surface_pressure', 1013.25),
            "rain": current.get('rain', 0.0),
            "snowfall": current.get('snowfall', 0.0),
            "latitude": response.get('latitude'),
            "longitude": response.get('longitude'),
            "elevation": response.get('elevation'),
            "timezone": response.get('timezone')
        }
    except Exception as e:
        logging.error(f"Error formatting current weather: {str(e)}")
        logging.error(traceback.format_exc())
        raise

def format_hourly_forecast(response, hours=24):
    """
    Format the hourly forecast data from the API response

    Args:
        response (dict): API response from Open-Meteo
        hours (int): Number of hours to return

    Returns:
        dict: Formatted hourly forecast data
    """
    try:
        hourly = response.get('hourly', {})

        # Limit data to the requested number of hours
        timestamps = hourly.get('time', [])[:hours]
        temperature = hourly.get('temperature_2m', [])[:hours]
        humidity = hourly.get('relative_humidity_2m', [])[:hours]
        precip_prob = hourly.get('precipitation_probability', [])[:hours]
        precipitation = hourly.get('precipitation', [])[:hours]
        weather_code = hourly.get('weather_code', [])[:hours]
        wind_speed = hourly.get('wind_speed_10m', [])[:hours]
        wind_direction = hourly.get('wind_direction_10m', [])[:hours]
        is_day = hourly.get('is_day', [])[:hours]

        # Some hourly data might not be available - fill with reasonable defaults
        if not wind_speed and 'hourly' in response:
            wind_speed = [5.0] * len(timestamps)

        if not wind_direction and 'hourly' in response:
            wind_direction = [0] * len(timestamps)

        if not is_day and 'hourly' in response:
            is_day = [(1 if 6 <= datetime.fromisoformat(t).hour < 20 else 0) for t in timestamps]

        # Calculate apparent temperature using a simple formula if not available
        apparent_temp = []
        for i in range(len(temperature)):
            t = temperature[i]
            h = humidity[i] if i < len(humidity) else 50
            w = wind_speed[i] if i < len(wind_speed) else 5.0

            # Simple heat index formula
            feels_like = t

            # Wind chill effect for cold temperatures
            if t < 10:
                feels_like -= (w * 0.1)

            # Heat index effect for warm temperatures
            if t > 20:
                feels_like += (h * 0.05)

            apparent_temp.append(round(feels_like, 1))

        wind_gusts = hourly.get('wind_gusts_10m', [])[:hours]
        if not wind_gusts:
            # If wind gusts are not available, estimate them as wind speed + 30%
            wind_gusts = [speed * 1.3 for speed in wind_speed]

        return {
            "timestamps": timestamps,
            "temperature_2m": temperature,
            "apparent_temperature": apparent_temp,
            "precipitation_probability": precip_prob if precip_prob else [0] * len(timestamps),
            "precipitation": precipitation if precipitation else [0] * len(timestamps),
            "weather_code": weather_code if weather_code else [0] * len(timestamps),
            "wind_speed_10m": wind_speed,
            "wind_direction_10m": wind_direction,
            "relative_humidity_2m": humidity if humidity else [50] * len(timestamps),
            "is_day": is_day,
            "wind_gusts_10m": wind_gusts,
            "latitude": response.get('latitude'),
            "longitude": response.get('longitude'),
            "elevation": response.get('elevation'),
            "timezone": response.get('timezone')
        }
    except Exception as e:
        logging.error(f"Error formatting hourly forecast: {str(e)}")
        logging.error(traceback.format_exc())
        raise