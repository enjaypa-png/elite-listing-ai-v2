import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Lazy initialization to avoid build-time errors
let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openai;
}

interface ModularRequest {
  title: string;
  description: string;
  tags: string[];
  category?: string;
  price?: number;
  modules: {
    title: boolean;
    tags: boolean;
    description: boolean;
    seoBoost: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ModularRequest = await request.json();
    const { title, description, tags, category, price, modules } = body;

    console.log('[Optimize Modular] Modules:', modules);
    console.log('[Optimize Modular] Input:', { title: title.substring(0, 50), tags: tags.length });

    const openai = getOpenAI();
    const results: any = {
      success: true,
      optimized: {}
    };

    // Optimize Title (if selected)
    if (modules.title) {
      console.log('[Optimize Modular] Generating titles...');
      const titleResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Etsy SEO specialist. Generate optimized listing titles based on 2025 Etsy algorithm factors: relevance matching, keyword density, exact-match phrasing, conversion-oriented language, and freshness.'
          },
          {
            role: 'user',
            content: `Generate 3 optimized Etsy title variants for this listing:

Current Title: "${title}"
Category: ${category || 'General'}
Current Tags: ${tags.join(', ')}

Requirements:
- 50-110 characters
- Primary keyword at start
- Include 2-3 relevant keywords naturally
- No pipes or excessive punctuation
- Include material/attribute where applicable
- Conversion-focused phrasing

Format as JSON:
{
  "titles": [
    {
      "text": "optimized title 1",
      "approach": "Primary use case",
      "keywords": ["keyword1", "keyword2"],
      "reasoning": "why this works"
    },
    {
      "text": "optimized title 2",
      "approach": "Gift angle",
      "keywords": ["keyword1", "keyword2"],
      "reasoning": "why this works"
    },
    {
      "text": "optimized title 3",
      "approach": "Unique selling proposition",
      "keywords": ["keyword1", "keyword2"],
      "reasoning": "why this works"
    }
  ]
}`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8
      });

      const titleData = JSON.parse(titleResponse.choices[0].message.content || '{}');
      results.optimized.titles = titleData.titles || [];
    }

    // Optimize Tags (if selected)
    if (modules.tags) {
      console.log('[Optimize Modular] Generating tags...');
      const tagsResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Etsy SEO specialist. Generate optimized tags based on relevance matching, exact-match phrasing, long-tail keywords, and buyer intent.'
          },
          {
            role: 'user',
            content: `Generate 13 optimized Etsy tags for this listing:

Title: "${title}"
Description: "${description.substring(0, 300)}..."
Category: ${category || 'General'}
Current Tags: ${tags.join(', ')}

Requirements:
- Exactly 13 tags
- Mix of 1-word, 2-word, and 3+ word phrases
- Include at least 5 long-tail keywords (3+ words)
- First 3 tags should match primary keywords from title
- Focus on buyer intent keywords
- No duplicate tags

Format as JSON:
{
  "tags": ["tag1", "tag2", "tag3", ...],
  "reasoning": "explanation of tag strategy"
}`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8
      });

      const tagsData = JSON.parse(tagsResponse.choices[0].message.content || '{}');
      results.optimized.tags = tagsData.tags || [];
      results.optimized.tagsReasoning = tagsData.reasoning || '';
    }

    // Optimize Description (if selected)
    if (modules.description) {
      console.log('[Optimize Modular] Generating description...');
      const descriptionResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Etsy copywriter. Create conversion-focused descriptions with natural keyword integration, clear structure, and buyer-oriented language.'
          },
          {
            role: 'user',
            content: `Rewrite this Etsy listing description for maximum conversions and SEO:

Current Description: "${description}"
Title: "${title}"
Category: ${category || 'General'}
Price: $${price || 'N/A'}

Requirements:
- 500-1000 characters
- Include primary keywords in first 2 sentences
- Sections: product details, features & benefits, care instructions
- Natural keyword density 1-2%
- Engaging, conversion-oriented tone
- Bullet points for readability
- Call-to-action at end

Format as JSON:
{
  "description": "the full optimized description",
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "keywordDensity": "1.5%"
}`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      });

      const descriptionData = JSON.parse(descriptionResponse.choices[0].message.content || '{}');
      results.optimized.description = descriptionData.description || '';
      results.optimized.descriptionImprovements = descriptionData.improvements || [];
      results.optimized.keywordDensity = descriptionData.keywordDensity || '0%';
    }

    // SEO Boost (if selected)
    if (modules.seoBoost) {
      console.log('[Optimize Modular] Applying SEO boost...');
      const seoResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an Etsy SEO expert. Provide actionable SEO recommendations based on current ranking factors.'
          },
          {
            role: 'user',
            content: `Provide SEO recommendations for this Etsy listing:

Title: "${title}"
Tags: ${tags.join(', ')}
Category: ${category || 'General'}

Based on 2025 Etsy algorithm factors (relevance, freshness, conversion, category correctness), provide:
- Top 3 SEO improvements
- Keyword opportunities
- Category optimization tips

Format as JSON:
{
  "recommendations": ["rec1", "rec2", "rec3"],
  "keywordOpportunities": ["keyword1", "keyword2"],
  "categoryTips": "category-specific advice"
}`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      });

      const seoData = JSON.parse(seoResponse.choices[0].message.content || '{}');
      results.optimized.seoBoost = {
        recommendations: seoData.recommendations || [],
        keywordOpportunities: seoData.keywordOpportunities || [],
        categoryTips: seoData.categoryTips || ''
      };
    }

    console.log('[Optimize Modular] Complete');
    return NextResponse.json(results);

  } catch (error: any) {
    console.error('[Optimize Modular] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to optimize listing'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: '/api/optimize-modular',
    method: 'POST',
    description: 'Optimizes selected modules (title, tags, description, seoBoost) for Etsy listings',
    requiredFields: ['title', 'description', 'tags', 'modules'],
    hasApiKey: !!process.env.OPENAI_API_KEY
  });
}
