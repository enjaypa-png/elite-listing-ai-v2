import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { exchangeCodeForToken } from "@/lib/etsy-oauth";
import { EtsyAPI } from "@/lib/etsy-api";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      return NextResponse.json(
        { error: "Missing code or state parameter" },
        { status: 400 }
      );
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);

    // Get shop info from Etsy
    const etsyAPI = new EtsyAPI(tokenData.access_token);
    const shopData = await etsyAPI.getShop();

    // Save shop to database
    await prisma.shop.create({
      data: {
        userId: user.id,
        platform: "ETSY",
        platformShopId: shopData.shop_id,
        shopName: shopData.shop_name,
        shopUrl: shopData.url,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      },
    });

    // Redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error: any) {
    console.error("Etsy callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard?error=etsy_connection_failed", request.url)
    );
  }
}
