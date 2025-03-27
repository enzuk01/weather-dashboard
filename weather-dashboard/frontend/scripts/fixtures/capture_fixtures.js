const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:5003';

async function captureResponse(endpoint, filename) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        const data = await response.json();

        const fullPath = path.join(__dirname, filename);
        console.log(`Attempting to save to: ${fullPath}`);

        try {
            fs.writeFileSync(
                fullPath,
                JSON.stringify(data, null, 2)
            );
            console.log(`Successfully captured ${filename}`);
        } catch (writeError) {
            console.error(`Error writing ${filename}:`, writeError);
            console.log('Current directory:', __dirname);
            console.log('File path:', fullPath);
        }
    } catch (error) {
        console.error(`Error capturing ${filename}:`, error);
    }
}

async function captureAllFixtures() {
    // Current weather
    await captureResponse(
        '/weather/current?lat=40.7128&lon=-74.006',
        'current_weather.json'
    );

    // Hourly forecast
    await captureResponse(
        '/weather/forecast/hourly?lat=40.7128&lon=-74.006&hours=24',
        'hourly_forecast.json'
    );

    // Weather codes
    await captureResponse(
        '/weather/codes',
        'weather_codes.json'
    );
}

// Ensure the directory exists
const fixturesDir = __dirname;
console.log('Fixtures directory:', fixturesDir);
try {
    fs.mkdirSync(fixturesDir, { recursive: true });
    console.log('Fixtures directory created/verified');
} catch (err) {
    console.error('Error creating fixtures directory:', err);
}

captureAllFixtures();