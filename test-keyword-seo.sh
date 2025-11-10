#!/bin/bash

# Test Keyword Generator and SEO Auditor with 285-Point System
# This script tests both upgraded APIs with realistic Etsy listing data

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   Testing Keyword Generator & SEO Auditor (285-Point System)  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

API_URL="http://localhost:3001"

# Test 1: Keyword Generator - Good Listing
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Keyword Generator - Well-Optimized Listing"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -X POST "${API_URL}/api/keywords/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Personalized Wedding Gift | Custom Family Name Sign | Rustic Home Decor",
    "description": "Beautiful handmade wooden sign perfect for weddings, anniversaries, or housewarming gifts. Crafted from premium oak with laser-engraved personalization. Makes a unique keepsake that couples will treasure forever. Available in multiple sizes and finishes.",
    "category": "Home & Living > Home Decor > Wall Hangings",
    "platform": "Etsy"
  }' \
  -w "\n\nStatus: %{http_code}\nTime: %{time_total}s\n\n" \
  -s | jq '.'

echo ""
echo "✓ Expected: 18-20 keywords with high buyer intent scores"
echo "✓ Expected: Gift-oriented intent detected"
echo "✓ Expected: Algorithm insights included"
echo ""

# Test 2: Keyword Generator - Poor Listing
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Keyword Generator - Under-Optimized Listing"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -X POST "${API_URL}/api/keywords/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ceramic Mug",
    "description": "Nice mug for coffee",
    "platform": "Etsy"
  }' \
  -w "\n\nStatus: %{http_code}\nTime: %{time_total}s\n\n" \
  -s | jq '.suggestions'

echo ""
echo "✓ Expected: Suggestions to add buyer intent keywords"
echo "✓ Expected: Lower relevance scores"
echo ""

# Test 3: SEO Auditor - Good Listing
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: SEO Auditor - Well-Optimized Listing (285-Point)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -X POST "${API_URL}/api/seo/audit" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "Etsy",
    "title": "Handmade Ceramic Coffee Mug | Artisan Pottery | Unique Kitchen Gift for Coffee Lovers",
    "description": "Elevate your morning coffee ritual with this beautiful handcrafted ceramic mug. Each piece is uniquely made by skilled artisans, ensuring you receive a one-of-a-kind treasure for your kitchen.\n\nPRODUCT DETAILS:\n• Material: High-quality stoneware ceramic\n• Capacity: 12 oz (perfect for coffee, tea, or hot chocolate)\n• Dimensions: 4 inch height x 3.5 inch diameter\n• Microwave and dishwasher safe\n• Lead-free and food safe\n\nFEATURES:\n• Ergonomic handle for comfortable grip\n• Smooth glazed finish\n• Artisan craftsmanship with visible hand-thrown texture\n• Durable and long-lasting\n• Perfect weight and balance\n\nPERFECT GIFT FOR:\n• Coffee lovers and tea enthusiasts\n• Housewarming parties\n• Birthdays and holidays\n• Office colleagues\n• Anyone who appreciates handmade quality\n\nEach mug is carefully wrapped and packaged to ensure safe delivery. Order yours today and enjoy your favorite beverages in style!",
    "tags": "handmade mug, pottery mug, coffee mug, ceramic cup, kitchen decor, gift for him, gift for her, artisan pottery, stoneware mug, unique gift, coffee lover gift, handmade pottery, ceramic drinkware",
    "category": "Home & Living > Kitchen & Dining > Drinkware",
    "price": 24.99,
    "photoCount": 8
  }' \
  -w "\n\nStatus: %{http_code}\nTime: %{time_total}s\n\n" \
  -s | jq '{
    overallScore: .overallScore,
    maxScore: .maxScore,
    percentage: .percentage,
    categoryScores: .categoryScores,
    criticalIssues: [.issues[] | select(.severity == "critical")],
    algorithmBreakdown: .algorithmBreakdown
  }'

echo ""
echo "✓ Expected: 200-220/285 points (70-77%)"
echo "✓ Expected: Minor issues only (missing 2 photos)"
echo "✓ Expected: Algorithm breakdown included"
echo ""

# Test 4: SEO Auditor - Poor Listing
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4: SEO Auditor - Under-Optimized Listing (285-Point)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -X POST "${API_URL}/api/seo/audit" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "Etsy",
    "title": "Ceramic Mug Handmade",
    "description": "Nice mug for coffee",
    "tags": "ceramic, mug, coffee",
    "photoCount": 3
  }' \
  -w "\n\nStatus: %{http_code}\nTime: %{time_total}s\n\n" \
  -s | jq '{
    overallScore: .overallScore,
    maxScore: .maxScore,
    percentage: .percentage,
    totalIssues: (.issues | length),
    criticalIssues: [.issues[] | select(.severity == "critical") | {category, pointsLost}],
    potentialGain: (.issues | map(.pointsLost) | add),
    recommendations: .recommendations
  }'

echo ""
echo "✓ Expected: 120-150/285 points (42-53%)"
echo "✓ Expected: Multiple critical issues"
echo "✓ Expected: High points lost (60-80+)"
echo ""

# Test 5: Combined Workflow
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 5: Combined Workflow - Generate Keywords → Audit Listing"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Step 1: Generate keywords..."
KEYWORDS=$(curl -X POST "${API_URL}/api/keywords/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Modern Wall Art Print",
    "description": "Minimalist abstract art for contemporary homes",
    "category": "Art & Collectibles"
  }' \
  -s | jq -r '[.primaryKeywords[].keyword, .secondaryKeywords[].keyword] | join(", ")')\n\necho "Generated keywords: $KEYWORDS"\necho ""\n\necho "Step 2: Audit with generated keywords..."\ncurl -X POST "${API_URL}/api/seo/audit" \\n  -H "Content-Type: application/json" \\n  -d "{\n    \"platform\": \"Etsy\",\n    \"title\": \"Modern Wall Art Print\",\n    \"description\": \"Minimalist abstract art for contemporary homes\",\n    \"tags\": \"${KEYWORDS}\",\n    \"photoCount\": 10\n  }" \\n  -s | jq '{\n    score: .overallScore,\n    percentage: .percentage,\n    tagCount: .detailedAnalysis.tagCount,\n    buyerIntentScore: .detailedAnalysis.buyerIntentScore\n  }'\n\necho ""\necho "✓ Expected: Auto-generated keywords improve audit score"\necho ""\n\n# Summary\necho "╔════════════════════════════════════════════════════════════════╗"\necho "║                        TEST SUMMARY                            ║"\necho "╚════════════════════════════════════════════════════════════════╝"\necho ""\necho "Tests Completed:"\necho "  ✓ Keyword Generator - Good listing"\necho "  ✓ Keyword Generator - Poor listing"\necho "  ✓ SEO Auditor - Good listing (200-220/285 expected)"\necho "  ✓ SEO Auditor - Poor listing (120-150/285 expected)"\necho "  ✓ Combined workflow"\necho ""\necho "Next Steps:"\necho "  1. Review JSON responses above"\necho "  2. Verify 285-point scoring accuracy"\necho "  3. Check algorithm insights are included"\necho "  4. Confirm issues are ranked by pointsLost"\necho ""\necho "All tests complete! 🎉"\n