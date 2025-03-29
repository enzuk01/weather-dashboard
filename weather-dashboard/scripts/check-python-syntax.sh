#!/bin/bash

# check-python-syntax.sh
# Script to verify Python files for syntax errors before deployment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$REPO_ROOT/backend"
LOG_DIR="$REPO_ROOT/logs"
TEMP_DIR="/tmp/weather-dashboard"

# Ensure log directories exist
mkdir -p "$LOG_DIR"
mkdir -p "$TEMP_DIR"

echo "=== Python Health Checker ==="
echo "Checking backend Python files for syntax errors..."

# List of critical Python files to check (only core files that must exist)
CRITICAL_FILES=(
  "$BACKEND_DIR/app.py"
  "$BACKEND_DIR/weather_service.py"
  "$BACKEND_DIR/config.py"
  "$BACKEND_DIR/openmeteo_client.py"
)

# Files to check for errors
LOG_FILES=(
  "$LOG_DIR/master.log"
  "$LOG_DIR/error.log"
  "$LOG_DIR/backend.log"
  "$TEMP_DIR/flask_startup_error.log"
  "$TEMP_DIR/python_syntax_error.log"
)

check_file() {
  local file=$1
  local is_critical=$2

  if [ -f "$file" ]; then
    echo "Checking $file..."
    python -m py_compile "$file"
    if [ $? -eq 0 ]; then
      echo "✅ $file - OK"
    else
      echo "❌ $file - SYNTAX ERROR"
      return 1
    fi
  elif [ "$is_critical" = true ]; then
    echo "❌ ERROR: Critical file $file not found"
    return 1
  fi
  return 0
}

check_log_for_errors() {
  local log_file=$1
  local error_patterns=("Error:" "ERROR:" "Exception:" "Traceback" "SyntaxError" "NameError" "ImportError")

  if [ ! -f "$log_file" ]; then
    return 0  # Log file doesn't exist, not an error
  fi

  echo "Analyzing log file: $log_file"

  # Check for important error patterns
  for pattern in "${error_patterns[@]}"; do
    error_count=$(grep -c "$pattern" "$log_file" 2>/dev/null || echo "0")
    # Remove any whitespace from error_count
    error_count=$(echo $error_count | tr -d '[:space:]')

    if [ "$error_count" -gt 0 ]; then
      echo "⚠️ Found $error_count instances of '$pattern' in $log_file"
      echo "    Most recent errors:"
      grep -n "$pattern" "$log_file" | tail -3
      return 1
    fi
  done

  echo "✅ No errors found in $log_file"
  return 0
}

# Check all critical files
HAS_ERRORS=0
for file in "${CRITICAL_FILES[@]}"; do
  if ! check_file "$file" true; then
    HAS_ERRORS=1
  fi
done

# Check all other Python files in backend directory without reporting missing files
echo "Checking additional Python files..."
for file in $(find "$BACKEND_DIR" -name "*.py" -not -path "*/\.*" -not -path "*/venv/*" 2>/dev/null); do
  # Skip files already checked in CRITICAL_FILES
  if [[ ! " ${CRITICAL_FILES[@]} " =~ " ${file} " ]]; then
    if ! check_file "$file" false; then
      HAS_ERRORS=1
    fi
  fi
done

# Check log files for errors
echo -e "\nChecking log files for errors..."
for log_file in "${LOG_FILES[@]}"; do
  if ! check_log_for_errors "$log_file"; then
    HAS_ERRORS=1
  fi
done

# Report results
if [ $HAS_ERRORS -eq 0 ]; then
  echo -e "\n✅ All checks passed. Backend should be ready to run."
  exit 0
else
  echo -e "\n❌ Issues detected with Python files or in logs"
  echo "Please fix the errors before continuing"
  exit 1
fi