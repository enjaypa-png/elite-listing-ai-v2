import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/auth-simple";

export async function GET(request: NextRequest) {
  const userId = request.cookies.get("user_id")?.value;

  if (!userId) {
    return NextResponse.json({ ok: false, user: null });
  }

  const user = await getUserById(userId);

  if (!user) {
    return NextResponse.json({ ok: false, user: null });
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    }
  });
}

