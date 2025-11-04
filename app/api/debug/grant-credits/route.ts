import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs'

// Request schema
const GrantCreditsSchema = z.object({
  amount: z.number().int().positive().max(1000),
  userId: z.string().optional(), // Optional: if not provided, creates a test user
  key: z.string().min(1, 'Debug key required'),
});

/**
 * DEBUG ONLY: Grant credits to user without payment
 * POST /api/debug/grant-credits
 * Body: { amount: number, userId?: string, key: string }
 * 
 * REMOVE THIS ENDPOINT BEFORE PRODUCTION
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json();
    const { amount, userId, key } = GrantCreditsSchema.parse(body);
    
    // Verify debug key
    const debugKey = process.env.DEBUG_GRANT_CREDITS_KEY;
    if (!debugKey) {
      return NextResponse.json(
        { ok: false, error: 'Debug endpoint disabled - DEBUG_GRANT_CREDITS_KEY not set' },
        { status: 403 }
      );
    }
    
    if (key !== debugKey) {
      return NextResponse.json(
        { ok: false, error: 'Invalid debug key' },
        { status: 403 }
      );
    }
    
    // Find or create user
    let targetUserId = userId;
    if (!targetUserId) {
      // Create test user if not provided
      const testUser = await prisma.user.upsert({
        where: { email: 'test@elitelistingai.com' },
        update: {},
        create: {
          email: 'test@elitelistingai.com',
          name: 'Test User',
        },
      });
      targetUserId = testUser.id;
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    });
    
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get current balance
    const lastLedgerEntry = await prisma.creditLedger.findFirst({
      where: { userId: targetUserId },
      orderBy: { createdAt: 'desc' },
    });
    
    const currentBalance = lastLedgerEntry?.balance || 0;
    
    // Create idempotency key
    const idempotencyKey = `debug_grant_${targetUserId}_${amount}_${Date.now()}`;
    
    // Check for duplicate (idempotency)
    const existing = await prisma.creditLedger.findFirst({
      where: {
        userId: targetUserId,
        referenceId: idempotencyKey,
        type: 'bonus',
      },
    });
    
    if (existing) {
      console.log(`[DEBUG] Idempotency hit: ${idempotencyKey} already processed`);
      return NextResponse.json({
        ok: true,
        duplicate: true,
        message: 'Credits already granted (idempotency)',
        ledgerId: existing.id,
        userId: targetUserId,
        amount,
        previousBalance: currentBalance,
        newBalance: existing.balance,
      });
    }
    
    // Create credit ledger entry
    const ledgerEntry = await prisma.creditLedger.create({
      data: {
        userId: targetUserId,
        amount,
        balance: currentBalance + amount,
        type: 'bonus',
        description: `Debug credit grant (+${amount} credits)`,
        referenceId: idempotencyKey,
        referenceType: 'debug_grant',
        metadata: {
          grantedAt: new Date().toISOString(),
          previousBalance: currentBalance,
          debugKey: 'used',
        },
      },
    });
    
    console.log(`[DEBUG] Granted ${amount} credits to user ${targetUserId}, new balance: ${ledgerEntry.balance}`);
    
    return NextResponse.json({
      ok: true,
      duplicate: false,
      message: `Successfully granted ${amount} credits`,
      ledgerId: ledgerEntry.id,
      userId: targetUserId,
      userEmail: user.email,
      amount,
      previousBalance: currentBalance,
      newBalance: ledgerEntry.balance,
      idempotencyKey,
    });
    
  } catch (error: any) {
    console.error('[DEBUG] Error granting credits:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Validation error',
          details: error.issues,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Failed to grant credits',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check if debug endpoint is enabled
export async function GET() {
  const enabled = !!process.env.DEBUG_GRANT_CREDITS_KEY;
  
  return NextResponse.json({
    ok: true,
    enabled,
    message: enabled 
      ? 'Debug endpoint is enabled. POST { amount, userId?, key } to grant credits.' 
      : 'Debug endpoint disabled. Set DEBUG_GRANT_CREDITS_KEY to enable.',
    warning: 'REMOVE THIS ENDPOINT BEFORE PRODUCTION',
  });
}
