#!/usr/bin/env python3
"""
Simple HTTP Proxy Server
This script runs a proxy server that forwards requests from port 5004 to port 5003.
This allows the frontend to connect to port 5004 while the Flask server runs on port 5003.
"""

import sys
import logging
import http.server
import socketserver
import urllib.request
from urllib.error import URLError, HTTPError
from http.client import HTTPResponse
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Configuration
LISTEN_PORT = 5004  # Port we listen on
TARGET_PORT = 5003  # Port we forward to
HOST = "localhost"

class ProxyHTTPRequestHandler(http.server.BaseHTTPRequestHandler):
    """HTTP request handler that forwards requests to the target server"""

    def do_ALL(self):
        """Handle all HTTP methods by forwarding them to the target"""
        try:
            # Log the request
            logger.info(f"Received {self.command} request for {self.path}")

            # Construct target URL
            target_url = f"http://{HOST}:{TARGET_PORT}{self.path}"

            # Create a request to the target server
            req = urllib.request.Request(
                target_url,
                data=self.rfile.read(int(self.headers.get('Content-Length', 0))),
                headers=dict(self.headers),
                method=self.command
            )

            try:
                # Send the request to the target server
                with urllib.request.urlopen(req, timeout=10) as response:
                    # Set response status code
                    self.send_response(response.getcode())

                    # Set response headers
                    for header in response.getheaders():
                        if header[0].lower() != 'transfer-encoding':  # Skip chunked encoding
                            self.send_header(header[0], header[1])
                    self.end_headers()

                    # Send response body
                    self.wfile.write(response.read())

                logger.info(f"Successfully proxied {self.command} request to {target_url}")

            except HTTPError as e:
                # Handle HTTP errors from the target server
                self.send_response(e.code)
                for header in e.headers:
                    self.send_header(header, e.headers[header])
                self.end_headers()
                self.wfile.write(e.read())
                logger.warning(f"Target server returned HTTP error: {e.code} for {target_url}")

            except URLError as e:
                # Handle connection errors to the target server
                self.send_response(502)  # Bad Gateway
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(f"Error connecting to target server: {e.reason}".encode('utf-8'))
                logger.error(f"Error connecting to target server: {e.reason}")

        except Exception as e:
            # Handle any other exceptions
            self.send_response(500)  # Internal Server Error
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(f"Internal proxy error: {str(e)}".encode('utf-8'))
            logger.error(f"Proxy error: {str(e)}", exc_info=True)

    # Define all the HTTP methods we want to support
    def do_GET(self): self.do_ALL()
    def do_POST(self): self.do_ALL()
    def do_PUT(self): self.do_ALL()
    def do_DELETE(self): self.do_ALL()
    def do_HEAD(self): self.do_ALL()
    def do_OPTIONS(self): self.do_ALL()
    def do_PATCH(self): self.do_ALL()

def wait_for_target_server(retries=30, delay=1):
    """Wait for the target server to be available"""
    logger.info(f"Waiting for target server at http://{HOST}:{TARGET_PORT}...")

    for i in range(retries):
        try:
            with urllib.request.urlopen(f"http://{HOST}:{TARGET_PORT}/api/health", timeout=1) as response:
                if response.getcode() == 200:
                    logger.info(f"Target server is ready (attempt {i+1}/{retries})")
                    return True
        except Exception:
            logger.info(f"Target server not ready yet (attempt {i+1}/{retries})")

        time.sleep(delay)

    logger.warning(f"Target server not available after {retries} attempts")
    return False

def run_server():
    """Run the proxy server"""
    try:
        # Create the server
        with socketserver.TCPServer(("", LISTEN_PORT), ProxyHTTPRequestHandler) as httpd:
            logger.info(f"Proxy server started on port {LISTEN_PORT}, forwarding to {HOST}:{TARGET_PORT}")

            # Run the server until interrupted
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                logger.info("Server stopped by user")
            finally:
                httpd.server_close()
                logger.info("Server closed")

    except OSError as e:
        if e.errno == 48:  # Address already in use
            logger.error(f"Port {LISTEN_PORT} is already in use. Cannot start proxy server.")
        else:
            logger.error(f"Error starting server: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    logger.info(f"Starting proxy server from port {LISTEN_PORT} to {HOST}:{TARGET_PORT}")

    # Wait for the target server
    if wait_for_target_server():
        # Run the proxy server
        run_server()
    else:
        logger.error("Target server not available. Exiting.")
        sys.exit(1)