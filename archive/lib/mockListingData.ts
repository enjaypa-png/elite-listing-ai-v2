// Mock listing data for development (until Etsy API approved)

export const mockListing = {
  id: "mock-123",
  title: "Ceramic Mug Handmade",
  description: "Nice mug for coffee",
  tags: ["ceramic", "mug", "coffee"],
  images: [
    "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800",
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800",
    "https://images.unsplash.com/photo-1572359269836-8b4e0b4a9f69?w=800"
  ],
  price: 24.99,
  shipping: 7.50,
  status: "active",
  currentScore: 140,
  maxScore: 285,
  potentialScore: 203,
  percentage: 49
};

export interface AIOptimizations {
  titles: TitleVariant[];
  tags: TagSuggestions;
  description: DescriptionOptimization;
  photos: PhotoOptimization;
}

export interface TitleVariant {
  text: string;
  score: number;
  maxScore: number;
  improvement: string;
  reasoning: string;
}

export interface TagSuggestions {
  current: string[];
  suggested: string[];
  improvement: string;
}

export interface DescriptionOptimization {
  current: string;
  optimized: string;
  improvement: string;
  characterCount: number;
}

export interface PhotoOptimization {
  current: number;
  needed: number;
  missing: number;
  improvement: string;
  suggestions: string[];
}

export interface PriorityIssue {
  id: number;
  severity: 'critical' | 'high' | 'medium';
  title: string;
  description: string;
  points: number;
  category: string;
}

export const aiOptimizations: AIOptimizations = {
  titles: [
    {
      text: "Handmade Ceramic Coffee Mug | Artisan Pottery | Unique Kitchen Gift",
      score: 68,
      maxScore: 70,
      improvement: "+23 points",
      reasoning: "Includes primary keywords, long-tail search terms, and gift angle"
    },
    {
      text: "Custom Ceramic Mug Handcrafted | Modern Stoneware Coffee Cup | Home Decor",
      score: 65,
      maxScore: 70,
      improvement: "+20 points",
      reasoning: "Covers customization angle and home decor category"
    },
    {
      text: "Artisan Ceramic Mug | Hand Thrown Pottery | Coffee Lover Gift | Kitchen Essential",
      score: 67,
      maxScore: 70,
      improvement: "+22 points",
      reasoning: "Emphasizes artisan quality and gift potential"
    }
  ],
  tags: {
    current: ["ceramic", "mug", "coffee"],
    suggested: [
      "handmade mug",
      "pottery mug",
      "coffee mug",
      "ceramic cup",
      "kitchen decor",
      "gift for him",
      "gift for her",
      "artisan pottery",
      "stoneware mug",
      "unique gift"
    ],
    improvement: "+22 points"
  },
  description: {
    current: "Nice mug for coffee",
    optimized: `✨ HANDMADE CERAMIC COFFEE MUG ✨

Elevate your morning coffee ritual with this beautiful handcrafted ceramic mug. Each piece is uniquely made by skilled artisans, ensuring you receive a one-of-a-kind treasure for your kitchen.

🎨 PRODUCT DETAILS:
• Material: High-quality ceramic/stoneware
• Capacity: 12 oz (perfect for coffee, tea, or hot chocolate)
• Dimensions: 4" height x 3.5" diameter
• Microwave safe
• Dishwasher safe (hand wash recommended)
• Lead-free and food safe

💫 FEATURES:
• Ergonomic handle for comfortable grip
• Smooth glazed finish
• Artisan craftsmanship
• Durable and long-lasting
• Perfect weight and balance

🎁 PERFECT GIFT FOR:
• Coffee lovers
• Tea enthusiasts
• Housewarming parties
• Birthdays and holidays
• Office colleagues
• Anyone who appreciates handmade quality

📦 PACKAGING:
Each mug is carefully wrapped and packaged to ensure it arrives safely at your doorstep.

♻️ SUSTAINABILITY:
Our pottery is made with eco-friendly practices and sustainable materials.

⭐ CUSTOMER SATISFACTION:
We stand behind the quality of our work. If you have any questions or concerns, please don't hesitate to reach out!

Order yours today and enjoy your favorite beverages in style! ☕`,
    improvement: "+18 points",
    characterCount: 1247
  },
  photos: {
    current: 3,
    needed: 10,
    missing: 7,
    improvement: "+28 points",
    suggestions: [
      "Main product photo (white background)",
      "Lifestyle shot (mug in use)",
      "Detail shot (handle and texture)",
      "Size comparison (with common object)",
      "Multiple angles view",
      "Packaging shot",
      "Infographic (dimensions/care instructions)"
    ]
  }
};

export const priorityIssues: PriorityIssue[] = [
  {
    id: 1,
    severity: "critical",
    title: "Missing 7 product photos",
    description: "Etsy listings with 10 photos get 40% more views",
    points: 28,
    category: "photos"
  },
  {
    id: 2,
    severity: "critical",
    title: "Only 3 tags (need 13)",
    description: "Missing tags means missing search opportunities",
    points: 22,
    category: "tags"
  },
  {
    id: 3,
    severity: "high",
    title: "Description too short",
    description: "Comprehensive descriptions rank better and convert more",
    points: 18,
    category: "description"
  },
  {
    id: 4,
    severity: "high",
    title: "Title not optimized",
    description: "Title missing key search terms and gift angles",
    points: 15,
    category: "title"
  }
];
