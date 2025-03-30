# Flask configuration
import os

# Environment variables
DEBUG = False
PORT = 5003
HOST = '0.0.0.0'

# API configuration
API_PREFIX = '/api'
CORS_ORIGINS = '*'
WEATHER_API_BASE_URL = 'https://api.open-meteo.com/v1'

# Define a Config class for better organization and compatibility with Flask patterns
class Config:
    """Configuration class for the Flask application"""
    # API settings
    API_PREFIX = API_PREFIX
    CORS_ORIGINS = CORS_ORIGINS

    # Server settings
    DEBUG = DEBUG
    PORT = PORT
    HOST = HOST

    # External services
    WEATHER_API_BASE_URL = WEATHER_API_BASE_URL

    # Security
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-please-change-in-production')

    @classmethod
    def init_app(cls):
        """Initialize the application with this configuration"""
        # This method can be used to set up logging, initialize extensions, etc.
        pass

# Production configuration subclass
class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    # Other production-specific settings

# Development configuration subclass
class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    # Other development-specific settings

# Testing configuration subclass
class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    # Other testing-specific settings
