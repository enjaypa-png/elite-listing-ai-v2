#!/bin/bash
# Health Check Script - Tests all critical endpoints
# Exit 0 if all pass, exit 1 if any fail

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="${BASE_URL:-http://localhost:3000}"

# Counter
FAILED=0
PASSED=0

# Helper function
check_endpoint() {
  local method=$1
  local endpoint=$2
  local expected_status=$3
  local description=$4
  
  echo -n "Testing $description... "
  
  if [ "$method" = "HEAD" ]; then
    status=$(curl -s -o /dev/null -w "%{http_code}" -X HEAD "$BASE_URL$endpoint" 2>/dev/null || echo "000")
  else
    status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint" 2>/dev/null || echo "000")
  fi
  
  if [ "$status" = "$expected_status" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $status)"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC} (HTTP $status, expected $expected_status)"
    ((FAILED++))
  fi
}

echo "================================================"
echo "Elite Listing AI - Health Check"
echo "Testing against: $BASE_URL"
echo "================================================"
echo ""

# Test endpoints
check_endpoint "GET" "/" "200" "Landing Page"
check_endpoint "HEAD" "/api/health" "200" "Health Endpoint (HEAD)"
check_endpoint "GET" "/api/health" "200" "Health Endpoint (GET)"
check_endpoint "HEAD" "/api/optimize" "200" "Optimizer Probe"
check_endpoint "GET" "/dashboard" "200" "Dashboard Page"
check_endpoint "GET" "/checkout" "200" "Checkout Page"

# These require auth, so 401 is acceptable
echo -n "Testing Credits API (auth required)... "
status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/user/credits" 2>/dev/null || echo "000")
if [ "$status" = "200" ] || [ "$status" = "401" ]; then
  echo -e "${GREEN}✓ PASS${NC} (HTTP $status)"
  ((PASSED++))
else
  echo -e "${RED}✗ FAIL${NC} (HTTP $status)"
  ((FAILED++))
fi

echo -n "Testing Profile API (auth required)... "
status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/user/profile" 2>/dev/null || echo "000")
if [ "$status" = "200" ] || [ "$status" = "401" ]; then
  echo -e "${GREEN}✓ PASS${NC} (HTTP $status)"
  ((PASSED++))
else
  echo -e "${RED}✗ FAIL${NC} (HTTP $status)"
  ((FAILED++))
fi

# Summary
echo ""
echo "================================================"
echo "Health Check Summary"
echo "================================================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All health checks passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ $FAILED health check(s) failed${NC}"
  exit 1
fi
