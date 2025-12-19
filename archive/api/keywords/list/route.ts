import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// GET /api/keywords/list - Return all keywords grouped by category
export async function GET(request: NextRequest) {
  try {
    // Fetch all keywords
    const keywords = await prisma.keyword.findMany({
      where: { isActive: true },
      orderBy: { keyword: 'asc' }
    });

    // Group by category and subcategory
    const grouped: Record<string, any> = {};

    for (const kw of keywords) {
      if (!grouped[kw.category]) {
        grouped[kw.category] = {};
      }

      if (kw.subcategory) {
        if (!grouped[kw.category][kw.subcategory]) {
          grouped[kw.category][kw.subcategory] = [];
        }
        grouped[kw.category][kw.subcategory].push(kw.keyword);
      } else {
        if (!grouped[kw.category]['all']) {
          grouped[kw.category]['all'] = [];
        }
        grouped[kw.category]['all'].push(kw.keyword);
      }
    }

    return NextResponse.json({
      ok: true,
      categories: grouped,
      totalKeywords: keywords.length
    });

  } catch (error: any) {
    console.error('Error fetching keywords:', error);

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'internal_error',
          message: error.message || 'Failed to fetch keywords'
        }
      },
      { status: 500 }
    );
  }
}
