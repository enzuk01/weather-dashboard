#!/bin/bash

# Color definitions
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo "Checking API configuration consistency..."

# Get current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Navigate to project root
cd "$PROJECT_DIR" || { echo "Failed to navigate to project directory"; exit 1; }

ERRORS=0

# Check frontend package.json for required dependencies
if [ -f "frontend/package.json" ]; then
    echo "Checking frontend/package.json for required dependencies..."

    # Check for TypeScript
    if grep -q '"typescript":' "frontend/package.json"; then
        echo -e "${GREEN}✓ TypeScript dependency exists${NC}"
    else
        echo -e "${RED}✗ TypeScript dependency is missing${NC}"
        ERRORS=$((ERRORS+1))
    fi

    # Check for other critical dependencies
    CRITICAL_DEPS=("react" "react-dom" "react-scripts")
    for dep in "${CRITICAL_DEPS[@]}"; do
        if grep -q "\"${dep}\":" "frontend/package.json"; then
            echo -e "${GREEN}✓ Critical dependency ${dep} exists${NC}"
        else
            echo -e "${RED}✗ Critical dependency ${dep} is missing${NC}"
            ERRORS=$((ERRORS+1))
        fi
    done
else
    echo -e "${RED}✗ frontend/package.json not found${NC}"
    ERRORS=$((ERRORS+1))
fi

# Check frontend API configuration
if [ -f "frontend/src/config/api.ts" ]; then
    echo "Checking frontend/src/config/api.ts..."

    # Check export naming (should be API, not API_CONFIG)
    if grep -q "export const API" "frontend/src/config/api.ts"; then
        echo -e "${GREEN}✓ API export naming is correct${NC}"
    else
        echo -e "${RED}✗ API export naming is incorrect. Should export as 'export const API'${NC}"
        ERRORS=$((ERRORS+1))
    fi

    # Check for correct port in API configuration
    if grep -q "PORT: 5003" "frontend/src/config/api.ts" || grep -q "port: 5003" "frontend/src/config/api.ts"; then
        echo -e "${GREEN}✓ Backend port correctly set to 5003${NC}"
    else
        echo -e "${RED}✗ Backend port may not be correctly set to 5003${NC}"
        ERRORS=$((ERRORS+1))
    fi

    # Check for required API properties
    for prop in "CACHE_TTL" "ENDPOINTS" "TIMEOUT"; do
        if grep -q "${prop}:" "frontend/src/config/api.ts"; then
            echo -e "${GREEN}✓ API property ${prop} exists${NC}"
        else
            echo -e "${RED}✗ Required API property ${prop} is missing${NC}"
            ERRORS=$((ERRORS+1))
        fi
    done
else
    echo -e "${RED}✗ frontend/src/config/api.ts not found${NC}"
    ERRORS=$((ERRORS+1))
fi

# Check weather service imports and exports
if [ -f "frontend/src/services/weatherService.ts" ]; then
    echo "Checking frontend/src/services/weatherService.ts..."

    # Check import naming (should import API, not API_CONFIG)
    if grep -q "import { API }" "frontend/src/services/weatherService.ts"; then
        echo -e "${GREEN}✓ API import naming is correct${NC}"
    else
        echo -e "${RED}✗ API import naming is incorrect. Should import as 'import { API }'${NC}"
        ERRORS=$((ERRORS+1))
    fi

    # Check buildApiUrl usage
    if grep -q "API.BASE_URL" "frontend/src/services/weatherService.ts"; then
        echo -e "${GREEN}✓ API.BASE_URL usage is correct${NC}"
    else
        echo -e "${RED}✗ API.BASE_URL usage is incorrect${NC}"
        ERRORS=$((ERRORS+1))
    fi

    # Check for required function exports
    REQUIRED_EXPORTS=("fetchCurrentWeather" "fetchHourlyForecast" "fetchDailyForecast")
    for func in "${REQUIRED_EXPORTS[@]}"; do
        if grep -q "export const ${func}" "frontend/src/services/weatherService.ts"; then
            echo -e "${GREEN}✓ Required function ${func} is exported${NC}"
        else
            echo -e "${RED}✗ Required function export '${func}' is missing${NC}"
            ERRORS=$((ERRORS+1))
        fi
    done

    # Check for basic functionality - file should be at least 100 lines
    LINE_COUNT=$(wc -l < "frontend/src/services/weatherService.ts")
    if [ "$LINE_COUNT" -gt 100 ]; then
        echo -e "${GREEN}✓ weatherService.ts has sufficient implementation (${LINE_COUNT} lines)${NC}"
    else
        echo -e "${RED}✗ weatherService.ts seems too small for a complete implementation (only ${LINE_COUNT} lines)${NC}"
        ERRORS=$((ERRORS+1))
    fi
else
    echo -e "${RED}✗ frontend/src/services/weatherService.ts not found${NC}"
    ERRORS=$((ERRORS+1))
fi

# Check backend port configuration
if [ -f "backend/app.py" ]; then
    echo "Checking backend/app.py..."

    # Check port configuration
    if grep -q "port=5003" "backend/app.py" || grep -q "PORT = 5003" "backend/app.py"; then
        echo -e "${GREEN}✓ Backend port correctly set to 5003${NC}"
    else
        echo -e "${RED}✗ Backend port may not be correctly set to 5003${NC}"
        ERRORS=$((ERRORS+1))
    fi
else
    echo -e "${RED}✗ backend/app.py not found${NC}"
    ERRORS=$((ERRORS+1))
fi

# Check frontend .env file if it exists
if [ -f "frontend/.env" ]; then
    echo "Checking frontend/.env..."

    # Check API URL configuration
    if grep -q "REACT_APP_API_URL=http://localhost:5003/api" "frontend/.env"; then
        echo -e "${GREEN}✓ Frontend .env has correct API URL${NC}"
    else
        echo -e "${RED}✗ Frontend .env may not have correct API URL${NC}"
        ERRORS=$((ERRORS+1))
    fi
else
    echo -e "${YELLOW}! frontend/.env not found (optional file)${NC}"
fi

# Final report
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ API configuration check passed successfully!${NC}"
    exit 0
else
    echo -e "${RED}✗ API configuration check found $ERRORS error(s)${NC}"
    echo -e "${YELLOW}Please fix these issues before proceeding with the release.${NC}"
    exit 1
fi