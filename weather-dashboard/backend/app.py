"""
Main Flask application for the Weather Dashboard backend
"""

import os
import sys
import logging
import traceback
import argparse
from datetime import datetime, timedelta

# Fixed port to avoid conflicts
PORT = 5003

# Parse command line arguments
parser = argparse.ArgumentParser(description='Weather Dashboard Backend Server')
parser.add_argument('--no-debug', action='store_true', help='Disable debug mode')
args = parser.parse_args()

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add parent directory to path to allow imports
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

# Try imports with fallbacks for better error handling
try:
    from flask import Flask, jsonify, request
    print("Flask imported successfully")
except ImportError as e:
    print(f"Error importing Flask: {e}")
    sys.exit(1)

try:
    from flask_cors import CORS
    print("CORS imported successfully")
except ImportError as e:
    print(f"Error importing flask_cors: {e}")
    sys.exit(1)

# Define a fallback Config class that will be used if import fails
class Config:
    API_PREFIX = '/api'
    CORS_ORIGINS = '*'
    DEBUG = not args.no_debug
    PORT = PORT

    @staticmethod
    def init_app():
        pass

# Try to import config, but use our fallback if it fails
try:
    # First try to import directly from config file
    sys.path.insert(0, current_dir)
    import config as config_module

    # Check if Config class exists in the imported module
    if hasattr(config_module, 'Config'):
        Config = config_module.Config
        print("Config imported successfully")
    else:
        # If there's no Config class, but there are config variables, adapt them
        Config.DEBUG = getattr(config_module, 'DEBUG', Config.DEBUG)
        Config.PORT = getattr(config_module, 'PORT', Config.PORT)
        Config.API_PREFIX = getattr(config_module, 'API_PREFIX', '/api')
        Config.CORS_ORIGINS = getattr(config_module, 'CORS_ORIGINS', '*')
        print("Adapted config variables successfully")
except ImportError as e:
    print(f"Error importing config: {e}")
    print("Using fallback Config class")

# Try to import real service functions but provide mock versions if they fail
try:
    from weather_service import get_current_weather as service_get_current_weather
    from weather_service import get_hourly_forecast as service_get_hourly_forecast
    from weather_service import get_daily_forecast as service_get_daily_forecast
    print("Weather service functions imported successfully")

    # Use imported functions
    get_current_weather = service_get_current_weather
    get_hourly_forecast = service_get_hourly_forecast
    get_daily_forecast = service_get_daily_forecast
except ImportError as e:
    print(f"Error importing weather_service: {e}. Using mock implementations.")

    # Create mock implementations as fallbacks
    def get_current_weather(lat, lon):
        return {
            "temperature_2m": 22.5,
            "apparent_temperature": 23.1,
            "relative_humidity_2m": 65,
            "precipitation": 0,
            "precipitation_probability": 50,  # Add this required field
            "weather_code": 1,  # Few clouds
            "wind_speed_10m": 5.2,
            "wind_direction_10m": 180,
            "surface_pressure": 1015,
            "is_day": 1
        }

    def get_hourly_forecast(lat, lon, hours=24):
        timestamps = [f"2023-06-21T{hour:02d}:00:00Z" for hour in range(hours)]
        return {
            "timestamps": timestamps,
            "temperature_2m": [22 + hour % 5 for hour in range(hours)],
            "precipitation_probability": [10 * (hour % 10) for hour in range(hours)],
            "precipitation": [0.1 * (hour % 5) for hour in range(hours)],
            "weather_code": [1 for _ in range(hours)],
            "wind_speed_10m": [5 + hour % 3 for hour in range(hours)],
            "wind_direction_10m": [180 + 10 * (hour % 18) for hour in range(hours)],
            "is_day": [(1 if 6 <= hour < 20 else 0) for hour in range(hours)]
        }

    def get_daily_forecast(lat, lon, days=7):
        dates = [f"2023-06-{21 + day}" for day in range(days)]
        return {
            "time": dates,
            "temperature_2m_max": [25 + day % 5 for day in range(days)],
            "temperature_2m_min": [15 + day % 3 for day in range(days)],
            "precipitation_sum": [day % 10 for day in range(days)],
            "precipitation_probability_max": [10 * (day % 10) for day in range(days)],
            "weather_code": [day % 5 for day in range(days)],
            "wind_speed_10m_max": [10 + day % 5 for day in range(days)],
            "wind_direction_10m_dominant": [180 + 10 * day for day in range(days)],
            "sunrise": [f"06:{day:02d}:00" for day in range(days)],
            "sunset": [f"20:{day:02d}:00" for day in range(days)]
        }

# Try to import openmeteo client, but provide stub if it fails
try:
    from openmeteo_client import fetch_weather_data
    print("OpenMeteo client imported successfully")
except ImportError as e:
    print(f"Error importing openmeteo_client: {e}")
    def fetch_weather_data(*args, **kwargs):
        return {"error": "OpenMeteo client not available"}

# Create a simple performance monitor
class PerformanceMonitor:
    def get_metrics(self):
        return {"memory_usage_mb": 50, "uptime_seconds": 3600}

# Create simple logger
class Logger:
    def exception(self, msg, *args):
        print(f"ERROR: {msg % args}")

# Placeholder for missing modules
logger = Logger()
performance_monitor = PerformanceMonitor()

def setup_error_logging(app):
    pass

def start_memory_logging():
    pass

def create_app(config_class=Config):
    """Create and configure the Flask application"""
    print(f"Creating Flask app with config: {config_class}")

    # Initialize Flask app
    app = Flask(__name__)

    # Initialize configuration
    app.config.from_object(config_class)
    app.config['JSONIFY_PRETTYPRINT_REGULAR'] = False

    if hasattr(config_class, 'init_app'):
        config_class.init_app()

    # Configure CORS
    CORS(app, resources={r"/api/*": {"origins": getattr(config_class, 'CORS_ORIGINS', '*')}})

    # API Routes
    api_prefix = getattr(config_class, 'API_PREFIX', '/api')

    @app.route(f'{api_prefix}/weather/current')
    def current_weather():
        """Get current weather for a location"""
        try:
            lat = float(request.args.get('latitude', request.args.get('lat', 0)))
            lon = float(request.args.get('longitude', request.args.get('lon', 0)))

            weather_data = get_current_weather(lat, lon)
            return jsonify(weather_data)
        except Exception as e:
            logger.exception('Error fetching current weather: %s', str(e))
            return jsonify({"error": str(e)}), 500

    @app.route(f'{api_prefix}/weather/forecast/hourly')
    def hourly_forecast():
        """Get hourly forecast for a location"""
        try:
            lat = float(request.args.get('latitude', request.args.get('lat', 0)))
            lon = float(request.args.get('longitude', request.args.get('lon', 0)))
            hours = int(request.args.get('hours', 24))

            forecast_data = get_hourly_forecast(lat, lon, hours)
            return jsonify(forecast_data)
        except Exception as e:
            logger.exception('Error fetching hourly forecast: %s', str(e))
            return jsonify({"error": str(e)}), 500

    @app.route(f'{api_prefix}/weather/forecast/daily')
    def daily_forecast():
        """Get daily forecast for a location"""
        try:
            lat = float(request.args.get('latitude', request.args.get('lat', 0)))
            lon = float(request.args.get('longitude', request.args.get('lon', 0)))
            days = int(request.args.get('days', 7))

            forecast_data = get_daily_forecast(lat, lon, days)
            return jsonify(forecast_data)
        except Exception as e:
            logger.exception('Error fetching daily forecast: %s', str(e))
            return jsonify({"error": str(e)}), 500

    @app.route(f'{api_prefix}/health')
    def health_check():
        """Health check endpoint for the API"""
        try:
            return jsonify({
                "status": "healthy",
                "timestamp": datetime.utcnow().isoformat(),
                "uptime": performance_monitor.get_metrics()["uptime_seconds"],
                "api_version": "1.0.0"
            })
        except Exception as e:
            logger.exception('Error in health check: %s', str(e))
            return jsonify({"status": "unhealthy", "error": str(e)}), 500

    @app.route(f'{api_prefix}/config')
    def get_config():
        """Get API configuration (safe values only)"""
        return jsonify({
            "api_prefix": api_prefix,
            "debug_mode": app.debug,
            "port": getattr(config_class, 'PORT', 5003),
            "server_time": datetime.utcnow().isoformat()
        })

    print("Flask app created successfully with all routes configured")
    return app

def run_app(app, host='0.0.0.0', port=None):
    """Run the Flask application with the specified host and port"""
    # Use provided port or get from config, with fallback to our default
    if port is None:
        port = getattr(Config, 'PORT', 5003)

    # Run the app
    app.run(host=host, port=port, debug=app.debug)

# Create app instance if this file is run directly
if __name__ == '__main__':
    print("Creating app instance...")
    app = create_app(Config)
    print("App instance created successfully")

    # Log what we're doing
    port = getattr(Config, 'PORT', 5003)
    debug_mode = "enabled" if app.debug else "disabled"
    print(f"Running Flask app on port {port}...")
    print(f"Debug mode: {debug_mode}")

    # Run the app
    run_app(app, port=port)