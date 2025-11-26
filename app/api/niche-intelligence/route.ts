import { NextRequest, NextResponse } from 'next/server';
import { analyzeNiches, analyzeCategoryBenchmarks } from '@/lib/niche-analyzer';

export async function POST(request: NextRequest) {
  try {
    const { keywords, category, productType } = await request.json();

    if (!keywords || !Array.isArray(keywords)) {
      return NextResponse.json(
        { error: 'Invalid keywords data' },
        { status: 400 }
      );
    }

    const niches = analyzeNiches(keywords, category, productType);
    const benchmarks = analyzeCategoryBenchmarks(keywords, category);

    const elasticity = {
      score: 7.5,
      adjacentCategories: [
        { name: 'Home Decor', strength: 8 },
        { name: 'Kitchen & Dining', strength: 9 },
        { name: 'Gifts', strength: 6 },
      ],
    };

    const topPerformers = [
      {
        title: 'Example Top Listing',
        price: 24.99,
        reviews: 1234,
        keywords: ['handmade', 'ceramic', 'unique'],
      },
    ];

    const blueprint = {
      recommendedPrice: '$22-28',
      keyMaterials: ['ceramic', 'stoneware'],
      topKeywords: keywords.slice(0, 5).map((k: any) => k.keyword),
      shippingTime: '3-5 business days',
      photoTips: ['White background', 'Multiple angles', 'Lifestyle shots'],
    };

    return NextResponse.json({
      success: true,
      benchmarks,
      niches,
      elasticity,
      topPerformers,
      blueprint,
    });
  } catch (error) {
    console.error('Niche intelligence error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze niches' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    status: 'Niche Intelligence API ready',
  });
}
