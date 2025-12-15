import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// GET /api/keywords/patterns - Return all long-tail keyword patterns
export async function GET(request: NextRequest) {
  try {
    // Fetch all patterns
    const patterns = await prisma.longTailPattern.findMany({
      where: { isActive: true },
      orderBy: { pattern: 'asc' }
    });

    return NextResponse.json({
      ok: true,
      patterns: patterns.map(p => ({
        id: p.id,
        pattern: p.pattern,
        variables: p.variables,
        description: p.description,
        category: p.category
      })),
      totalPatterns: patterns.length
    });

  } catch (error: any) {
    console.error('Error fetching patterns:', error);

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'internal_error',
          message: error.message || 'Failed to fetch patterns'
        }
      },
      { status: 500 }
    );
  }
}
