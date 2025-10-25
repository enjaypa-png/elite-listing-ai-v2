import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EtsyAPI } from "@/lib/etsy-api";
import { refreshAccessToken } from "@/lib/etsy-oauth";

/**
 * Get user's listings from connected shops
 * GET /api/listings
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's connected shops
    const shops = await prisma.shop.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
    });

    if (shops.length === 0) {
      return NextResponse.json({ listings: [], shops: [] });
    }

    const allListings = [];

    for (const shop of shops) {
      try {
        // Check if token is expired
        let accessToken = shop.accessToken;
        if (shop.tokenExpiresAt && shop.tokenExpiresAt < new Date()) {
          // Refresh token
          const clientId = process.env.ETSY_API_KEY;
          if (!clientId || !shop.refreshToken) {
            console.error(`Cannot refresh token for shop ${shop.id}`);
            continue;
          }

          const refreshed = await refreshAccessToken({
            refreshToken: shop.refreshToken,
            clientId,
          });

          // Update tokens in database
          await prisma.shop.update({
            where: { id: shop.id },
            data: {
              accessToken: refreshed.accessToken,
              refreshToken: refreshed.refreshToken,
              tokenExpiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
            },
          });

          accessToken = refreshed.accessToken;
        }

        // Fetch listings from Etsy
        const etsyAPI = new EtsyAPI(accessToken);
        const etsyListings = await etsyAPI.getShopListings(
          parseInt(shop.platformShopId)
        );

        // Store/update listings in database
        for (const etsyListing of etsyListings) {
          // Get listing images
          const images = await etsyAPI.getListingImages(etsyListing.listing_id);

          await prisma.listing.upsert({
            where: {
              shopId_platformListingId: {
                shopId: shop.id,
                platformListingId: etsyListing.listing_id.toString(),
              },
            },
            create: {
              shopId: shop.id,
              platformListingId: etsyListing.listing_id.toString(),
              title: etsyListing.title,
              description: etsyListing.description || "",
              price: etsyListing.price.amount / etsyListing.price.divisor,
              currency: etsyListing.price.currency_code,
              quantity: etsyListing.quantity,
              status: etsyListing.state,
              url: etsyListing.url,
              imageUrls: images.map((img) => img.url_570xN),
              tags: etsyListing.tags,
              lastSyncedAt: new Date(),
            },
            update: {
              title: etsyListing.title,
              description: etsyListing.description || "",
              price: etsyListing.price.amount / etsyListing.price.divisor,
              currency: etsyListing.price.currency_code,
              quantity: etsyListing.quantity,
              status: etsyListing.state,
              url: etsyListing.url,
              imageUrls: images.map((img) => img.url_570xN),
              tags: etsyListing.tags,
              lastSyncedAt: new Date(),
            },
          });
        }

        allListings.push(...etsyListings);
      } catch (error) {
        console.error(`Error fetching listings for shop ${shop.id}:`, error);
      }
    }

    // Get listings from database with shop info
    const dbListings = await prisma.listing.findMany({
      where: {
        shop: {
          userId: session.user.id,
          isActive: true,
        },
      },
      include: {
        shop: true,
      },
      orderBy: {
        lastSyncedAt: "desc",
      },
    });

    return NextResponse.json({
      listings: dbListings,
      shops: shops.map((s) => ({
        id: s.id,
        name: s.shopName,
        platform: s.platform,
        url: s.shopUrl,
      })),
    });
  } catch (error) {
    console.error("Get listings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

