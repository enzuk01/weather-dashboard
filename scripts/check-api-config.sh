#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print header
echo -e "${YELLOW}=== API Configuration Check Script ===${NC}\n"

# Variables
FRONTEND_DIR="weather-dashboard/frontend"
CONFIG_FILE="$FRONTEND_DIR/src/config/api.ts"
SERVICE_FILE="$FRONTEND_DIR/src/services/weatherService.ts"
ENV_FILE="$FRONTEND_DIR/src/.env"
DIRECT_START_SCRIPT="weather-dashboard/direct-start.sh"
ERRORS=0

# Check if files exist
for file in "$CONFIG_FILE" "$SERVICE_FILE" "$DIRECT_START_SCRIPT"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}Error: $file does not exist${NC}"
        ERRORS=$((ERRORS+1))
    fi
done

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}Cannot proceed with checks due to missing files${NC}"
    exit 1
fi

echo "Checking API configuration files..."

# Check 1: Verify API export in api.ts
if grep -q "export const API = {" "$CONFIG_FILE"; then
    echo -e "${GREEN}✓ API is properly exported in config/api.ts${NC}"
else
    echo -e "${RED}✗ API export not found in config/api.ts${NC}"
    ERRORS=$((ERRORS+1))
fi

# Check 2: Verify buildApiUrl implementation
# Extract the buildApiUrl function content and check if it contains API.BASE_URL
buildApiUrlContent=$(grep -A 10 "buildApiUrl" "$CONFIG_FILE")
if echo "$buildApiUrlContent" | grep -q "API\.BASE_URL"; then
    echo -e "${GREEN}✓ buildApiUrl uses API.BASE_URL correctly${NC}"
else
    echo -e "${RED}✗ buildApiUrl might be using incorrect object reference${NC}"
    echo -e "${YELLOW}   Function content: $(echo "$buildApiUrlContent" | head -3)${NC}"
    ERRORS=$((ERRORS+1))
fi

# Check 3: Check weatherService imports
if grep -q "import.*{[[:space:]]*API[[:space:]]*," "$SERVICE_FILE"; then
    echo -e "${GREEN}✓ weatherService correctly imports API${NC}"
else
    echo -e "${RED}✗ weatherService may be importing API_CONFIG instead of API${NC}"
    ERRORS=$((ERRORS+1))
fi

# Check 4: Check weatherService uses API for endpoints
if grep -q "API\.ENDPOINTS" "$SERVICE_FILE"; then
    echo -e "${GREEN}✓ weatherService uses API.ENDPOINTS correctly${NC}"
else
    echo -e "${RED}✗ weatherService might not be using API.ENDPOINTS${NC}"
    ERRORS=$((ERRORS+1))
fi

# Check 5: Check port configuration in direct-start.sh
BACKEND_PORT=$(grep "BACKEND_PORT=" "$DIRECT_START_SCRIPT" | head -1 | cut -d'=' -f2)
if [ "$BACKEND_PORT" = "5003" ]; then
    echo -e "${GREEN}✓ Backend port is correctly set to 5003 in direct-start.sh${NC}"
else
    echo -e "${RED}✗ Backend port is set to $BACKEND_PORT in direct-start.sh, should be 5003${NC}"
    ERRORS=$((ERRORS+1))
fi

# Check 6: Check frontend port in direct-start.sh
FRONTEND_PORT=$(grep "FRONTEND_PRIMARY_PORT=" "$DIRECT_START_SCRIPT" | head -1 | cut -d'=' -f2)
if [ "$FRONTEND_PORT" = "3000" ]; then
    echo -e "${GREEN}✓ Frontend port is correctly set to 3000 in direct-start.sh${NC}"
else
    echo -e "${RED}✗ Frontend port is set to $FRONTEND_PORT in direct-start.sh, should be 3000${NC}"
    ERRORS=$((ERRORS+1))
fi

# Check .env file if it exists
if [ -f "$FRONTEND_DIR/.env" ]; then
    # Check 7: API URL in .env file
    if grep -q "REACT_APP_API_URL=.*localhost:5003/api" "$FRONTEND_DIR/.env"; then
        echo -e "${GREEN}✓ API URL in .env correctly points to port 5003${NC}"
    else
        echo -e "${RED}✗ API URL in .env may not be pointing to the correct port${NC}"
        ERRORS=$((ERRORS+1))
    fi

    # Check 8: PORT in .env file
    if grep -q "PORT=3000" "$FRONTEND_DIR/.env"; then
        echo -e "${GREEN}✓ PORT in .env correctly set to 3000${NC}"
    else
        echo -e "${RED}✗ PORT in .env may not be set to 3000${NC}"
        ERRORS=$((ERRORS+1))
    fi
else
    echo -e "${YELLOW}Warning: .env file not found in frontend directory${NC}"
fi

# Final result
echo ""
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All API configuration checks passed${NC}"
    exit 0
else
    echo -e "${RED}✗ API configuration check found $ERRORS error(s)${NC}"
    echo -e "${YELLOW}Please fix these issues before proceeding with the release.${NC}"
    exit 1
fi