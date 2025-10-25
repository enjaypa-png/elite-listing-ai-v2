import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY must be defined');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Helper functions for Stripe operations
export const stripeHelpers = {
  // Create a checkout session for credit purchase
  async createCheckoutSession(params: {
    userId: string;
    userEmail: string;
    packageType: string;
    credits: number;
    price: number;
    successUrl: string;
    cancelUrl: string;
  }) {
    return await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${params.credits} Credits`,
              description: `${params.packageType} package - ${params.credits} Elite Listing AI credits`,
            },
            unit_amount: params.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      client_reference_id: params.userId,
      customer_email: params.userEmail,
      metadata: {
        userId: params.userId,
        packageType: params.packageType,
        credits: params.credits.toString(),
      },
    });
  },

  // Retrieve a checkout session
  async getCheckoutSession(sessionId: string) {
    return await stripe.checkout.sessions.retrieve(sessionId);
  },

  // Create a customer
  async createCustomer(email: string, name?: string) {
    return await stripe.customers.create({
      email,
      name,
      metadata: {
        source: 'elite-listing-ai',
      },
    });
  },

  // Create a refund
  async createRefund(paymentIntentId: string, amount?: number) {
    return await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
    });
  },
};



