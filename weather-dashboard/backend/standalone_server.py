#!/usr/bin/env python3
"""
Standalone Flask server for Weather Dashboard
This script runs the Flask app directly with port 5004, bypassing any environment settings.
"""

import os
import sys
import time
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Hardcoded port - this is deliberate to avoid environment variables
PORT = 5004
HOST = '0.0.0.0'

# Add the current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

def start_server():
    """Start the Flask server on the specified port"""
    try:
        # Import the app - this is done inside the function to catch import errors
        from app import app
        logger.info(f"Starting Flask app on {HOST}:{PORT}")
        app.run(host=HOST, port=PORT, debug=False, use_reloader=False)
    except ImportError as e:
        logger.error(f"Failed to import Flask app: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    logger.info(f"Standalone server starting at {datetime.now().isoformat()}")
    logger.info(f"Using Python {sys.version}")
    logger.info(f"Server will be available at http://{HOST}:{PORT}")

    # Wait a moment to ensure sockets are released
    time.sleep(1)

    # Start the server
    start_server()