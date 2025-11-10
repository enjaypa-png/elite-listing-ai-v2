import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface KeywordData {
  keyword: string;
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
  intent: 'purchase' | 'discovery' | 'gifting' | 'seasonal';
  relevanceScore: number;
  keywordScore: number;
  ctrPotential: number;
  conversionPotential: number;
  algorithmFit: string;
}

interface KeywordGenerationResponse {
  ok: boolean;
  primaryKeywords: KeywordData[];
  secondaryKeywords: KeywordData[];
  totalKeywords: number;
  averageRelevance: number;
  topIntent: string;
  suggestions: string[];
  algorithmInsights: {
    listingQualityImpact: string;
    expectedCTR: string;
    competitivenessLevel: string;
    optimizationTips: string[];
  };
}

// Helper function to calculate keyword score based on 285-point system
function calculateKeywordScore(
  searchVolume: number,
  ctrPotential: number,
  competitionDensity: number,
  conversionPotential: number
): number {
  // Weighted formula aligned with Etsy's algorithm:
  // - CTR (30%): Click potential
  // - Conversion (25%): Buyer intent
  // - Volume (25%): Search demand
  // - Competition (20%): Ranking difficulty
  const rawScore = 
    (ctrPotential * 0.30) + 
    (conversionPotential * 0.25) + 
    ((searchVolume / 10) * 0.25) + 
    ((100 - competitionDensity) / 100 * 100 * 0.20);
  
  return Math.min(100, Math.round(rawScore));
}

// Helper function to determine competition level
function getCompetitionLevel(competitorCount: number): 'low' | 'medium' | 'high' {
  if (competitorCount < 50) return 'low';
  if (competitorCount < 200) return 'medium';
  return 'high';
}

// Helper function to get competition density score
function getCompetitionDensity(competition: 'low' | 'medium' | 'high'): number {
  switch (competition) {
    case 'low': return 25;
    case 'medium': return 55;
    case 'high': return 85;
  }
}

export async function POST(request: NextRequest) {
  // Check for API key first
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set');
    return NextResponse.json(
      { 
        ok: false, 
        error: 'OpenAI API key not configured',
        details: 'OPENAI_API_KEY environment variable is missing'
      },
      { status: 500 }
    );
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  try {
    const body = await request.json();
    const { title, description, category, platform = 'Etsy' } = body;

    if (!title || !description) {
      return NextResponse.json(
        { ok: false, error: 'Title and description are required' },
        { status: 400 }
      );
    }

    console.log('Generating keywords with 285-point optimization for:', { title, category, platform });

    // Enhanced prompt with 285-point system knowledge
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert Etsy SEO specialist with deep knowledge of Etsy's 2025 algorithm (285-point ranking system).

═══════════════════════════════════════════════════════════════
ETSY 2025 ALGORITHM PRIORITIES (285 POINTS TOTAL):
═══════════════════════════════════════════════════════════════

1. LISTING QUALITY SCORE (30% weight - 85 points)
   - CTR (Click-Through Rate): ~2% is competitive
   - Conversion rate: 3%+ competitive, 4%+ excellent
   - Image quality, favorites, sales velocity

2. CONVERSION RATE (25% weight - 71 points)
   - Primary driver: Buyer intent keywords
   - Formula: Orders ÷ Visits × 100
   - Target: 3-4%+

3. CUSTOMER EXPERIENCE (15% weight - 43 points)
   - Reviews, <24hr response, on-time shipping

4. RECENCY (10% weight - 29 points)
   - New listings get temporary boost

5. SHIPPING PRICE (8% weight - 23 points)
   - US domestic <$6 gets ranking boost

6. CLICK-THROUGH RATE (7% weight - 20 points)
   - Mobile app = 44%+ traffic
   - Thumbnails must work at small sizes

7. SHOP PERFORMANCE (3% weight - 9 points)
8. PERSONALIZATION (2% weight - 6 points)

═══════════════════════════════════════════════════════════════
KEYWORD GENERATION STRATEGY:
═══════════════════════════════════════════════════════════════

**PRIMARY KEYWORDS (5-7 keywords):**
- HIGH buyer intent (e.g., "gift for mom", "personalized wedding")
- Multi-word phrases (perform better than single words)
- Front-load primary keyword for titles
- Focus on conversion potential (not just volume)

**SECONDARY KEYWORDS (10-13 keywords):**
- Long-tail variations for niche targeting
- Style/aesthetic descriptors
- Occasion/gift angles
- Material/feature specific terms

**INTENT CLASSIFICATION:**
- **purchase**: High conversion intent ("buy", "custom", "personalized")
- **gifting**: Gift-oriented ("gift for", "birthday", "anniversary")
- **discovery**: Browsing/inspiration ("unique", "modern", "boho")
- **seasonal**: Time-sensitive ("christmas", "summer", "holiday")

**CRITICAL RULES:**
1. Prioritize BUYER INTENT over search volume
2. Multi-word phrases > single words
3. Include gift angles (major buyer motivation)
4. Consider mobile thumbnail effectiveness
5. Balance broad + specific terms

**SCORING CRITERIA:**
- **searchVolume**: 1-1000 scale (realistic Etsy search demand)
- **ctrPotential**: 0-100 (will buyers click on this?)
- **conversionPotential**: 0-100 (will they buy after clicking?)
- **competition**: low/medium/high (ranking difficulty)
- **relevanceScore**: 0-100 (match to product)
- **algorithmFit**: How this keyword aligns with Etsy's ranking factors

OUTPUT FORMAT (JSON):
{
  "primaryKeywords": [
    {
      "keyword": "personalized wedding gift",
      "searchVolume": 850,
      "competition": "medium",
      "intent": "gifting",
      "relevanceScore": 95,
      "ctrPotential": 85,
      "conversionPotential": 90,
      "algorithmFit": "High buyer intent + gift angle = strong conversion signal for Etsy algorithm"
    }
  ],
  "secondaryKeywords": [...],
  "algorithmInsights": {
    "expectedCTR": "2.3% (above Etsy average)",
    "competitivenessLevel": "Medium - achievable with good photos and pricing",
    "optimizationTips": [
      "Front-load 'personalized wedding' in title",
      "Ensure photos work as mobile thumbnails",
      "Price competitively for gift market"
    ]
  }
}`,
        },
        {
          role: 'user',
          content: `Generate Etsy-optimized keywords with 285-point algorithm awareness:

TITLE: ${title}

DESCRIPTION: ${description}

${category ? `CATEGORY: ${category}` : ''}

Generate:
- 5-7 PRIMARY keywords (high buyer intent, conversion-focused)
- 10-13 SECONDARY keywords (long-tail, niche targeting)

Prioritize:
1. Buyer intent over volume
2. Gift angles (major Etsy motivation)
3. Multi-word phrases
4. Mobile CTR potential
5. Conversion likelihood

Include algorithmInsights explaining Etsy 2025 algorithm fit.`,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const aiResponse = completion.choices[0].message.content;
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    const keywordData = JSON.parse(aiResponse);

    // Calculate keyword scores with enhanced formula
    const processKeywords = (keywords: any[]): KeywordData[] => {
      return keywords.map((kw) => {
        const competitionDensity = getCompetitionDensity(kw.competition);
        const keywordScore = calculateKeywordScore(
          kw.searchVolume,
          kw.ctrPotential,
          competitionDensity,
          kw.conversionPotential || 70 // Default if not provided
        );

        return {
          ...kw,
          keywordScore,
          conversionPotential: kw.conversionPotential || 70,
        };
      });
    };

    const primaryKeywords = processKeywords(keywordData.primaryKeywords || []);
    const secondaryKeywords = processKeywords(keywordData.secondaryKeywords || []);

    // Calculate aggregate metrics
    const allKeywords = [...primaryKeywords, ...secondaryKeywords];
    const averageRelevance = Math.round(
      allKeywords.reduce((sum, kw) => sum + kw.relevanceScore, 0) / allKeywords.length
    );

    // Determine top intent
    const intentCounts: Record<string, number> = {};
    allKeywords.forEach((kw) => {
      intentCounts[kw.intent] = (intentCounts[kw.intent] || 0) + 1;
    });
    const topIntent = Object.entries(intentCounts).sort((a, b) => b[1] - a[1])[0][0];

    // Generate 285-point aware suggestions
    const suggestions: string[] = [];
    
    const giftKeywords = allKeywords.filter(kw => kw.intent === 'gifting');
    if (giftKeywords.length < 3) {
      suggestions.push('Add 2-3 more gift-oriented keywords (major Etsy buyer motivation)');
    }
    
    const highConversionKeywords = allKeywords.filter(kw => kw.conversionPotential >= 80);
    if (highConversionKeywords.length < 5) {
      suggestions.push('Prioritize high buyer-intent keywords for better conversion rate (25% algorithm weight)');
    }
    
    const highCompetitionCount = allKeywords.filter(kw => kw.competition === 'high').length;
    if (highCompetitionCount > 5) {
      suggestions.push('Too many high-competition keywords - add long-tail variations for better ranking');
    }

    const avgCTR = Math.round(allKeywords.reduce((sum, kw) => sum + kw.ctrPotential, 0) / allKeywords.length);
    if (avgCTR < 70) {
      suggestions.push('CTR potential below target - ensure keywords create compelling titles (CTR = 30% of algorithm)');
    }

    if (primaryKeywords.length < 5) {
      suggestions.push('Add more primary keywords to maximize title/tag optimization');
    }

    if (suggestions.length === 0) {
      suggestions.push('✓ Excellent keyword strategy - aligned with Etsy 2025 algorithm priorities!');
    }

    const response: KeywordGenerationResponse = {
      ok: true,
      primaryKeywords: primaryKeywords.sort((a, b) => b.keywordScore - a.keywordScore),
      secondaryKeywords: secondaryKeywords.sort((a, b) => b.keywordScore - a.keywordScore),
      totalKeywords: allKeywords.length,
      averageRelevance,
      topIntent,
      suggestions,
      algorithmInsights: keywordData.algorithmInsights || {
        listingQualityImpact: 'Moderate - depends on image quality and conversion rate',
        expectedCTR: `${(avgCTR / 50).toFixed(1)}% (${avgCTR >= 70 ? 'above' : 'below'} 2% target)`,
        competitivenessLevel: highCompetitionCount > 5 ? 'High' : highCompetitionCount > 2 ? 'Medium' : 'Low',
        optimizationTips: [
          'Use primary keyword in first 5 words of title',
          'Ensure photos work as mobile thumbnails (44% of traffic)',
          'Target 3-4% conversion rate for algorithm boost'
        ]
      },
    };

    console.log('Generated 285-point optimized keywords:', {
      primary: primaryKeywords.length,
      secondary: secondaryKeywords.length,
      avgRelevance: averageRelevance,
      avgCTR: avgCTR,
      topIntent: topIntent
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Keyword generation error:', error);
    
    // Enhanced error logging
    const errorDetails = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      name: error.name,
      apiKeyConfigured: !!process.env.OPENAI_API_KEY
    };
    
    console.error('Full error details:', JSON.stringify(errorDetails, null, 2));
    
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Failed to generate keywords',
        details: error.name === 'OpenAIError' ? 'OpenAI API error - check API key and quota' : error.message,
        hasApiKey: !!process.env.OPENAI_API_KEY
      },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: '/api/keywords/generate',
    status: 'ready',
    hasApiKey: !!process.env.OPENAI_API_KEY,
    model: 'gpt-4o',
    features: [
      '285-point algorithm integration',
      'Buyer intent prioritization',
      'Gift angle optimization',
      'Mobile CTR focus',
      'Conversion-weighted scoring'
    ]
  });
}
