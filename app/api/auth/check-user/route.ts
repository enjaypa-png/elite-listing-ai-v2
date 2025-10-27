import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const checkUserSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return NextResponse.json(
      { exists: !!user },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Check user error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to check user", 
        requestId: crypto.randomUUID() 
      },
      { status: 502 }
    );
  }
}

