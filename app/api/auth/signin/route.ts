import { NextRequest, NextResponse } from 'next/server'
import { signIn } from '@/lib/auth-helpers'
import { z } from 'zod'

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = signInSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Sign in user
    const { user, session } = await signIn({ email, password })

    return NextResponse.json(
      {
        success: true,
        message: 'Signed in successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || '',
        },
        session,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Signin error:', error)

    // Generic error for security (don't reveal if email exists)
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid email or password',
      },
      { status: 401 }
    )
  }
}
