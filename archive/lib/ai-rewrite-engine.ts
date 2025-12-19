import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface RewriteSuggestion {
  type: 'title' | 'tags' | 'description';
  original: string;
  suggestions: {
    text: string;
    reasoning: string;
    pointsGained: number;
    improvements: string[];
  }[];
  impact: {
    estimatedCTRIncrease: string;
    estimatedRankingImprovement: string;
  };
}

export async function generateRewriteSuggestions(
  component: 'title' | 'tags' | 'description',
  originalContent: string,
  issues: string[],
  productCategory: string,
  primaryKeywords: string[]
): Promise<RewriteSuggestion> {
  
  const prompt = `You are an Etsy SEO expert. Generate 3 optimized rewrites for this ${component}.

ORIGINAL ${component.toUpperCase()}:
${originalContent}

DETECTED ISSUES:
${issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

PRODUCT CATEGORY: ${productCategory}
PRIMARY KEYWORDS: ${primaryKeywords.join(', ')}

ETSY-SPECIFIC RULES TO FOLLOW:
${component === 'title' ? `
- Max 140 characters (aim for 110-130)
- Primary keyword in first 3 words
- Use pipes (|) to separate key phrases
- No keyword stuffing
- Include 2-3 long-tail keywords
- Make it scannable and clickable
` : ''}
${component === 'tags' ? `
- Must provide exactly 13 tags
- Each tag can be 2-3 words (20 char max)
- Mix of broad and specific terms
- Include long-tail variations
- First 3 tags should match title keywords
- No single-word tags
` : ''}
${component === 'description' ? `
- 500-1000 characters ideal
- Keyword density 1-2%
- Include benefits, not just features
- Add emotional appeal
- Use bullet points for readability
- Include dimensions, materials, uses
` : ''}

Generate 3 variations, ranked from best to good. For EACH suggestion provide:

1. THE REWRITTEN TEXT
2. SPECIFIC REASONING (why this version is better)
3. ESTIMATED POINTS GAINED (be specific, e.g., "+8 points")
4. LIST OF IMPROVEMENTS (3-5 bullet points)

Also provide IMPACT ESTIMATE:
- Estimated CTR increase (e.g., "+15-20%")
- Estimated ranking improvement (e.g., "Move from #47 to #12-18")

Respond in JSON format:
{
  "suggestions": [
    {
      "text": "rewritten content here",
      "reasoning": "detailed explanation",
      "pointsGained": 12,
      "improvements": ["improvement 1", "improvement 2", ...]
    }
  ],
  "impact": {
    "estimatedCTRIncrease": "+15-20%",
    "estimatedRankingImprovement": "Move from #47 to #12-18"
  }
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  // Parse JSON from response
  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    type: component,
    original: originalContent,
    suggestions: parsed.suggestions,
    impact: parsed.impact,
  };
}
