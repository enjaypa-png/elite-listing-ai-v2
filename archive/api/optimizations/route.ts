import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-helpers';

export const runtime = 'nodejs'

// Query schema for pagination
const OptimizationsQuerySchema = z.object({
  limit: z.string().optional().default('10'),
  cursor: z.string().optional(), // Last optimization ID for cursor-based pagination
});

/**
 * GET /api/optimizations
 * Fetch user's optimization history with pagination
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: 'unauthorized', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    
    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = OptimizationsQuerySchema.parse({
      limit: searchParams.get('limit') || '10',
      cursor: searchParams.get('cursor') || undefined,
    });
    
    const limit = parseInt(query.limit, 10);
    const cursor = query.cursor;
    
    // 3. Build query with cursor pagination
    const where = { userId: user.id };
    const orderBy = { createdAt: 'desc' as const };
    
    const optimizations = await prisma.optimization.findMany({
      where,
      include: {
        variants: {
          orderBy: { variantNumber: 'asc' },
        },
        listing: {
          select: {
            id: true,
            title: true,
            platformListingId: true,
          },
        },
      },
      orderBy,
      take: limit + 1, // Fetch one extra to check if there are more
      ...(cursor && {
        skip: 1,
        cursor: {
          id: cursor,
        },
      }),
    });
    
    // 4. Check if there are more results
    const hasMore = optimizations.length > limit;
    const results = hasMore ? optimizations.slice(0, limit) : optimizations;
    const nextCursor = hasMore ? results[results.length - 1].id : null;
    
    // 5. Format response
    return NextResponse.json({
      ok: true,
      optimizations: results.map((opt) => ({
        id: opt.id,
        type: opt.type,
        status: opt.status,
        creditsUsed: opt.creditsUsed,
        aiModel: opt.aiModel,
        originalContent: opt.originalContent,
        result: opt.result,
        errorMessage: opt.errorMessage,
        createdAt: opt.createdAt.toISOString(),
        completedAt: opt.completedAt?.toISOString() || null,
        listing: opt.listing || null,
        variants: opt.variants.map((v) => ({
          id: v.id,
          variantNumber: v.variantNumber,
          title: v.title,
          description: v.description,
          tags: v.tags,
          score: v.score,
          reasoning: v.reasoning,
          metadata: v.metadata,
          isSelected: v.isSelected,
          createdAt: v.createdAt.toISOString(),
        })),
      })),
      pagination: {
        limit,
        hasMore,
        nextCursor,
      },
    });
    
  } catch (error: any) {
    console.error('Error fetching optimizations:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'validation_error',
            message: 'Invalid query parameters',
            details: error.issues,
          },
        },
        { status: 400 }
      );
    }
    
    // Generic error
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'internal_error',
          message: error.message || 'Failed to fetch optimizations',
        },
      },
      { status: 500 }
    );
  }
}
