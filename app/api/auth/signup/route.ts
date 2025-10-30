import { NextRequest, NextResponse } from 'next/server'
import { signUp } from '@/lib/auth-helpers'
import { z } from 'zod'

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(80, 'Name too long'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = signUpSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      )
    }

    const { email, password, name } = validation.data

    // Create user
    const { user, session } = await signUp({ email, password, name })

    return NextResponse.json(
      {
        success: true,
        message: 'Account created! Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          name,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Signup error:', error)

    // Handle duplicate email
    if (error.message?.includes('already registered')) {
      return NextResponse.json(
        {
          success: false,
          error: 'An account with this email already exists',
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create account',
      },
      { status: 500 }
    )
  }
}
