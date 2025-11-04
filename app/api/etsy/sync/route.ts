import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { EtsyAPI } from '@/lib/etsy-api';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const runtime = 'nodejs'

const SyncRequestSchema = z.object({
  shopId: z.string().optional(),
  listingId: z.string().optional(),
}).refine(
  (data) => data.shopId || data.listingId,
  { message: 'Either shopId or listingId must be provided' }
);

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
    const { shopId, listingId } = SyncRequestSchema.parse(body);

    if (listingId) {
      // Sync single listing
      return await syncSingleListing(user.id, listingId);
    } else if (shopId) {
      // Sync all listings in shop
      return await syncShopListings(user.id, shopId);
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Sync error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to sync listings' },
      { status: 500 }
    );
  }
}

async function syncSingleListing(userId: string, listingId: string) {
  // Get listing from database
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { shop: true },
  });

  if (!listing || listing.shop.userId !== userId) {
    return NextResponse.json(
      { error: 'Listing not found or access denied' },
      { status: 404 }
    );
  }

  // Initialize Etsy API client
  const etsyClient = new EtsyAPI(listing.shop.accessToken);

  try {
    // Fetch latest data from Etsy
    const etsyListing = await etsyClient.getListing(
      parseInt(listing.platformListingId)
    );
    const images = await etsyClient.getListingImages(
      parseInt(listing.platformListingId)
    );

    // Update listing in database
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        title: etsyListing.title,
        description: etsyListing.description || '',
        price: etsyListing.price.amount / etsyListing.price.divisor,
        currency: etsyListing.price.currency_code,
        quantity: etsyListing.quantity,
        status: etsyListing.state,
        url: etsyListing.url,
        imageUrls: images.map((img) => img.url_fullxfull),
        tags: etsyListing.tags,
        lastSyncedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Listing synced successfully',
      listing: {
        id: listingId,
        title: etsyListing.title,
        lastSyncedAt: new Date(),
      },
    });
  } catch (error: any) {
    console.error(`Failed to sync listing ${listingId}:`, error);
    return NextResponse.json(
      { error: 'Failed to sync listing from Etsy', details: error.message },
      { status: 502 }
    );
  }
}

async function syncShopListings(userId: string, shopId: string) {
  // Get shop from database
  const shop = await prisma.shop.findUnique({
    where: {
      id: shopId,
      userId,
    },
    include: {
      listings: true,
    },
  });

  if (!shop) {
    return NextResponse.json(
      { error: 'Shop not found or access denied' },
      { status: 404 }
    );
  }

  if (!shop.isActive) {
    return NextResponse.json(
      { error: 'Shop is not active' },
      { status: 400 }
    );
  }

  // Initialize Etsy API client
  const etsyClient = new EtsyAPI(shop.accessToken);

  let synced = 0;
  let failed = 0;

  // Sync each listing
  for (const listing of shop.listings) {
    try {
      const etsyListing = await etsyClient.getListing(
        parseInt(listing.platformListingId)
      );
      const images = await etsyClient.getListingImages(
        parseInt(listing.platformListingId)
      );

      await prisma.listing.update({
        where: { id: listing.id },
        data: {
          title: etsyListing.title,
          description: etsyListing.description || '',
          price: etsyListing.price.amount / etsyListing.price.divisor,
          currency: etsyListing.price.currency_code,
          quantity: etsyListing.quantity,
          status: etsyListing.state,
          url: etsyListing.url,
          imageUrls: images.map((img) => img.url_fullxfull),
          tags: etsyListing.tags,
          lastSyncedAt: new Date(),
        },
      });

      synced++;
    } catch (error) {
      console.error(`Failed to sync listing ${listing.id}:`, error);
      failed++;
    }
  }

  return NextResponse.json({
    success: true,
    synced,
    failed,
    total: shop.listings.length,
    message: `Synced ${synced} of ${shop.listings.length} listings`,
  });
}
