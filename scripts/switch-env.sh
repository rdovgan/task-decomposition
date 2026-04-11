#!/bin/bash

# Environment Switcher Script for Task Decomposition Tool
# Usage: ./scripts/switch-env.sh [development|staging|production|test]

set -e

ENVIRONMENT=$1

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Validate environment argument
valid_environments=("development" "staging" "production" "test")

if [[ -z "$ENVIRONMENT" ]]; then
    print_error "Environment not specified"
    echo ""
    echo "Usage: ./scripts/switch-env.sh [development|staging|production|test]"
    echo ""
    echo "Examples:"
    echo "  ./scripts/switch-env.sh development"
    echo "  ./scripts/switch-env.sh staging"
    echo "  ./scripts/switch-env.sh production"
    exit 1
fi

if [[ ! " ${valid_environments[@]} " =~ " ${ENVIRONMENT} " ]]; then
    print_error "Invalid environment: $ENVIRONMENT"
    echo ""
    echo "Valid environments: ${valid_environments[*]}"
    exit 1
fi

# Check if .env file exists
if [ -f ".env" ]; then
    print_warning "Backing up existing .env to .env.backup"
    cp .env .env.backup
fi

# Check if environment file exists
env_file=".env.${ENVIRONMENT}"
if [ ! -f "$env_file" ]; then
    print_error "Environment file not found: $env_file"
    exit 1
fi

# Copy environment file to .env
print_info "Switching to ${ENVIRONMENT} environment..."
cp "$env_file" .env

print_success "Switched to ${ENVIRONMENT} environment"

# Show database connection
db_url=$(grep "DATABASE_URL" .env | cut -d '=' -f2)
if [[ "$ENVIRONMENT" == "production" ]]; then
    print_warning "You are switching to PRODUCTION environment"
    print_info "Database: task_decomposition_prod"
elif [[ "$ENVIRONMENT" == "staging" ]]; then
    print_info "Database: task_decomposition_staging"
elif [[ "$ENVIRONMENT" == "test" ]]; then
    print_info "Database: task_decomposition_test"
else
    print_info "Database: task_decomposition_dev"
fi

# Remind about database operations
echo ""
print_info "Next steps:"
if [[ "$ENVIRONMENT" == "production" ]] || [[ "$ENVIRONMENT" == "staging" ]]; then
    echo "  1. Review your .env file and update API keys if needed"
    echo "  2. Run: npm run db:generate"
    echo "  3. Run: npm run db:push  (be careful in production!)"
    echo "  4. Start your services: npm run dev:all"
else
    echo "  1. Run: npm run db:generate"
    echo "  2. Run: npm run db:push"
    echo "  3. Start your services: npm run dev:all"
fi

echo ""
print_success "Environment switch complete!"
