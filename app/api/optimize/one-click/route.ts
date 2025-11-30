import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface OneClickRequest {
  listingId: string;
  title: string;
  description: string;
  tags: string[];
  images?: string[];
  price?: number;
  category?: string;
  fullOptimization: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: OneClickRequest = await request.json();
    const { listingId, title, description, tags, images, price, category } = body;

    console.log('[One-Click] Processing listing:', listingId);
    console.log('[One-Click] Running all 6 modules...');

    // Run all 6 modules in parallel for speed
    const [titleResult, tagsResult, descriptionResult, imagesResult, pricingResult, seoResult] = await Promise.all([
      // 1. Title Optimization
      openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Etsy SEO specialist optimizing titles.'
          },
          {
            role: 'user',
            content: `Generate 3 optimized Etsy title variants:

Current: "${title}"
Category: ${category || 'General'}

Format as JSON with titles array containing text, approach, keywords, reasoning.`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8
      }),

      // 2. Tags Optimization
      openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Etsy SEO specialist optimizing tags.'
          },
          {
            role: 'user',
            content: `Generate 13 optimized tags:

Title: "${title}"
Category: ${category || 'General'}
Current: ${tags.join(', ')}

Format as JSON with tags array and reasoning.`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8
      }),

      // 3. Description Optimization
      openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Etsy copywriter optimizing descriptions.'
          },
          {
            role: 'user',
            content: `Rewrite this description for conversions:

Current: "${description}"
Title: "${title}"
Price: $${price || 'N/A'}

Format as JSON with description, improvements, keywordDensity.`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      }),

      // 4. Image Recommendations
      openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Etsy product photography consultant.'
          },
          {
            role: 'user',
            content: `Analyze image requirements for:

Product: "${title}"
Category: ${category || 'General'}
Current Images: ${images?.length || 0}

Provide recommendations for:
- Number of photos needed (Etsy allows 10)
- Shot types (lifestyle, detail, size, etc.)
- Composition tips
- Lighting suggestions

Format as JSON:
{
  "currentCount": ${images?.length || 0},
  "recommendedCount": 10,
  "missingShots": ["shot type 1", "shot type 2"],
  "recommendations": ["rec1", "rec2", "rec3"],
  "priorityActions": ["action1", "action2"]
}`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      }),

      // 5. Pricing Recommendations
      openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an Etsy pricing strategist focusing on competitive positioning and perceived value.'
          },
          {
            role: 'user',
            content: `Provide pricing recommendations:

Product: "${title}"
Current Price: $${price || 'N/A'}
Category: ${category || 'General'}

Consider:
- Category norms
- Perceived value signals
- Competitive positioning
- Psychological pricing

Format as JSON:
{
  "currentPrice": ${price || 0},
  "recommendedRange": {
    "min": 0,
    "optimal": 0,
    "max": 0
  },
  "reasoning": "explanation",
  "pricingTips": ["tip1", "tip2", "tip3"]
}`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      }),

      // 6. SEO Boost
      openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an Etsy SEO expert providing comprehensive ranking optimization.'
          },
          {
            role: 'user',
            content: `Complete SEO analysis and recommendations:

Title: "${title}"
Tags: ${tags.join(', ')}
Category: ${category || 'General'}

Based on 2025 Etsy ranking factors (relevance, freshness, conversion, category, image quality, pricing competitiveness), provide:
- Overall SEO score estimate (0-100)
- Top 5 priority actions
- Keyword opportunities
- Category optimization
- Freshness boost strategies

Format as JSON:
{
  "estimatedScore": 75,
  "priorityActions": ["action1", "action2", "action3", "action4", "action5"],
  "keywordOpportunities": ["keyword1", "keyword2"],
  "categoryOptimization": "advice",
  "freshnessStrategies": ["strategy1", "strategy2"]
}`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      })
    ]);

    // Parse all results
    const titleData = JSON.parse(titleResult.choices[0].message.content || '{}');
    const tagsData = JSON.parse(tagsResult.choices[0].message.content || '{}');
    const descriptionData = JSON.parse(descriptionResult.choices[0].message.content || '{}');
    const imagesData = JSON.parse(imagesResult.choices[0].message.content || '{}');
    const pricingData = JSON.parse(pricingResult.choices[0].message.content || '{}');
    const seoData = JSON.parse(seoResult.choices[0].message.content || '{}');

    console.log('[One-Click] All 6 modules complete');

    return NextResponse.json({
      success: true,
      listingId,
      optimized: {
        // Module 1: Title
        titles: titleData.titles || [],
        
        // Module 2: Tags
        tags: tagsData.tags || [],
        tagsReasoning: tagsData.reasoning || '',
        
        // Module 3: Description
        description: descriptionData.description || '',
        descriptionImprovements: descriptionData.improvements || [],
        keywordDensity: descriptionData.keywordDensity || '0%',
        
        // Module 4: Images
        images: {
          currentCount: imagesData.currentCount || 0,
          recommendedCount: imagesData.recommendedCount || 10,
          missingShots: imagesData.missingShots || [],
          recommendations: imagesData.recommendations || [],
          priorityActions: imagesData.priorityActions || []
        },
        
        // Module 5: Pricing
        pricing: {
          currentPrice: pricingData.currentPrice || price || 0,
          recommendedRange: pricingData.recommendedRange || { min: 0, optimal: 0, max: 0 },
          reasoning: pricingData.reasoning || '',
          pricingTips: pricingData.pricingTips || []
        },
        
        // Module 6: SEO Boost
        seoBoost: {
          estimatedScore: seoData.estimatedScore || 0,
          priorityActions: seoData.priorityActions || [],
          keywordOpportunities: seoData.keywordOpportunities || [],
          categoryOptimization: seoData.categoryOptimization || '',
          freshnessStrategies: seoData.freshnessStrategies || []
        }
      },
      stats: {
        modulesRun: 6,
        processingTime: 'parallel',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('[One-Click] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to run One-Click optimization'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: '/api/optimize/one-click',
    method: 'POST',
    description: 'Runs all 6 optimization modules (Title, Tags, Description, Images, Pricing, SEO Boost)',
    requiredFields: ['listingId', 'title', 'description', 'tags', 'fullOptimization'],
    optionalFields: ['images', 'price', 'category'],
    modules: ['title', 'tags', 'description', 'images', 'pricing', 'seoBoost'],
    hasApiKey: !!process.env.OPENAI_API_KEY
  });
}
