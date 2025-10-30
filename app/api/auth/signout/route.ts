import { NextRequest, NextResponse } from 'next/server'
import { signOut } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    await signOut()

    return NextResponse.json(
      {
        success: true,
        message: 'Signed out successfully',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Signout error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to sign out',
      },
      { status: 500 }
    )
  }
}
