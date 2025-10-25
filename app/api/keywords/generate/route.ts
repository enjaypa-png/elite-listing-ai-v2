import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface KeywordData {
  keyword: string;
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
  intent: 'purchase' | 'discovery' | 'gifting' | 'seasonal';
  relevanceScore: number;
  keywordScore: number;
  ctrPotential: number;
}

interface KeywordGenerationResponse {
  ok: boolean;
  primaryKeywords: KeywordData[];
  secondaryKeywords: KeywordData[];
  totalKeywords: number;
  averageRelevance: number;
  topIntent: string;
  suggestions: string[];
}

// Helper function to calculate keyword score
function calculateKeywordScore(
  searchVolume: number,
  ctrPotential: number,
  competitionDensity: number
): number {
  // Formula from spec: (Search Volume × CTR Potential) ÷ Competition Density
  // Normalize to 0-100 scale
  const rawScore = (searchVolume * ctrPotential) / Math.max(competitionDensity, 1);
  return Math.min(100, Math.round(rawScore / 10));
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
    case 'medium': return 100;
    case 'high': return 300;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, platform = 'Etsy' } = body;

    if (!title || !description) {
      return NextResponse.json(
        { ok: false, error: 'Title and description are required' },
        { status: 400 }
      );
    }

    console.log('Generating keywords for:', { title, category, platform });

    // Use OpenAI to extract and generate keywords
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert Etsy SEO and keyword research specialist. Your task is to generate optimized keywords for ${platform} listings.

KEYWORD GENERATION RULES:
1. Extract relevant keywords from the product title and description
2. Generate additional high-value keywords based on product category and features
3. Include a mix of:
   - High-volume primary keywords (5-7 keywords)
   - Long-tail secondary keywords (10-13 keywords)
   - Niche-specific keywords (2-3 keywords)
4. Classify each keyword by intent:
   - purchase: buyer-ready keywords (e.g., "buy ceramic mug", "handmade pottery")
   - discovery: browsing keywords (e.g., "unique drinkware", "artisan crafts")
   - gifting: gift-oriented keywords (e.g., "gift for mom", "birthday present")
   - seasonal: time-sensitive keywords (e.g., "christmas decor", "summer fashion")
5. Estimate search volume (1-1000 scale based on keyword popularity)
6. Estimate competition level (low/medium/high based on keyword specificity)
7. Calculate relevance score (0-100) based on how well the keyword matches the product

OUTPUT FORMAT (JSON):
{
  "primaryKeywords": [
    {
      "keyword": "handmade ceramic mug",
      "searchVolume": 850,
      "competition": "medium",
      "intent": "purchase",
      "relevanceScore": 95,
      "ctrPotential": 85
    }
  ],
  "secondaryKeywords": [
    {
      "keyword": "blue glaze pottery cup",
      "searchVolume": 320,
      "competition": "low",
      "intent": "discovery",
      "relevanceScore": 88,
      "ctrPotential": 75
    }
  ]
}`,
        },
        {
          role: 'user',
          content: `Generate optimized keywords for this ${platform} listing:

TITLE: ${title}

DESCRIPTION: ${description}

${category ? `CATEGORY: ${category}` : ''}

Generate 5-7 primary keywords and 10-13 secondary keywords. Ensure semantic diversity and avoid duplicates.`,
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

    // Calculate keyword scores for all keywords
    const processKeywords = (keywords: any[]): KeywordData[] => {
      return keywords.map((kw) => {
        const competitionDensity = getCompetitionDensity(kw.competition);
        const keywordScore = calculateKeywordScore(
          kw.searchVolume,
          kw.ctrPotential,
          competitionDensity
        );

        return {
          ...kw,
          keywordScore,
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

    // Generate suggestions
    const suggestions: string[] = [];
    
    if (averageRelevance < 70) {
      suggestions.push('Consider refining your product description to better match target keywords');
    }
    
    const highCompetitionCount = allKeywords.filter(kw => kw.competition === 'high').length;
    if (highCompetitionCount > 5) {
      suggestions.push('Too many high-competition keywords - consider adding more long-tail variations');
    }
    
    const lowVolumeCount = allKeywords.filter(kw => kw.searchVolume < 100).length;
    if (lowVolumeCount > 10) {
      suggestions.push('Many low-volume keywords detected - balance with higher-volume terms');
    }

    if (primaryKeywords.length < 5) {
      suggestions.push('Add more primary keywords to increase search visibility');
    }

    if (suggestions.length === 0) {
      suggestions.push('Excellent keyword balance - ready to use in your listing');
    }

    const response: KeywordGenerationResponse = {
      ok: true,
      primaryKeywords: primaryKeywords.sort((a, b) => b.keywordScore - a.keywordScore),
      secondaryKeywords: secondaryKeywords.sort((a, b) => b.keywordScore - a.keywordScore),
      totalKeywords: allKeywords.length,
      averageRelevance,
      topIntent,
      suggestions,
    };

    console.log('Generated keywords:', {
      primary: primaryKeywords.length,
      secondary: secondaryKeywords.length,
      avgRelevance: averageRelevance,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Keyword generation error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Failed to generate keywords',
      },
      { status: 500 }
    );
  }
}

