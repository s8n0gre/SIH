#!/bin/bash

# CrowdSource - Start All Services
# This script starts MongoDB, Backend, Frontend, and AI Server

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Start MongoDB
start_mongodb() {
    log_info "Starting MongoDB..."
    if check_port 27017; then
        log_warning "MongoDB is already running on port 27017"
    else
        mongod --dbpath "$PROJECT_ROOT/data/mongodb" &
        sleep 2
        if check_port 27017; then
            log_success "MongoDB started successfully"
        else
            log_error "Failed to start MongoDB"
            return 1
        fi
    fi
}

# Start Backend
start_backend() {
    log_info "Starting Backend server..."
    if check_port 5000; then
        log_warning "Backend is already running on port 5000"
    else
        cd "$PROJECT_ROOT/backend"
        npm install >/dev/null 2>&1
        npm start &
        sleep 3
        if check_port 5000; then
            log_success "Backend started successfully on port 5000"
        else
            log_error "Failed to start Backend"
            return 1
        fi
    fi
}

# Start Frontend
start_frontend() {
    log_info "Starting Frontend server..."
    if check_port 5173; then
        log_warning "Frontend is already running on port 5173"
    else
        cd "$PROJECT_ROOT"
        npm install >/dev/null 2>&1
        npm run dev &
        sleep 3
        if check_port 5173; then
            log_success "Frontend started successfully on port 5173"
        else
            log_error "Failed to start Frontend"
            return 1
        fi
    fi
}

# Start AI Server
start_ai_server() {
    log_info "Starting AI Server..."
    if check_port 3001; then
        log_warning "AI Server is already running on port 3001"
    else
        cd "$PROJECT_ROOT/ai_server"
        python direct_minicpm_server.py &
        sleep 3
        if check_port 3001; then
            log_success "AI Server started successfully on port 3001"
        else
            log_error "Failed to start AI Server"
            return 1
        fi
    fi
}

# Main execution
main() {
    log_info "=========================================="
    log_info "CrowdSource - Starting All Services"
    log_info "=========================================="
    echo

    # Create data directory if it doesn't exist
    mkdir -p "$PROJECT_ROOT/data/mongodb"

    # Start services
    start_mongodb || log_warning "MongoDB startup had issues"
    start_backend || log_warning "Backend startup had issues"
    start_frontend || log_warning "Frontend startup had issues"
    start_ai_server || log_warning "AI Server startup had issues"

    echo
    log_success "=========================================="
    log_success "All services started!"
    log_success "=========================================="
    echo
    log_info "Services running on:"
    log_info "  MongoDB:    mongodb://localhost:27017"
    log_info "  Backend:    http://localhost:5000"
    log_info "  Frontend:   http://localhost:5173"
    log_info "  AI Server:  http://localhost:3001"
    echo
    log_info "Press Ctrl+C to stop all services"
    echo

    # Keep script running
    wait
}

# Trap Ctrl+C to cleanup
trap 'log_info "Stopping all services..."; pkill -P $$; exit 0' INT

main
