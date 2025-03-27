"""
Integration tests for the API endpoints
"""

import unittest
import json
import os
import sys
import tempfile

# Add parent directory to path to allow imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import main

class TestFavoritesAPI(unittest.TestCase):
    """Test cases for the favorites API endpoints"""

    def setUp(self):
        """Set up test client and temporary favorites file"""
        self.app = main.app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

        # Create a temp file for favorites
        self.temp_dir = tempfile.TemporaryDirectory()
        self.temp_file = os.path.join(self.temp_dir.name, 'favorites.json')
        main.FAVORITES_FILE = self.temp_file

        # Ensure the directory exists
        os.makedirs(os.path.dirname(self.temp_file), exist_ok=True)

        # Initialize with empty favorites
        with open(self.temp_file, 'w') as f:
            json.dump([], f)

    def tearDown(self):
        """Clean up temp files"""
        self.temp_dir.cleanup()

    def test_get_favorites_empty(self):
        """Test getting favorites when none exist"""
        response = self.client.get('/favorites')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, [])

    def test_add_favorite(self):
        """Test adding a favorite location"""
        # Test data
        test_favorite = {
            'name': 'Test City',
            'latitude': 35.6895,
            'longitude': 139.6917
        }

        # Add the favorite
        response = self.client.post('/favorites',
                                   json=test_favorite,
                                   content_type='application/json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json['name'], test_favorite['name'])

        # Verify it was added by getting all favorites
        get_response = self.client.get('/favorites')
        self.assertEqual(len(get_response.json), 1)
        self.assertEqual(get_response.json[0]['name'], test_favorite['name'])

    def test_delete_favorite(self):
        """Test deleting a favorite location"""
        # First add a favorite
        test_favorite = {
            'name': 'Test City',
            'latitude': 35.6895,
            'longitude': 139.6917
        }

        self.client.post('/favorites',
                        json=test_favorite,
                        content_type='application/json')

        # Now delete it
        response = self.client.delete('/favorites/0')
        self.assertEqual(response.status_code, 200)

        # Verify it was deleted
        get_response = self.client.get('/favorites')
        self.assertEqual(len(get_response.json), 0)

    def test_duplicate_favorite(self):
        """Test that adding a duplicate location returns an error"""
        # Add a favorite
        test_favorite = {
            'name': 'Test City',
            'latitude': 35.6895,
            'longitude': 139.6917
        }

        self.client.post('/favorites',
                        json=test_favorite,
                        content_type='application/json')

        # Try to add the same location again
        duplicate_response = self.client.post('/favorites',
                                             json=test_favorite,
                                             content_type='application/json')

        self.assertEqual(duplicate_response.status_code, 409)  # Conflict status code

if __name__ == '__main__':
    unittest.main()