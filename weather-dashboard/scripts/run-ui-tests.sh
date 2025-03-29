#!/bin/bash

# Set colors for better output visualization
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
NC="\033[0m" # No Color

echo -e "${YELLOW}Starting Weather Dashboard UI Test Runner${NC}"
echo "========================================"

# Create a directory for test results if it doesn't exist
mkdir -p test-results

# Move to the frontend directory
cd "$(dirname "$0")/../frontend" || {
    echo -e "${RED}Error: Could not navigate to frontend directory${NC}"
    exit 1
}

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies first...${NC}"
    npm install
fi

# Run the Jest tests
echo -e "${GREEN}Running UI Tests...${NC}"
echo "----------------------------------------"
export CI=true # Ensures Jest runs in CI mode (no watch mode)

# Run tests and capture the exit code
npm test -- --testPathPattern='^.*\.(test|spec)\.(ts|tsx)$' --coverage --json --outputFile=../test-results/jest-results.json

# Get the exit code from the test run
TEST_EXIT_CODE=$?

# Output test results summary
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed successfully!${NC}"
else
    echo -e "${RED}✗ Some tests failed. Check the output above for details.${NC}"
fi

# Create a summary file with timestamp
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
echo "Test Run: $TIMESTAMP" > ../test-results/summary.txt
echo "Exit Code: $TEST_EXIT_CODE" >> ../test-results/summary.txt

echo "========================================"
echo -e "${YELLOW}Test results saved to:${NC} test-results/"

exit $TEST_EXIT_CODE