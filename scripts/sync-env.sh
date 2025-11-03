#!/bin/bash
# Vercel Environment Variable Sync Script
# Pulls environment variables from Vercel and creates .env.local

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          Elite Listing AI - Vercel ENV Sync                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}✗ Vercel CLI not found${NC}"
    echo ""
    echo "Install with:"
    echo -e "  ${GREEN}npm install -g vercel${NC}"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Vercel CLI found${NC}"
echo ""

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠ Not logged in to Vercel${NC}"
    echo ""
    echo "Login with:"
    echo -e "  ${GREEN}vercel login${NC}"
    echo ""
    exit 1
fi

VERCEL_USER=$(vercel whoami)
echo -e "${GREEN}✓ Logged in as: ${BLUE}${VERCEL_USER}${NC}"
echo ""

# Pull environment variables
echo -e "${BLUE}📥 Pulling environment variables from Vercel...${NC}"
echo ""

# Pull for development environment
vercel env pull .env.local --environment=development

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Environment variables synced to .env.local${NC}"
    echo ""
    
    # Show what was pulled (without showing sensitive values)
    if [ -f .env.local ]; then
        echo -e "${BLUE}📋 Environment variables in .env.local:${NC}"
        echo ""
        grep -v '^#' .env.local | grep -v '^$' | cut -d= -f1 | while read -r line; do
            echo -e "  ${GREEN}✓${NC} $line"
        done
        echo ""
    fi
    
    echo -e "${YELLOW}⚠ Important Notes:${NC}"
    echo "  • .env.local is in .gitignore (safe from commits)"
    echo "  • Restart your dev server to use new variables"
    echo "  • Run: npm run dev"
    echo ""
    
    echo -e "${GREEN}✓ Dev Parity Mode Ready${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}✗ Failed to pull environment variables${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Ensure you're in the project root directory"
    echo "  2. Check you have access to the Vercel project"
    echo "  3. Run: vercel link (if not linked)"
    echo ""
    exit 1
fi
