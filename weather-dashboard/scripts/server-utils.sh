#!/bin/bash

# server-utils.sh - Utility functions for Weather Dashboard server management
# This script contains helper functions for health checks, diagnostics and monitoring
# Usage: source ./server-utils.sh

# Set script to exit on error
set -e

# Project ports and endpoints
BACKEND_PORT=5003
FRONTEND_PORT=3000
BACKEND_HEALTH_ENDPOINT="http://localhost:${BACKEND_PORT}/api/health"
FRONTEND_URL="http://localhost:${FRONTEND_PORT}"

# Log files
mkdir -p logs
LOG_DIR="./logs"
BACKEND_LOG="${LOG_DIR}/backend.log"
FRONTEND_LOG="${LOG_DIR}/frontend.log"
MASTER_LOG="${LOG_DIR}/master.log"
ERROR_LOG="${LOG_DIR}/error.log"
HEALTH_LOG="${LOG_DIR}/health.log"

# Color codes for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print messages
print_message() {
  echo -e "${BLUE}==>${NC} $1"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1" >> "${LOG_DIR}/master.log"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: $1" >> "${LOG_DIR}/master.log"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >> "${LOG_DIR}/error.log"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >> "${LOG_DIR}/master.log"
}

print_warning() {
  echo -e "${YELLOW}!${NC} $1"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1" >> "${LOG_DIR}/master.log"
}

# Check if a URL is reachable with curl
check_url() {
  local url="$1"
  local timeout="${2:-5}"
  curl -s --max-time "$timeout" "$url" > /dev/null 2>&1
  return $?
}

# Check if a port is in use
check_port() {
  local port="$1"
  lsof -i:"$port" -sTCP:LISTEN > /dev/null 2>&1
  return $?
}

# Wait for a backend health endpoint to respond successfully
wait_for_backend() {
  local attempts=0
  local max_attempts="${1:-30}"
  local delay="${2:-2}"

  print_message "Waiting for backend to start (max ${max_attempts} attempts, ${delay}s delay)..."

  while [ "$attempts" -lt "$max_attempts" ]; do
    attempts=$((attempts + 1))

    if curl -s "${BACKEND_HEALTH_ENDPOINT}" > /dev/null 2>&1; then
      print_success "Backend is healthy and responding after $attempts attempts"
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] HEALTH CHECK: Backend healthy after $attempts attempts" >> "${HEALTH_LOG}"
      return 0
    fi

    print_warning "Waiting for backend... ($attempts/$max_attempts)"
    sleep "$delay"
  done

  print_error "Backend failed to become healthy after $max_attempts attempts"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] HEALTH CHECK: Backend failed to become healthy after $max_attempts attempts" >> "${HEALTH_LOG}"
  return 1
}

# Wait for frontend to be accessible
wait_for_frontend() {
  local attempts=0
  local max_attempts="${1:-30}"
  local delay="${2:-2}"

  print_message "Waiting for frontend to start (max ${max_attempts} attempts, ${delay}s delay)..."

  while [ "$attempts" -lt "$max_attempts" ]; do
    attempts=$((attempts + 1))

    if curl -s "${FRONTEND_URL}" > /dev/null 2>&1; then
      print_success "Frontend is accessible after $attempts attempts"
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] HEALTH CHECK: Frontend accessible after $attempts attempts" >> "${HEALTH_LOG}"
      return 0
    fi

    print_warning "Waiting for frontend... ($attempts/$max_attempts)"
    sleep "$delay"
  done

  print_error "Frontend failed to become accessible after $max_attempts attempts"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] HEALTH CHECK: Frontend failed to become accessible after $max_attempts attempts" >> "${HEALTH_LOG}"
  return 1
}

# Check backend health in detail
check_backend_health() {
  print_message "Checking backend health in detail..."

  # Check if backend port is open
  if ! check_port "$BACKEND_PORT"; then
    print_error "Backend port $BACKEND_PORT is not open"
    return 1
  fi

  # Check if health endpoint returns 200
  local health_response
  health_response=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_HEALTH_ENDPOINT}")

  if [ "$health_response" != "200" ]; then
    print_error "Backend health check failed with HTTP code $health_response"
    return 1
  fi

  # Check if health endpoint returns valid JSON
  local health_json
  health_json=$(curl -s "${BACKEND_HEALTH_ENDPOINT}")

  if ! echo "$health_json" | grep -q "status"; then
    print_error "Backend health check did not return valid JSON with status field"
    return 1
  fi

  print_success "Backend appears healthy"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] HEALTH CHECK: Backend detailed health check passed" >> "${HEALTH_LOG}"
  return 0
}

# Check frontend in detail
check_frontend_health() {
  print_message "Checking frontend health in detail..."

  # Check if frontend port is open
  if ! check_port "$FRONTEND_PORT"; then
    print_error "Frontend port $FRONTEND_PORT is not open"
    return 1
  fi

  # Check if frontend page loads
  local frontend_response
  frontend_response=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}")

  if [ "$frontend_response" != "200" ]; then
    print_error "Frontend check failed with HTTP code $frontend_response"
    return 1
  fi

  print_success "Frontend appears healthy"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] HEALTH CHECK: Frontend detailed health check passed" >> "${HEALTH_LOG}"
  return 0
}

# Check for errors in log files
check_log_errors() {
  print_message "Checking logs for errors..."

  # Check backend logs for errors
  if [ -f "$BACKEND_LOG" ] && grep -i "error\|exception\|traceback" "$BACKEND_LOG" > /dev/null; then
    print_warning "Found errors in backend log file:"
    grep -i "error\|exception\|traceback" "$BACKEND_LOG" | tail -5
  else
    print_success "No errors found in backend log"
  fi

  # Check frontend logs for errors
  if [ -f "$FRONTEND_LOG" ] && grep -i "error\|exception\|failed" "$FRONTEND_LOG" > /dev/null; then
    print_warning "Found errors in frontend log file:"
    grep -i "error\|exception\|failed" "$FRONTEND_LOG" | tail -5
  else
    print_success "No errors found in frontend log"
  fi

  return 0
}

# Get backend information including version
get_backend_info() {
  print_message "Getting backend information..."

  local info_json
  info_json=$(curl -s "${BACKEND_HEALTH_ENDPOINT}" 2>/dev/null)

  if [ -z "$info_json" ]; then
    print_error "Could not get backend information"
    return 1
  fi

  echo "$info_json"
  return 0
}

# Get process usage information for backend and frontend
get_process_info() {
  print_message "Getting process information..."

  # Get backend process info
  local backend_pid
  backend_pid=$(lsof -ti:"$BACKEND_PORT" -sTCP:LISTEN 2>/dev/null)

  if [ -n "$backend_pid" ]; then
    echo "Backend process (PID $backend_pid):"
    ps -p "$backend_pid" -o pid,ppid,user,%cpu,%mem,start,time,command
  else
    print_warning "Backend process not found"
  fi

  # Get frontend process info
  local frontend_pid
  frontend_pid=$(lsof -ti:"$FRONTEND_PORT" -sTCP:LISTEN 2>/dev/null)

  if [ -n "$frontend_pid" ]; then
    echo "Frontend process (PID $frontend_pid):"
    ps -p "$frontend_pid" -o pid,ppid,user,%cpu,%mem,start,time,command
  else
    print_warning "Frontend process not found"
  fi

  return 0
}

# Run all health checks and diagnostics
run_full_diagnostics() {
  print_message "Running full diagnostics..."

  check_backend_health
  check_frontend_health
  check_log_errors
  get_process_info

  print_message "Diagnostics complete."
  return 0
}

# When run directly, provide usage information
if [[ "${BASH_SOURCE[0]}" = "$0" ]]; then
  echo "Weather Dashboard Server Utilities"
  echo ""
  echo "This script contains utility functions for health checks and diagnostics."
  echo "It is meant to be sourced from other scripts rather than run directly."
  echo ""
  echo "Example usage in another script:"
  echo "  source ./server-utils.sh"
  echo "  wait_for_backend 30 2"
  echo "  check_backend_health"
  echo ""
  echo "Available functions:"
  echo "  wait_for_backend [max_attempts] [delay]"
  echo "  wait_for_frontend [max_attempts] [delay]"
  echo "  check_backend_health"
  echo "  check_frontend_health"
  echo "  check_log_errors"
  echo "  get_backend_info"
  echo "  get_process_info"
  echo "  run_full_diagnostics"
  echo ""
  echo "To run diagnostics directly from this script:"
  echo "  ./server-utils.sh diagnostics"

  # Allow running diagnostics directly
  if [ "$1" = "diagnostics" ]; then
    run_full_diagnostics
  fi
fi