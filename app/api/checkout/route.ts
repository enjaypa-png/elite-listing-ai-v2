import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { stripeHelpers } from '@/lib/stripe';
import { z } from 'zod';

// Credit packages
const CREDIT_PACKAGES = {
  starter: {
    credits: 10,
    price: 900, // $9.00 in cents
    name: 'Starter',
  },
  pro: {
    credits: 50,
    price: 3900, // $39.00 in cents
    name: 'Pro',
    savings: 13,
  },
  business: {
    credits: 200,
    price: 12900, // $129.00 in cents
    name: 'Business',
    savings: 19,
  },
};

const CheckoutRequestSchema = z.object({
  package: z.enum(['starter', 'pro', 'business']),
});

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const { package: packageType } = CheckoutRequestSchema.parse(body);

    const packageInfo = CREDIT_PACKAGES[packageType];
    if (!packageInfo) {
      return NextResponse.json(
        { error: 'Invalid package type' },
        { status: 400 }
      );
    }

    // Get base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

    // Generate idempotency key for this purchase
    const idempotencyKey = `checkout_${user.id}_${packageType}_${Date.now()}`

    // Create Stripe checkout session with metadata for webhook
    const session = await stripeHelpers.createCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      packageType: packageInfo.name,
      credits: packageInfo.credits,
      price: packageInfo.price,
      successUrl: `${baseUrl}/dashboard?payment=success`,
      cancelUrl: `${baseUrl}/dashboard?payment=cancelled`,
      metadata: {
        user_id: user.id,
        package_type: packageType,
        credits: packageInfo.credits.toString(),
        idempotency_key: idempotencyKey,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve package info
export async function GET() {
  return NextResponse.json({
    packages: CREDIT_PACKAGES,
  });
}
