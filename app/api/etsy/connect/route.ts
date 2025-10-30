import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { generatePKCE, generateState, buildAuthorizationUrl } from "@/lib/etsy-oauth";
import { prisma } from "@/lib/prisma";

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

    // Generate PKCE and state
    const { codeVerifier, codeChallenge } = generatePKCE();
    const state = generateState();

    // Store PKCE and state in session or database
    // For now, we'll use cookies (in production, use Redis or database)
    const response = NextResponse.redirect(
      buildAuthorizationUrl(codeChallenge, state)
    );

    response.cookies.set("etsy_code_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 600, // 10 minutes
    });

    response.cookies.set("etsy_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 600,
    });

    return response;
  } catch (error: any) {
    console.error("Etsy connect error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Etsy connection" },
      { status: 500 }
    );
  }
}
