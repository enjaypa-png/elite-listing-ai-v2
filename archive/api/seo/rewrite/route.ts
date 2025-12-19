import { NextRequest, NextResponse } from 'next/server';
import { generateRewriteSuggestions } from '@/lib/ai-rewrite-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { component, content, issues, category, keywords } = body;

    if (!component || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const suggestions = await generateRewriteSuggestions(
      component,
      content,
      issues || [],
      category || 'Unknown',
      keywords || []
    );

    return NextResponse.json({
      success: true,
      data: suggestions,
    });
  } catch (error: any) {
    console.error('Rewrite generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    status: 'AI Rewrite Engine ready',
    model: 'claude-sonnet-4',
    hasApiKey: !!process.env.ANTHROPIC_API_KEY,
  });
}
