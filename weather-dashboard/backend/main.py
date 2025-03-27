"""
Main Flask application for the Weather Dashboard backend
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import json
from weather_service import get_current_weather, get_hourly_forecast, get_daily_forecast
from dotenv import load_dotenv
import traceback
from utils.logger import setup_error_logging, start_memory_logging, logger, performance_monitor

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Set up error logging and memory monitoring
setup_error_logging(app)
start_memory_logging()

# Path to favorites JSON file
FAVORITES_FILE = os.path.join(os.path.dirname(__file__), 'data', 'favorites.json')

# Ensure data directory exists
os.makedirs(os.path.dirname(FAVORITES_FILE), exist_ok=True)

# Weather code descriptions
WEATHER_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
}

@app.before_request
def before_request():
    # Log request details
    logger.info(
        'Request received - %s %s',
        request.method,
        request.path,
        extra={
            'query_params': dict(request.args),
            'headers': dict(request.headers),
            'remote_addr': request.remote_addr
        }
    )

@app.after_request
def after_request(response):
    # Log response details
    logger.info(
        'Response sent - Status: %s, Size: %s bytes',
        response.status_code,
        response.content_length,
        extra={
            'path': request.path,
            'method': request.method
        }
    )
    return response

@app.route('/weather/current', methods=['GET'])
def current_weather():
    """Get current weather for a location"""
    try:
        lat = float(request.args.get('lat', 0))
        lon = float(request.args.get('lon', 0))

        logger.debug('Fetching current weather', extra={
            'latitude': lat,
            'longitude': lon
        })

        weather_data = get_current_weather(lat, lon)
        return jsonify(weather_data)
    except Exception as e:
        logger.exception('Error fetching current weather: %s', str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/weather/forecast/hourly', methods=['GET'])
def hourly_forecast():
    """Get hourly forecast for a location"""
    try:
        lat = float(request.args.get('lat', 0))
        lon = float(request.args.get('lon', 0))
        hours = int(request.args.get('hours', 24))

        logger.debug('Fetching hourly forecast', extra={
            'latitude': lat,
            'longitude': lon,
            'hours': hours
        })

        forecast_data = get_hourly_forecast(lat, lon, hours)
        return jsonify(forecast_data)
    except Exception as e:
        logger.exception('Error fetching hourly forecast: %s', str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/weather/forecast/daily', methods=['GET'])
def daily_forecast():
    """Get daily forecast for a location"""
    try:
        lat = float(request.args.get('lat', 0))
        lon = float(request.args.get('lon', 0))
        days = int(request.args.get('days', 7))

        logger.debug('Fetching daily forecast', extra={
            'latitude': lat,
            'longitude': lon,
            'days': days
        })

        forecast_data = get_daily_forecast(lat, lon, days)
        return jsonify(forecast_data)
    except Exception as e:
        logger.exception('Error fetching daily forecast: %s', str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/weather/codes', methods=['GET'])
def weather_codes():
    """Get weather code descriptions"""
    return jsonify(WEATHER_CODES)

@app.route('/favorites', methods=['GET'])
def get_favorites():
    """Get all favorite locations"""
    try:
        if os.path.exists(FAVORITES_FILE):
            with open(FAVORITES_FILE, 'r') as f:
                favorites = json.load(f)
        else:
            favorites = []
        return jsonify(favorites)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/favorites', methods=['POST'])
def add_favorite():
    """Add a new favorite location"""
    try:
        data = request.get_json()

        # Validate required fields
        if not data or 'name' not in data or 'latitude' not in data or 'longitude' not in data:
            return jsonify({"error": "Missing required fields: name, latitude, longitude"}), 400

        new_favorite = {
            "name": data['name'],
            "latitude": data['latitude'],
            "longitude": data['longitude']
        }

        # Load existing favorites
        favorites = []
        if os.path.exists(FAVORITES_FILE):
            with open(FAVORITES_FILE, 'r') as f:
                favorites = json.load(f)

        # Check if location already exists
        for fav in favorites:
            if (fav['latitude'] == new_favorite['latitude'] and
                fav['longitude'] == new_favorite['longitude']):
                return jsonify({"error": "Location already in favorites"}), 409

        # Add new favorite
        favorites.append(new_favorite)

        # Save updated favorites
        with open(FAVORITES_FILE, 'w') as f:
            json.dump(favorites, f, indent=2)

        return jsonify(new_favorite), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/favorites/<int:index>', methods=['DELETE'])
def delete_favorite(index):
    """Delete a favorite location by index"""
    try:
        # Load existing favorites
        if not os.path.exists(FAVORITES_FILE):
            return jsonify({"error": "No favorites exist"}), 404

        with open(FAVORITES_FILE, 'r') as f:
            favorites = json.load(f)

        # Check if index is valid
        if index < 0 or index >= len(favorites):
            return jsonify({"error": "Invalid favorite index"}), 404

        # Remove the favorite
        deleted = favorites.pop(index)

        # Save updated favorites
        with open(FAVORITES_FILE, 'w') as f:
            json.dump(favorites, f, indent=2)

        return jsonify({"message": f"Deleted favorite: {deleted['name']}"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint that also returns performance metrics"""
    metrics = performance_monitor.get_metrics()
    return jsonify({
        'status': 'healthy',
        'performance_metrics': metrics
    })

@app.errorhandler(404)
def not_found_error(error):
    logger.warning('404 error: %s', request.url)
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error('500 error: %s\n%s', str(error), traceback.format_exc())
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Create logs directory if it doesn't exist
    os.makedirs('logs', exist_ok=True)

    # Start the server
    port = int(os.getenv('BACKEND_PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)