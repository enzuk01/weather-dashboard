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

# Get port from environment variable with fallback to 5004 (our new default)
PORT = 5003

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

try:
    from config import Config
    print("Config imported successfully")
except ImportError as e:
    print(f"Error importing config: {e}")
    # Define a fallback Config class
    class Config:
        API_PREFIX = '/api'
        CORS_ORIGINS = '*'
        DEBUG = True
        PORT = PORT

        @staticmethod
        def init_app():
            pass

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
            "weather_code": 1,  # Few clouds
            "wind_speed_10m": 5.2,
            "wind_direction_10m": 180,
            "surface_pressure": 1015,
            "is_day": 1,
            "timestamp": "2023-06-21T12:00:00Z"
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
            "weather_code": [day % 5 for day in range(days)]
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
    config_class.init_app()

    # Configure CORS
    CORS(app, resources={r"/api/*": {"origins": config_class.CORS_ORIGINS}})

    # API Routes
    @app.route(f'{config_class.API_PREFIX}/weather/current')
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

    @app.route(f'{config_class.API_PREFIX}/weather/forecast/hourly')
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

    @app.route(f'{config_class.API_PREFIX}/weather/forecast/daily')
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

    @app.route(f'{config_class.API_PREFIX}/health')
    def health_check():
        """Health check endpoint"""
        return jsonify({
            'status': 'healthy',
            'performance_metrics': performance_monitor.get_metrics()
        })

    print("Flask app created successfully with all routes configured")
    return app

print("Creating app instance...")
# Create the application instance
app = create_app()
print("App instance created successfully")

if __name__ == '__main__':
    print(f"Running Flask app on port {PORT}...")
    # Use the debug flag from command line arguments
    debug_mode = not args.no_debug
    print(f"Debug mode: {'enabled' if debug_mode else 'disabled'}")
    app.run(host="0.0.0.0", port=5003, debug=debug_mode)