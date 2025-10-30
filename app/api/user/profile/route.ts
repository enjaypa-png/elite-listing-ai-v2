import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, getCreditBalance } from '@/lib/auth-helpers'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get current user from Supabase Auth
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated',
        },
        { status: 401 }
      )
    }

    // Get user data from database
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
    }

    // Get credit balance
    const credits = await getCreditBalance(user.id)

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: userData?.name || user.user_metadata?.name || '',
          emailVerified: userData?.emailVerified || user.email_confirmed_at,
          credits,
          createdAt: userData?.createdAt || user.created_at,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Profile error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch profile',
      },
      { status: 500 }
    )
  }
}
