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

interface OptimizationRequest {
  title: string;
  description: string;
  tags: string[];
  category?: string;
  price?: number;
  images?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAI();
    console.log('[Optimize Listing] Processing request...');
    const body: OptimizationRequest = await request.json();
    
    const { title, description, tags, category, price, images } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title and description' },
        { status: 400 }
      );
    }

    console.log('[Optimize Listing] Generating optimized titles...');
    
    // Generate 3 optimized title variants
    const titlePrompt = `You are an expert Etsy SEO specialist. Analyze this Etsy listing title and generate 3 optimized variants.

CURRENT TITLE: "${title}"
CATEGORY: ${category || 'General'}
CURRENT TAGS: ${tags.join(', ')}

Requirements for optimized titles:
1. 50-110 characters long
2. Primary keyword at the start
3. Include 2-3 relevant keywords naturally
4. No pipes (|) or excessive punctuation
5. Include material/attribute
6. Add gift angle if appropriate
7. Be descriptive and compelling

Generate 3 title variants with different approaches:
- Variant 1: Focus on primary use case
- Variant 2: Focus on gift angle
- Variant 3: Focus on unique selling proposition

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
}`;

    const titleResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert Etsy SEO specialist with deep knowledge of the 2025 Etsy algorithm.'
        },
        {
          role: 'user',
          content: titlePrompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });

    const titleData = JSON.parse(titleResponse.choices[0].message.content || '{}');

    console.log('[Optimize Listing] Generating optimized tags...');

    // Generate 13 optimized tags
    const tagsPrompt = `Generate 13 optimized Etsy tags for this listing.

TITLE: "${title}"
DESCRIPTION: "${description.substring(0, 300)}..."
CATEGORY: ${category || 'General'}
CURRENT TAGS (${tags.length}): ${tags.join(', ')}

Requirements:
1. Exactly 13 tags
2. Mix of 1-word, 2-word, and 3+ word phrases
3. Include at least 5 long-tail keywords (3+ words)
4. First 3 tags should match primary keywords from title
5. Include regional variants if applicable (jewelry/jewellery)
6. No duplicate tags
7. No category repeats
8. Focus on buyer intent keywords

Format as JSON:
{
  "tags": [
    "tag 1",
    "tag 2",
    ...
  ],
  "reasoning": "explanation of tag strategy"
}`;

    const tagsResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert Etsy SEO specialist with deep knowledge of the 2025 Etsy algorithm.'
        },
        {
          role: 'user',
          content: tagsPrompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });

    const tagsData = JSON.parse(tagsResponse.choices[0].message.content || '{}');

    console.log('[Optimize Listing] Generating optimized description...');

    // Generate optimized description
    const descriptionPrompt = `Rewrite this Etsy listing description to maximize conversions and SEO.

CURRENT DESCRIPTION:
"${description}"

TITLE: "${title}"
CATEGORY: ${category || 'General'}
PRICE: $${price || 'N/A'}

Requirements:
1. 500-1000 characters
2. Include primary keywords in first 2 sentences
3. Use emojis strategically for visual appeal
4. Include sections for:
   - Product details (materials, dimensions)
   - Features & benefits
   - Perfect gift for (if applicable)
   - Care instructions
   - Shipping/packaging info
5. Add a call-to-action at the end
6. Use bullet points for readability
7. Keyword density 1-2%
8. Natural, engaging tone

Format as JSON:
{
  "description": "the full optimized description with formatting",
  "improvements": ["improvement 1", "improvement 2", ...],
  "keywordDensity": "X%"
}`;

    const descriptionResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert Etsy SEO copywriter who creates compelling, conversion-focused product descriptions.'
        },
        {
          role: 'user',
          content: descriptionPrompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const descriptionData = JSON.parse(descriptionResponse.choices[0].message.content || '{}');

    console.log('[Optimize Listing] Optimization complete!');

    // Return optimized content
    return NextResponse.json({
      success: true,
      original: {
        title,
        description,
        tags,
        tagCount: tags.length
      },
      optimized: {
        titles: titleData.titles || [],
        tags: tagsData.tags || [],
        tagsReasoning: tagsData.reasoning || '',
        description: descriptionData.description || '',
        descriptionImprovements: descriptionData.improvements || [],
        keywordDensity: descriptionData.keywordDensity || '0%'
      },
      stats: {
        titleVariants: titleData.titles?.length || 0,
        tagsGenerated: tagsData.tags?.length || 0,
        descriptionLength: descriptionData.description?.length || 0
      }
    });

  } catch (error: any) {
    console.error('[Optimize Listing] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to optimize listing' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: '/api/optimize/listing',
    method: 'POST',
    description: 'Generates optimized title, tags, and description for Etsy listings',
    requiredFields: ['title', 'description'],
    optionalFields: ['tags', 'category', 'price', 'images'],
    hasApiKey: !!process.env.OPENAI_API_KEY
  });
}
