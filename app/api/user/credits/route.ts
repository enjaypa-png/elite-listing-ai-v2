import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get credit balance
    const balanceResult = await prisma.creditLedger.aggregate({
      where: { userId: user.id },
      _sum: { amount: true },
    });

    const balance = balanceResult._sum.amount || 0;

    // Get recent transactions (last 50)
    const transactions = await prisma.creditLedger.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      balance,
      transactions: transactions.map((txn) => ({
        id: txn.id,
        amount: txn.amount,
        balance: txn.balance,
        type: txn.type,
        description: txn.description,
        referenceId: txn.referenceId,
        referenceType: txn.referenceType,
        createdAt: txn.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Credits fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch credits' },
      { status: 500 }
    );
  }
}
