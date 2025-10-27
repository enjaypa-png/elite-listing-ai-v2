import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required").max(80, "Name must be less than 80 characters"),
});

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  
  try {
    const body = await request.json();
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json(
        { error: firstError.message, requestId },
        { status: 400 }
      );
    }

    const { email, password, name } = parsed.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists", requestId },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name.trim(),
      },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        requestId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(`[${requestId}] Sign up error:`, error);
    
    // Handle Prisma constraint errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "User already exists", requestId },
        { status: 409 }
      );
    }
    
    // Handle Prisma validation errors
    if (error.code === 'P2011' || error.code === 'P2012') {
      return NextResponse.json(
        { error: "Invalid data provided", requestId },
        { status: 400 }
      );
    }

    // Handle database connection errors
    if (error.code === 'P1001' || error.code === 'P1002') {
      return NextResponse.json(
        { 
          error: "Database connection failed. Please try again later.", 
          requestId 
        },
        { status: 502 }
      );
    }

    // Unknown errors - return 502 with request ID for tracking
    return NextResponse.json(
      { 
        error: "Failed to create account. Please try again.", 
        requestId 
      },
      { status: 502 }
    );
  }
}

