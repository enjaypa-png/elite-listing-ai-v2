import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { EtsyAPI } from "@/lib/etsy-api";
import { refreshAccessToken } from "@/lib/etsy-oauth";

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const shopId = searchParams.get("shopId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");

    // Get user's shops
    const where: any = {};
    if (shopId) {
      where.shopId = shopId;
    } else {
      // Get all listings from user's shops
      const userShops = await prisma.shop.findMany({
        where: { userId: user.id },
        select: { id: true },
      });
      where.shopId = { in: userShops.map((s) => s.id) };
    }

    // Fetch listings
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          shop: true,
        },
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      listings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Listings fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
