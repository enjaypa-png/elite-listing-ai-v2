import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { exchangeCodeForToken } from "@/lib/etsy-oauth";
import { EtsyAPI } from "@/lib/etsy-api";
import { prisma } from "@/lib/prisma";

/**
 * Handle Etsy OAuth callback
 * GET /api/etsy/callback?code=...&state=...
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/dashboard?error=missing_params", request.url)
      );
    }

    // Verify state (CSRF protection)
    const savedState = request.cookies.get("etsy_oauth_state")?.value;
    if (state !== savedState) {
      return NextResponse.redirect(
        new URL("/dashboard?error=invalid_state", request.url)
      );
    }

    // Get code verifier
    const codeVerifier = request.cookies.get("etsy_oauth_verifier")?.value;
    if (!codeVerifier) {
      return NextResponse.redirect(
        new URL("/dashboard?error=missing_verifier", request.url)
      );
    }

    const clientId = process.env.ETSY_API_KEY;
    const redirectUri =
      process.env.ETSY_REDIRECT_URI ||
      `${process.env.NEXTAUTH_URL}/api/etsy/callback`;

    if (!clientId) {
      return NextResponse.redirect(
        new URL("/dashboard?error=config_error", request.url)
      );
    }

    // Exchange code for tokens
    const { accessToken, refreshToken, expiresIn, userId } =
      await exchangeCodeForToken({
        code,
        clientId,
        redirectUri,
        codeVerifier,
      });

    // Get shop information
    const etsyAPI = new EtsyAPI(accessToken);
    const shops = await etsyAPI.getUserShops(parseInt(userId));

    if (shops.length === 0) {
      return NextResponse.redirect(
        new URL("/dashboard?error=no_shop_found", request.url)
      );
    }

    // For now, take the first shop
    const shop = shops[0];

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Store shop and tokens in database
    await prisma.shop.upsert({
      where: {
        userId_platform_platformShopId: {
          userId: session.user.id,
          platform: "ETSY",
          platformShopId: shop.shop_id.toString(),
        },
      },
      create: {
        userId: session.user.id,
        platform: "ETSY",
        platformShopId: shop.shop_id.toString(),
        shopName: shop.shop_name,
        shopUrl: shop.url,
        accessToken,
        refreshToken,
        tokenExpiresAt: expiresAt,
        isActive: true,
      },
      update: {
        shopName: shop.shop_name,
        shopUrl: shop.url,
        accessToken,
        refreshToken,
        tokenExpiresAt: expiresAt,
        isActive: true,
      },
    });

    // Clear OAuth cookies
    const response = NextResponse.redirect(
      new URL("/dashboard?connected=true", request.url)
    );
    response.cookies.delete("etsy_oauth_state");
    response.cookies.delete("etsy_oauth_verifier");

    return response;
  } catch (error) {
    console.error("Etsy callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard?error=connection_failed", request.url)
    );
  }
}

