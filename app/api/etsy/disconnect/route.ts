import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const DisconnectRequestSchema = z.object({
  shopId: z.string().min(1, 'Shop ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse request
    const body = await request.json();
    const { shopId } = DisconnectRequestSchema.parse(body);

    // Get shop from database
    const shop = await prisma.shop.findUnique({
      where: {
        id: shopId,
        userId: user.id, // Ensure user owns this shop
      },
    });

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found or access denied' },
        { status: 404 }
      );
    }

    // Deactivate shop (don't delete to preserve data)
    await prisma.shop.update({
      where: { id: shopId },
      data: {
        isActive: false,
        accessToken: '', // Clear token
        refreshToken: null,
        tokenExpiresAt: null,
      },
    });

    console.log(`Shop ${shop.shopName} disconnected for user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Shop disconnected successfully',
    });
  } catch (error: any) {
    console.error('Disconnect error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to disconnect shop' },
      { status: 500 }
    );
  }
}
