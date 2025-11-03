import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Dev-only endpoint to seed test user
 * Creates a user with known credentials for local testing
 */
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Endpoint only available in development' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json().catch(() => ({}))
    
    // Default test user credentials
    const testUser = {
      email: body.email || 'test@elitelistingai.dev',
      name: body.name || 'Test User',
      password: body.password || 'test123', // In real app, would hash this
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: testUser.email }
    }).catch(() => null)

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: 'User already exists',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
        }
      })
    }

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: testUser.email,
        name: testUser.name,
        // In real app, would hash password
        // For now, just store it (DEV ONLY!)
        password: testUser.password,
      }
    })

    // Give test user some initial credits
    await prisma.creditLedger.create({
      data: {
        userId: user.id,
        amount: 50,
        balanceAfter: 50,
        transactionType: 'bonus',
        description: 'Initial dev credits',
        referenceId: `dev_seed_${user.id}_${Date.now()}`,
        metadata: {
          source: 'dev_seed',
          timestamp: new Date().toISOString()
        }
      }
    })

    console.log(JSON.stringify({
      level: 'info',
      message: 'Dev user seeded',
      userId: user.id,
      email: user.email,
      credits: 50,
      timestamp: new Date().toISOString()
    }))

    return NextResponse.json({
      success: true,
      message: 'Test user created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        credits: 50,
      },
      credentials: {
        email: testUser.email,
        password: testUser.password,
        note: 'Save these credentials for testing'
      }
    })

  } catch (error: any) {
    console.error('Seed user error:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Failed to seed user',
        details: error.stack 
      },
      { status: 500 }
    )
  }
}

// GET to check if seed user exists
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Endpoint only available in development' },
      { status: 403 }
    )
  }

  try {
    const testEmail = 'test@elitelistingai.dev'
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    }).catch(() => null)

    if (!user) {
      return NextResponse.json({
        exists: false,
        message: 'Test user not found. POST to /api/dev/seed-user to create.'
      })
    }

    // Get credits
    const latestLedger = await prisma.creditLedger.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { balanceAfter: true }
    }).catch(() => null)

    return NextResponse.json({
      exists: true,
      user: {
        ...user,
        credits: latestLedger?.balanceAfter || 0
      },
      credentials: {
        email: testEmail,
        password: 'test123'
      }
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
