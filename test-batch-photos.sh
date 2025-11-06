#!/bin/bash

# Test script for batch photo analysis endpoint
# Usage: ./test-batch-photos.sh

echo "🧪 Testing Batch Photo Analysis Endpoint"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
echo "📡 Checking if Next.js server is running..."
if curl -s http://localhost:3001/api/optimize/images/batch-analyze > /dev/null; then
    echo -e "${GREEN}✓${NC} Server is running on port 3001"
else
    echo -e "${RED}✗${NC} Server is not running. Start with: npm run dev"
    exit 1
fi

echo ""
echo "🔑 Checking API key configuration..."
API_CHECK=$(curl -s http://localhost:3001/api/optimize/images/batch-analyze | jq -r '.hasApiKey')
if [ "$API_CHECK" == "true" ]; then
    echo -e "${GREEN}✓${NC} OpenAI API key is configured"
else
    echo -e "${RED}✗${NC} OpenAI API key is NOT configured"
    echo "   Set OPENAI_API_KEY in .env.local file"
    exit 1
fi

echo ""
echo "🖼️  Test 1: Analyzing 5 sample photos..."
echo "--------------------------------------"

# Test with 5 sample Etsy product photos
TEST_PAYLOAD='{
  "photos": [
    "https://i.etsystatic.com/46858144/r/il/12ab65/6083765886/il_1588xN.6083765886_cgyr.jpg",
    "https://i.etsystatic.com/46858144/r/il/ee820b/6083765892/il_1588xN.6083765892_iyj5.jpg",
    "https://i.etsystatic.com/46858144/r/il/0eea06/6083765910/il_1588xN.6083765910_m6ij.jpg",
    "https://i.etsystatic.com/46858144/r/il/69c6ad/6083765924/il_1588xN.6083765924_b7x3.jpg",
    "https://i.etsystatic.com/46858144/r/il/e4f721/6083765944/il_1588xN.6083765944_azhp.jpg"
  ],
  "platform": "etsy"
}'

START_TIME=$(date +%s)

RESPONSE=$(curl -s -X POST http://localhost:3001/api/optimize/images/batch-analyze \
  -H "Content-Type: application/json" \
  -d "$TEST_PAYLOAD")

END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))

# Check if request was successful
OK=$(echo $RESPONSE | jq -r '.ok')

if [ "$OK" == "true" ]; then
    echo -e "${GREEN}✓${NC} Request successful"
    
    # Extract key metrics
    OVERALL_SCORE=$(echo $RESPONSE | jq -r '.overallScore')
    PHOTO_COUNT=$(echo $RESPONSE | jq -r '.photoCount')
    ANALYZED_COUNT=$(echo $RESPONSE | jq -r '.analyzedCount')
    FAILED_COUNT=$(echo $RESPONSE | jq -r '.failedCount')
    PROCESSING_TIME=$(echo $RESPONSE | jq -r '.processingTime')
    
    echo ""
    echo "📊 Results:"
    echo "   Overall Score: ${OVERALL_SCORE}/100"
    echo "   Photos Analyzed: ${ANALYZED_COUNT}/${PHOTO_COUNT}"
    echo "   Failed: ${FAILED_COUNT}"
    echo "   Processing Time: ${PROCESSING_TIME}"
    echo "   Request Time: ${ELAPSED}s"
    
    # Check if processing was fast enough (should be < 10s for 5 photos)
    PROC_SECONDS=$(echo $PROCESSING_TIME | sed 's/s//')
    if (( $(echo "$PROC_SECONDS < 10" | bc -l) )); then
        echo -e "   ${GREEN}✓${NC} Processing time is good (parallel processing working)"
    else
        echo -e "   ${YELLOW}⚠${NC} Processing time > 10s (check if parallel processing is working)"
    fi
    
    echo ""
    echo "🔍 Average Scores:"
    AVG_PROD=$(echo $RESPONSE | jq -r '.averageScores.productDominance')
    AVG_BG=$(echo $RESPONSE | jq -r '.averageScores.backgroundQuality')
    AVG_LIGHT=$(echo $RESPONSE | jq -r '.averageScores.lighting')
    AVG_CLARITY=$(echo $RESPONSE | jq -r '.averageScores.clarity')
    AVG_COLOR=$(echo $RESPONSE | jq -r '.averageScores.colorBalance')
    
    echo "   Product Dominance: ${AVG_PROD}/100"
    echo "   Background Quality: ${AVG_BG}/100"
    echo "   Lighting: ${AVG_LIGHT}/100"
    echo "   Clarity: ${AVG_CLARITY}/100"
    echo "   Color Balance: ${AVG_COLOR}/100"
    
    echo ""
    echo "📋 Issues Found:"
    ISSUES=$(echo $RESPONSE | jq -r '.issues[]' 2>/dev/null)
    if [ -z "$ISSUES" ]; then
        echo -e "   ${GREEN}✓${NC} No issues found"
    else
        echo "$ISSUES" | sed 's/^/   • /'
    fi
    
    echo ""
    echo "💡 Suggestions:"
    SUGGESTIONS=$(echo $RESPONSE | jq -r '.suggestions[]' 2>/dev/null | head -5)
    if [ -z "$SUGGESTIONS" ]; then
        echo "   None"
    else
        echo "$SUGGESTIONS" | sed 's/^/   • /'
    fi
    
    echo ""
    echo "📸 Individual Photo Scores:"
    echo $RESPONSE | jq -r '.analyses[] | "   Photo \(.photoNumber): \(.score)/100 - \(.feedback // "N/A")"' | head -10
    
    echo ""
    echo -e "${GREEN}✅ Test 1 PASSED${NC}"
    
else
    echo -e "${RED}✗${NC} Request failed"
    ERROR_MSG=$(echo $RESPONSE | jq -r '.error.message // "Unknown error"')
    echo "   Error: $ERROR_MSG"
    echo ""
    echo "Full response:"
    echo $RESPONSE | jq '.'
    exit 1
fi

echo ""
echo "=========================================="
echo "🎉 All tests passed!"
echo ""
echo "Next steps:"
echo "1. Review the results above"
echo "2. Check processing time (should be 3-5s for 5 photos)"
echo "3. Verify parallel processing is working"
echo "4. Test with 10 photos"
echo "5. Update UI to use batch endpoint"
