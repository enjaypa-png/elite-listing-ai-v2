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
      select: { balanceAfter: true }
    })

    const balance = latestLedger?.balanceAfter || 0

    // Get recent transactions (last 10 for UI audit table)
    const recentTransactions = await prisma.creditLedger.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        amount: true,
        balanceAfter: true,
        transactionType: true,
        description: true,
        referenceId: true,
        stripeSessionId: true,
        createdAt: true,
        metadata: true
      }
    })

    // Get all-time stats
    const stats = await prisma.creditLedger.groupBy({
      by: ['transactionType'],
      where: { userId: user.id },
      _sum: { amount: true },
      _count: true
    })

    const totalPurchased = stats.find(s => s.transactionType === 'purchase')?._sum.amount || 0
    const totalUsed = Math.abs(stats.find(s => s.transactionType === 'usage')?._sum.amount || 0)
    const totalBonus = stats.find(s => s.transactionType === 'bonus')?._sum.amount || 0

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
        balanceAfter: txn.balanceAfter,
        type: txn.transactionType,
        description: txn.description,
        referenceId: txn.referenceId,
        stripeSessionId: txn.stripeSessionId,
        createdAt: txn.createdAt,
        metadata: txn.metadata
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
