import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const runtime = 'nodejs'

const ListingsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('25'),
  shopId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const { page, limit, shopId } = ListingsQuerySchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '25',
      shopId: searchParams.get('shopId') || undefined,
    });

    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 100); // Max 100 per page
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      shop: {
        userId: user.id,
      },
    };

    if (shopId) {
      where.shopId = shopId;
    }

    // Get listings with pagination
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { lastSyncedAt: 'desc' },
        include: {
          shop: {
            select: {
              id: true,
              shopName: true,
              platform: true,
            },
          },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      listings: listings.map((listing) => ({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        currency: listing.currency,
        quantity: listing.quantity,
        status: listing.status,
        url: listing.url,
        imageUrls: listing.imageUrls,
        tags: listing.tags,
        shop: listing.shop,
        lastSyncedAt: listing.lastSyncedAt,
        createdAt: listing.createdAt,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Listings fetch error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}
