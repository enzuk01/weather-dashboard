from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import date, datetime, timedelta
from typing import List, Optional
import time
from weather_service import (
    fetch_current_weather,
    fetch_hourly_forecast,
    fetch_historical_weather
)

app = FastAPI(title="Weather Dashboard API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/api/current-weather")
async def get_current_weather(
    latitude: float = Query(..., description="Latitude of the location"),
    longitude: float = Query(..., description="Longitude of the location")
):
    try:
        weather_data = fetch_current_weather(latitude, longitude)
        return weather_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching current weather: {str(e)}")

@app.get("/api/hourly-forecast")
async def get_hourly_forecast(
    latitude: float = Query(..., description="Latitude of the location"),
    longitude: float = Query(..., description="Longitude of the location"),
    hours: int = Query(24, description="Number of hours to forecast (max 48)")
):
    if hours > 48:
        hours = 48  # Cap at 48 hours

    try:
        forecast_data = fetch_hourly_forecast(latitude, longitude, hours)
        return forecast_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching hourly forecast: {str(e)}")

@app.get("/api/historical-weather")
async def get_historical_weather(
    latitude: float = Query(..., description="Latitude of the location"),
    longitude: float = Query(..., description="Longitude of the location"),
    start_date: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: date = Query(..., description="End date (YYYY-MM-DD)"),
):
    # Validate date range
    today = date.today()

    if start_date > today:
        raise HTTPException(status_code=400, detail="Start date cannot be in the future")

    if end_date > today:
        end_date = today

    if (end_date - start_date).days > 30:
        raise HTTPException(status_code=400, detail="Date range cannot exceed 30 days")

    try:
        historical_data = fetch_historical_weather(latitude, longitude, start_date, end_date)
        return historical_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching historical weather: {str(e)}")

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "1.0.0"
    }