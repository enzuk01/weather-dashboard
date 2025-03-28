from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

@app.route('/api/health')
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/api/current-weather', methods=['GET'])
def get_current_weather():
    try:
        latitude = request.args.get('latitude', type=float)
        longitude = request.args.get('longitude', type=float)

        if latitude is None or longitude is None:
            return jsonify({'error': 'Latitude and longitude are required'}), 400

        # Fetch current weather data from Open-Meteo API
        response = requests.get(
            'https://api.open-meteo.com/v1/forecast',
            params={
                'latitude': latitude,
                'longitude': longitude,
                'current': ['temperature_2m', 'relative_humidity_2m', 'precipitation',
                          'weather_code', 'wind_speed_10m', 'wind_direction_10m',
                          'is_day'],
                'timezone': 'auto'
            }
        )

        if response.status_code != 200:
            return jsonify({'error': 'Failed to fetch weather data'}), 500

        data = response.json()
        return jsonify(data['current'])

    except Exception as e:
        app.logger.error(f'Error in get_current_weather: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/hourly-forecast', methods=['GET'])
def get_hourly_forecast():
    try:
        latitude = request.args.get('latitude', type=float)
        longitude = request.args.get('longitude', type=float)
        hours = request.args.get('hours', default=24, type=int)

        if latitude is None or longitude is None:
            return jsonify({'error': 'Latitude and longitude are required'}), 400

        # Fetch hourly forecast data from Open-Meteo API
        response = requests.get(
            'https://api.open-meteo.com/v1/forecast',
            params={
                'latitude': latitude,
                'longitude': longitude,
                'hourly': ['temperature_2m', 'precipitation_probability', 'precipitation',
                          'weather_code', 'wind_speed_10m', 'wind_direction_10m',
                          'is_day', 'relative_humidity_2m'],
                'forecast_days': (hours + 23) // 24,  # Convert hours to days, rounding up
                'timezone': 'auto'
            }
        )

        if response.status_code != 200:
            return jsonify({'error': 'Failed to fetch weather data'}), 500

        data = response.json()
        hourly_data = data['hourly']

        # Limit the data to the requested number of hours
        return jsonify({
            'timestamps': hourly_data['time'][:hours],
            'temperature_2m': hourly_data['temperature_2m'][:hours],
            'precipitation_probability': hourly_data['precipitation_probability'][:hours],
            'precipitation': hourly_data['precipitation'][:hours],
            'weather_code': hourly_data['weather_code'][:hours],
            'wind_speed_10m': hourly_data['wind_speed_10m'][:hours],
            'wind_direction_10m': hourly_data['wind_direction_10m'][:hours],
            'is_day': hourly_data['is_day'][:hours],
            'relative_humidity_2m': hourly_data['relative_humidity_2m'][:hours]
        })

    except Exception as e:
        app.logger.error(f'Error in get_hourly_forecast: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/daily-forecast', methods=['GET'])
def get_daily_forecast():
    try:
        latitude = request.args.get('latitude', type=float)
        longitude = request.args.get('longitude', type=float)
        days = request.args.get('days', default=7, type=int)

        if latitude is None or longitude is None:
            return jsonify({'error': 'Latitude and longitude are required'}), 400

        # Fetch daily forecast data from Open-Meteo API
        response = requests.get(
            'https://api.open-meteo.com/v1/forecast',
            params={
                'latitude': latitude,
                'longitude': longitude,
                'daily': ['temperature_2m_max', 'temperature_2m_min', 'precipitation_sum',
                         'precipitation_probability_max', 'wind_speed_10m_max',
                         'wind_direction_10m_dominant', 'weather_code', 'sunrise', 'sunset'],
                'timezone': 'auto',
                'forecast_days': days
            }
        )

        if response.status_code != 200:
            return jsonify({'error': 'Failed to fetch weather data'}), 500

        data = response.json()
        return jsonify(data['daily'])

    except Exception as e:
        app.logger.error(f'Error in get_daily_forecast: {str(e)}')
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003)