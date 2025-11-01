import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { EtsyAPI } from '@/lib/etsy-api';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const ImportRequestSchema = z.object({
  shopId: z.string().min(1, 'Shop ID is required'),
  limit: z.number().min(1).max(100).optional().default(25),
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
    const { shopId, limit } = ImportRequestSchema.parse(body);

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

    if (!shop.isActive) {
      return NextResponse.json(
        { error: 'Shop is not active' },
        { status: 400 }
      );
    }

    // Initialize Etsy API client
    const etsyClient = new EtsyAPI(shop.accessToken);

    // Fetch listings from Etsy
    console.log(`Fetching up to ${limit} listings from shop ${shop.shopName}...`);
    const etsyListings = await etsyClient.getShopListings(
      parseInt(shop.platformShopId),
      limit
    );

    console.log(`Fetched ${etsyListings.length} listings from Etsy`);

    let imported = 0;
    let skipped = 0;
    let updated = 0;

    // Import each listing
    for (const etsyListing of etsyListings) {
      try {
        // Fetch images for this listing
        const images = await etsyClient.getListingImages(etsyListing.listing_id);
        const imageUrls = images.map((img) => img.url_fullxfull);

        // Check if listing already exists
        const existing = await prisma.listing.findUnique({
          where: {
            shopId_platformListingId: {
              shopId: shop.id,
              platformListingId: etsyListing.listing_id.toString(),
            },
          },
        });

        const listingData = {
          title: etsyListing.title,
          description: etsyListing.description || '',
          price: etsyListing.price.amount / etsyListing.price.divisor,
          currency: etsyListing.price.currency_code,
          quantity: etsyListing.quantity,
          status: etsyListing.state,
          url: etsyListing.url,
          imageUrls: imageUrls,
          tags: etsyListing.tags,
          lastSyncedAt: new Date(),
        };

        if (existing) {
          // Update existing listing
          await prisma.listing.update({
            where: { id: existing.id },
            data: listingData,
          });
          updated++;
        } else {
          // Create new listing
          await prisma.listing.create({
            data: {
              ...listingData,
              shopId: shop.id,
              platformListingId: etsyListing.listing_id.toString(),
            },
          });
          imported++;
        }
      } catch (error) {
        console.error(`Failed to import listing ${etsyListing.listing_id}:`, error);
        skipped++;
      }
    }

    console.log(`Import complete: ${imported} new, ${updated} updated, ${skipped} skipped`);

    return NextResponse.json({
      success: true,
      imported,
      updated,
      skipped,
      total: etsyListings.length,
      message: `Successfully imported ${imported} new listings and updated ${updated} existing listings`,
    });
  } catch (error: any) {
    console.error('Import error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    // Check for Etsy API errors
    if (error.message?.includes('Etsy API error')) {
      return NextResponse.json(
        { error: 'Failed to fetch listings from Etsy', details: error.message },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to import listings' },
      { status: 500 }
    );
  }
}
