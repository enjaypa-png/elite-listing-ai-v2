import { NextRequest, NextResponse } from "next/server";
import { createOrGetUser } from "@/lib/auth-simple";
import { z } from "zod";

const signinSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = signinSchema.parse(body);

    const user = await createOrGetUser(email);

    // In a real app, you'd use proper session management
    // For MVP, we'll use a simple approach
    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    });

    // Set a simple cookie (in production, use proper JWT/session tokens)
    response.cookies.set("user_id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Sign in error:", error);
    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}

