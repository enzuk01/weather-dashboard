"""
Configuration validator for the Weather Dashboard backend
"""

import os
from typing import Dict, Any, List
from dotenv import load_dotenv

class ConfigError(Exception):
    """Custom exception for configuration errors"""
    pass

def validate_port(port: str) -> int:
    """Validate port number"""
    try:
        port_num = int(port)
        if not (1 <= port_num <= 65535):
            raise ConfigError(f"Port must be between 1 and 65535, got {port_num}")
        return port_num
    except ValueError:
        raise ConfigError(f"Invalid port number: {port}")

def validate_boolean(value: str) -> bool:
    """Validate boolean value"""
    if value.lower() in ('true', '1', 'yes'):
        return True
    if value.lower() in ('false', '0', 'no'):
        return False
    raise ConfigError(f"Invalid boolean value: {value}")

def validate_integer(value: str, min_val: int = None, max_val: int = None) -> int:
    """Validate integer value with optional range"""
    try:
        num = int(value)
        if min_val is not None and num < min_val:
            raise ConfigError(f"Value must be >= {min_val}, got {num}")
        if max_val is not None and num > max_val:
            raise ConfigError(f"Value must be <= {max_val}, got {num}")
        return num
    except ValueError:
        raise ConfigError(f"Invalid integer value: {value}")

def validate_url(url: str) -> str:
    """Validate URL format"""
    if not url.startswith(('http://', 'https://')):
        raise ConfigError(f"Invalid URL format: {url}")
    return url

def validate_log_level(level: str) -> str:
    """Validate logging level"""
    valid_levels = {'DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'}
    if level.upper() not in valid_levels:
        raise ConfigError(f"Invalid log level: {level}. Must be one of {valid_levels}")
    return level.upper()

def validate_config() -> Dict[str, Any]:
    """Validate all configuration values"""
    # Load environment variables
    load_dotenv()

    config = {}

    # Server Configuration
    config['PORT'] = validate_port(os.getenv('PORT', '5001'))
    config['HOST'] = os.getenv('HOST', '0.0.0.0')
    config['DEBUG'] = validate_boolean(os.getenv('DEBUG', 'false'))

    # API Configuration
    config['API_TIMEOUT'] = validate_integer(os.getenv('API_TIMEOUT', '30'), min_val=1, max_val=300)
    config['ENABLE_CACHE'] = validate_boolean(os.getenv('ENABLE_CACHE', 'true'))
    config['CACHE_EXPIRY'] = validate_integer(os.getenv('CACHE_EXPIRY', '3600'), min_val=1)

    # Logging Configuration
    config['LOG_LEVEL'] = validate_log_level(os.getenv('LOG_LEVEL', 'INFO'))
    config['LOG_FORMAT'] = os.getenv('LOG_FORMAT', 'json')
    config['LOG_FILE'] = os.getenv('LOG_FILE', 'logs/backend.log')
    config['MAX_LOG_SIZE'] = validate_integer(os.getenv('MAX_LOG_SIZE', '10485760'), min_val=1024)
    config['BACKUP_COUNT'] = validate_integer(os.getenv('BACKUP_COUNT', '5'), min_val=1, max_val=10)

    # Performance Monitoring
    config['ENABLE_METRICS'] = validate_boolean(os.getenv('ENABLE_METRICS', 'true'))
    config['METRICS_INTERVAL'] = validate_integer(os.getenv('METRICS_INTERVAL', '300'), min_val=60)
    config['MEMORY_WARNING_THRESHOLD'] = validate_integer(os.getenv('MEMORY_WARNING_THRESHOLD', '1024'), min_val=256)
    config['CPU_WARNING_THRESHOLD'] = validate_integer(os.getenv('CPU_WARNING_THRESHOLD', '80'), min_val=1, max_val=100)

    # Security
    config['CORS_ORIGINS'] = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
    config['RATE_LIMIT'] = validate_integer(os.getenv('RATE_LIMIT', '100'), min_val=1)
    config['RATE_LIMIT_WINDOW'] = validate_integer(os.getenv('RATE_LIMIT_WINDOW', '60'), min_val=1)

    # Weather API Configuration
    config['WEATHER_API_URL'] = validate_url(os.getenv('WEATHER_API_URL', 'https://api.open-meteo.com/v1'))
    config['WEATHER_API_TIMEOUT'] = validate_integer(os.getenv('WEATHER_API_TIMEOUT', '10'), min_val=1, max_val=60)
    config['MAX_RETRIES'] = validate_integer(os.getenv('MAX_RETRIES', '3'), min_val=0, max_val=5)
    config['RETRY_DELAY'] = validate_integer(os.getenv('RETRY_DELAY', '1'), min_val=0, max_val=10)

    return config

def get_config() -> Dict[str, Any]:
    """Get validated configuration"""
    try:
        return validate_config()
    except ConfigError as e:
        print(f"Configuration error: {e}")
        raise