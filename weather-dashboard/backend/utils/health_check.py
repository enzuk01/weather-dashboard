"""
Health check utilities for the Weather Dashboard backend
"""

import os
import psutil
import time
from datetime import datetime
import requests
from typing import Dict, Any

def check_system_resources() -> Dict[str, Any]:
    """Check system resource usage"""
    process = psutil.Process(os.getpid())
    memory_info = process.memory_info()

    return {
        "cpu_percent": process.cpu_percent(),
        "memory_usage": {
            "rss": memory_info.rss / 1024 / 1024,  # Convert to MB
            "vms": memory_info.vms / 1024 / 1024,  # Convert to MB
        },
        "threads": process.num_threads(),
        "open_files": len(process.open_files()),
    }

def check_api_health() -> Dict[str, Any]:
    """Check Open-Meteo API health"""
    try:
        start_time = time.time()
        response = requests.get("https://api.open-meteo.com/v1/forecast?latitude=0&longitude=0")
        response_time = time.time() - start_time

        return {
            "status": "healthy" if response.status_code == 200 else "unhealthy",
            "response_time": round(response_time * 1000, 2),  # Convert to ms
            "status_code": response.status_code
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "status_code": None
        }

def get_uptime(start_time: float) -> float:
    """Calculate application uptime in seconds"""
    return time.time() - start_time

def check_disk_usage() -> Dict[str, Any]:
    """Check disk usage for logs directory"""
    disk = psutil.disk_usage(os.path.dirname(os.path.dirname(__file__)))
    return {
        "total": disk.total / (1024 * 1024 * 1024),  # Convert to GB
        "used": disk.used / (1024 * 1024 * 1024),
        "free": disk.free / (1024 * 1024 * 1024),
        "percent": disk.percent
    }

def get_health_status(start_time: float) -> Dict[str, Any]:
    """Get complete health status"""
    system_resources = check_system_resources()
    api_health = check_api_health()
    disk_usage = check_disk_usage()

    status = "healthy"
    if (system_resources["cpu_percent"] > 90 or
        system_resources["memory_usage"]["rss"] > 1024 or  # More than 1GB
        api_health["status"] == "unhealthy" or
        disk_usage["percent"] > 90):
        status = "unhealthy"

    return {
        "status": status,
        "timestamp": datetime.utcnow().isoformat(),
        "uptime": get_uptime(start_time),
        "system_resources": system_resources,
        "api_health": api_health,
        "disk_usage": disk_usage
    }