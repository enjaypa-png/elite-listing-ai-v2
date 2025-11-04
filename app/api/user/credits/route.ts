import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// Structured logging helper
function logInfo(message: string, data?: any) {
  console.log(JSON.stringify({ level: 'info', message, ...data, timestamp: new Date().toISOString() }))
}

function logError(message: string, error?: any) {
  console.error(JSON.stringify({ 
    level: 'error', 
    message, 
    error: error?.message, 
    stack: error?.stack,
    timestamp: new Date().toISOString() 
  }))
}

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    logInfo('Fetching credits', { userId: user.id })

    // Get current balance from most recent ledger entry
    const latestLedger = await prisma.creditLedger.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { balance: true }
    })

    const balance = latestLedger?.balance || 0

    // Get recent transactions (last 10 for UI audit table)
    const recentTransactions = await prisma.creditLedger.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        amount: true,
        balance: true,
        type: true,
        description: true,
        referenceId: true,
        stripePaymentId: true,
        createdAt: true,
        metadata: true
      }
    })

    // Get all-time stats
    const stats = await prisma.creditLedger.groupBy({
      by: ['type'],
      where: { userId: user.id },
      _sum: { amount: true },
      _count: true
    })

    const totalPurchased = stats.find(s => s.type === 'purchase')?._sum.amount || 0
    const totalUsed = Math.abs(stats.find(s => s.type === 'usage')?._sum.amount || 0)
    const totalBonus = stats.find(s => s.type === 'bonus')?._sum.amount || 0

    logInfo('Credits fetched successfully', { 
      userId: user.id, 
      balance, 
      totalPurchased,
      totalUsed 
    })

    return NextResponse.json({
      success: true,
      balance,
      stats: {
        totalPurchased,
        totalUsed,
        totalBonus,
        transactionCount: recentTransactions.length
      },
      recentTransactions: recentTransactions.map((txn) => ({
        id: txn.id,
        amount: txn.amount,
        balanceAfter: txn.balance,
        type: txn.type,
        description: txn.description || '',
        referenceId: txn.referenceId,
        stripePaymentId: txn.stripePaymentId,
        createdAt: txn.createdAt.toISOString()
      }))
    })
  } catch (error: any) {
    logError('Credits fetch error', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch credits' },
      { status: 500 }
    )
  }
}
