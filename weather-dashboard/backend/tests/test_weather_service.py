"""
Unit tests for the weather service module
"""

import unittest
import math
import sys
import os

# Add parent directory to path to allow imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from weather_service import calculate_feels_like_temperature

class TestWeatherService(unittest.TestCase):
    """Test cases for weather service functions"""

    def test_feels_like_temperature_cold(self):
        """Test feels like temperature calculation for cold weather"""
        # Test wind chill when cold with significant wind
        temp = 5  # 5°C
        humidity = 60  # 60%
        wind_speed = 20  # 20 km/h

        feels_like = calculate_feels_like_temperature(temp, humidity, wind_speed)

        # Wind chill should make it feel colder
        self.assertLess(feels_like, temp)
        self.assertAlmostEqual(feels_like, 3.88, places=1)

        # With no wind, should feel close to actual temperature
        no_wind = calculate_feels_like_temperature(temp, humidity, 0)
        self.assertAlmostEqual(no_wind, temp, places=1)

    def test_feels_like_temperature_hot(self):
        """Test feels like temperature calculation for hot weather"""
        # Test heat index when hot and humid
        temp = 30  # 30°C
        humidity = 80  # 80%
        wind_speed = 5  # 5 km/h

        feels_like = calculate_feels_like_temperature(temp, humidity, wind_speed)

        # High humidity should make it feel hotter
        self.assertGreater(feels_like, temp)
        self.assertGreater(feels_like, 35)  # Should feel significantly hotter

        # Test with low humidity
        low_humidity = calculate_feels_like_temperature(temp, 20, wind_speed)
        self.assertLess(low_humidity, feels_like)  # Should feel less hot with lower humidity

    def test_feels_like_temperature_moderate(self):
        """Test feels like temperature calculation for moderate weather"""
        # Test moderate temperatures
        temp = 18  # 18°C
        humidity = 50  # 50%
        wind_speed = 10  # 10 km/h

        feels_like = calculate_feels_like_temperature(temp, humidity, wind_speed)

        # Should be within a few degrees of actual temperature
        self.assertAlmostEqual(feels_like, temp, delta=3)

        # Higher wind should feel cooler
        high_wind = calculate_feels_like_temperature(temp, humidity, 30)
        self.assertLess(high_wind, feels_like)

if __name__ == '__main__':
    unittest.main()