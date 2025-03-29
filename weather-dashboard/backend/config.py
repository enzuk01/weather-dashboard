"""
Configuration settings for the Weather Dashboard backend
"""

import os
import re

# Strip non-numeric characters from string values that should be numbers
def clean_port_value(value, default=5003):
    if not value:
        return default

    # Try to extract just the digits from the port value
    # This handles ANSI color codes and other non-numeric characters
    digits = re.sub(r'[^\d]', '', str(value))

    try:
        port = int(digits)
        # Validate port range
        if port < 1024 or port > 65535:
            return default
        return port
    except (ValueError, TypeError):
        return default

# Environment variables with safe defaults
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
PORT = 5003
HOST = os.environ.get('HOST', '0.0.0.0')

# API configuration
WEATHER_API_BASE_URL = 'https://api.open-meteo.com/v1'

class Config:
    # API settings
    API_PREFIX = '/api'
    CORS_ORIGINS = '*'

    # Server settings
    DEBUG = DEBUG
    PORT = PORT
    HOST = HOST

    # API configuration
    WEATHER_API_BASE_URL = WEATHER_API_BASE_URL

    @classmethod
    def init_app(cls):
        """Initialize application configuration"""
        # Make sure port is clean and numeric
        try:
            port_env = os.getenv('PORT', '5003')
            if port_env:
                # Extract only the numeric part
                numeric_part = re.sub(r'[^0-9]', '', port_env)
                if numeric_part:
                    cls.PORT = int(numeric_part)
        except Exception as e:
            print(f"Error processing PORT: {e}")
            cls.PORT = 5003  # Fallback to default

        return cls
