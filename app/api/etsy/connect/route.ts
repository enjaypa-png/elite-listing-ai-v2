import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generatePKCE, generateState, buildAuthorizationUrl } from "@/lib/etsy-oauth";
import { prisma } from "@/lib/prisma";

/**
 * Initiate Etsy OAuth flow
 * GET /api/etsy/connect
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for required environment variables
    const clientId = process.env.ETSY_API_KEY;
    const redirectUri = process.env.ETSY_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/etsy/callback`;

    if (!clientId) {
      return NextResponse.json(
        { error: "Etsy API credentials not configured" },
        { status: 500 }
      );
    }

    // Generate PKCE parameters
    const { codeVerifier, codeChallenge } = generatePKCE();
    const state = generateState();

    // Store PKCE verifier and state in session/database for verification
    // For now, we'll use a temporary storage approach
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        // Store in a JSON field or create a separate OAuthState table
        // For simplicity, we'll add this to the user record temporarily
        // In production, use a dedicated session store or database table
      },
    });

    // For now, store in cookies (temporary solution)
    const response = NextResponse.redirect(
      buildAuthorizationUrl({
        clientId,
        redirectUri,
        state,
        codeChallenge,
        scopes: ["listings_r", "listings_w", "shops_r", "transactions_r"],
      })
    );

    // Set secure cookies for state and code verifier
    response.cookies.set("etsy_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    });

    response.cookies.set("etsy_oauth_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error("Etsy connect error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Etsy connection" },
      { status: 500 }
    );
  }
}

