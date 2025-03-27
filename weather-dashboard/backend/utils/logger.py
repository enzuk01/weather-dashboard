import logging
import sys
import time
import tracemalloc
import psutil
import os
from datetime import datetime
from functools import wraps
from typing import Optional, Dict, Any, Callable
from logging.handlers import RotatingFileHandler
from flask import request

# Configure logging
LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
LOG_LEVEL = logging.DEBUG if os.getenv('FLASK_ENV') == 'development' else logging.INFO
LOG_FILE = 'logs/weather_dashboard.log'
MAX_LOG_SIZE = 10 * 1024 * 1024  # 10MB
BACKUP_COUNT = 5

# Ensure logs directory exists
os.makedirs('logs', exist_ok=True)

# Configure the root logger
logging.basicConfig(
    level=LOG_LEVEL,
    format=LOG_FORMAT,
    handlers=[
        RotatingFileHandler(
            LOG_FILE,
            maxBytes=MAX_LOG_SIZE,
            backupCount=BACKUP_COUNT
        ),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger('weather_dashboard')

# Start memory tracking
tracemalloc.start()

class PerformanceMonitor:
    def __init__(self):
        self.metrics: Dict[str, Dict[str, float]] = {}
        self.process = psutil.Process()

    def start_metric(self, name: str) -> float:
        """Start timing a metric"""
        return time.time()

    def end_metric(self, name: str, start_time: float) -> None:
        """End timing a metric and store the result"""
        duration = time.time() - start_time
        if name not in self.metrics:
            self.metrics[name] = {'count': 0, 'total_time': 0, 'min': float('inf'), 'max': 0}

        self.metrics[name]['count'] += 1
        self.metrics[name]['total_time'] += duration
        self.metrics[name]['min'] = min(self.metrics[name]['min'], duration)
        self.metrics[name]['max'] = max(self.metrics[name]['max'], duration)

    def get_metrics(self) -> Dict[str, Dict[str, float]]:
        """Get all performance metrics"""
        result = {}
        for name, data in self.metrics.items():
            result[name] = {
                'count': data['count'],
                'avg_time': data['total_time'] / data['count'] if data['count'] > 0 else 0,
                'min_time': data['min'] if data['min'] != float('inf') else 0,
                'max_time': data['max']
            }
        return result

    def log_memory_usage(self) -> None:
        """Log current memory usage"""
        current, peak = tracemalloc.get_traced_memory()
        cpu_percent = self.process.cpu_percent()
        memory_info = self.process.memory_info()

        logger.info(
            'Memory usage - Current: %.1f MB, Peak: %.1f MB, CPU: %.1f%%, RSS: %.1f MB',
            current / 10**6,
            peak / 10**6,
            cpu_percent,
            memory_info.rss / 10**6
        )

# Create a global performance monitor instance
performance_monitor = PerformanceMonitor()

def log_performance(func: Callable) -> Callable:
    """Decorator to log function performance"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = performance_monitor.start_metric(func.__name__)
        try:
            result = func(*args, **kwargs)
            performance_monitor.end_metric(func.__name__, start_time)
            return result
        except Exception as e:
            logger.exception(f'Error in {func.__name__}: {str(e)}')
            raise
    return wrapper

def log_api_request(func: Callable) -> Callable:
    """Decorator to log API requests"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        request_time = datetime.now()
        try:
            result = func(*args, **kwargs)
            logger.info(
                'API Request - %s %s - Status: %s - Duration: %.2fms',
                func.__name__,
                kwargs.get('params', {}),
                getattr(result, 'status_code', 'N/A'),
                (datetime.now() - request_time).total_seconds() * 1000
            )
            return result
        except Exception as e:
            logger.exception(
                'API Error - %s %s - Error: %s',
                func.__name__,
                kwargs.get('params', {}),
                str(e)
            )
            raise
    return wrapper

def log_error(error: Exception, context: Optional[Dict[str, Any]] = None) -> None:
    """Log an error with context"""
    error_data = {
        'error': str(error),
        'type': error.__class__.__name__,
        'timestamp': datetime.utcnow().isoformat(),
        'traceback': traceback.format_exc()
    }
    if context:
        error_data.update(context)
    logger.error('Application error', extra=error_data)

def setup_error_logging(app):
    """Set up error logging for a Flask app"""
    @app.errorhandler(Exception)
    def handle_exception(e):
        log_error(e, {
            'url': request.url,
            'method': request.method,
            'headers': dict(request.headers),
            'data': request.get_data(as_text=True)
        })
        return {'error': str(e)}, 500

def start_memory_logging():
    """Start periodic memory usage logging"""
    def log_memory():
        performance_monitor.log_memory_usage()
        # Schedule next log in 5 minutes
        time.sleep(300)

    import threading
    thread = threading.Thread(target=log_memory, daemon=True)
    thread.start()