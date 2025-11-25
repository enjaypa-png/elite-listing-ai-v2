#!/bin/bash

echo "🧪 Testing R.A.N.K. 285™ SEO Audit Endpoint..."
echo ""

# Test with good listing example
curl -X POST http://localhost:3000/api/seo/audit \
  -H "Content-Type: application/json" \
  -d '{
  "platform": "Etsy",
  "title": "Handmade Ceramic Coffee Mug Artisan Pottery Gift for Coffee Lovers",
  "description": "Beautiful handmade ceramic mug perfect for coffee lovers. Made of high-quality stoneware ceramic, this artisan pottery mug is microwave and dishwasher safe. Dimensions: 4 inches tall, 3 inches diameter. Perfect for morning coffee, tea, or hot chocolate. Each mug is hand-thrown and unique. Great gift for birthdays, holidays, or housewarming. Order now and enjoy your favorite beverage in style!",
  "tags": "ceramic mug, handmade pottery, coffee mug, artisan mug, pottery gift, coffee lover gift, handmade ceramic, stoneware mug, unique mug, kitchen gift, housewarming gift, birthday gift, handcrafted mug",
  "category": "Home & Living > Kitchen & Dining > Mugs",
  "keywords": ["ceramic mug", "handmade pottery", "coffee gift"]
}'

echo ""
echo "✅ Test complete!"
