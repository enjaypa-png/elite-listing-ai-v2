import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create demo users for testing
  const demoUser = await prisma.user.upsert({
    where: { id: 'demo-user-123' },
    update: {},
    create: {
      id: 'demo-user-123',
      email: 'demo@elitelistingai.com',
      name: 'Demo User',
      emailVerified: new Date(),
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'demo@elitelistingai.com' },
    update: {},
    create: {
      email: 'demo@elitelistingai.com',
      name: 'Demo User',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created users:', demoUser.email, user.email);

  // Create a demo shop
  const shop = await prisma.shop.upsert({
    where: {
      userId_platform_platformId: {
        userId: user.id,
        platform: 'shopify',
        platformId: 'demo-shop-123',
      },
    },
    update: {},
    create: {
      userId: user.id,
      name: 'Demo Shopify Store',
      platform: 'shopify',
      platformId: 'demo-shop-123',
      isActive: true,
    },
  });

  console.log('✅ Created shop:', shop.name);

  // Create demo listings
  const listings = await Promise.all([
    prisma.listing.upsert({
      where: {
        shopId_externalId: {
          shopId: shop.id,
          externalId: 'listing-001',
        },
      },
      update: {},
      create: {
        shopId: shop.id,
        externalId: 'listing-001',
        title: 'Vintage Leather Bag',
        description: 'Beautiful vintage leather bag in excellent condition.',
        price: 89.99,
        currency: 'USD',
        images: ['https://example.com/image1.jpg'],
        status: 'published',
      },
    }),
    prisma.listing.upsert({
      where: {
        shopId_externalId: {
          shopId: shop.id,
          externalId: 'listing-002',
        },
      },
      update: {},
      create: {
        shopId: shop.id,
        externalId: 'listing-002',
        title: 'Handmade Ceramic Mug',
        description: 'Artisan ceramic mug, perfect for coffee or tea.',
        price: 24.99,
        currency: 'USD',
        images: ['https://example.com/image2.jpg'],
        status: 'published',
      },
    }),
  ]);

  console.log('✅ Created', listings.length, 'listings');

  // Initialize credit ledger with starting credits for both users
  const creditLedger = await prisma.creditLedger.create({
    data: {
      userId: user.id,
      amount: 100,
      balance: 100,
      type: 'bonus',
      description: 'Welcome bonus credits',
    },
  });

  // Add credits for demo user as well
  const demoCreditLedger = await prisma.creditLedger.create({
    data: {
      userId: demoUser.id,
      amount: 100,
      balance: 100,
      type: 'bonus',
      description: 'Demo user welcome bonus credits',
    },
  });

  console.log('✅ Created credit ledgers - User balance:', creditLedger.balance, 'Demo user balance:', demoCreditLedger.balance);

  // Create a sample optimization
  const optimization = await prisma.optimization.create({
    data: {
      listingId: listings[0].id,
      userId: user.id,
      type: 'full',
      status: 'completed',
      creditsUsed: 10,
      aiModel: 'gpt-4',
      completedAt: new Date(),
      variants: {
        create: [
          {
            variantNumber: 1,
            title: 'Premium Vintage Leather Bag - Timeless Style & Quality',
            description: 'Discover timeless elegance with this stunning vintage leather bag...',
            tags: ['vintage', 'leather', 'bag', 'fashion'],
            score: 92.5,
            reasoning: 'Strong keywords and emotional appeal',
            isSelected: true,
          },
          {
            variantNumber: 2,
            title: 'Authentic Vintage Leather Handbag - Perfect Condition',
            description: 'Elevate your style with this authentic vintage leather handbag...',
            tags: ['vintage', 'leather', 'handbag', 'authentic'],
            score: 88.0,
            reasoning: 'Good keywords with emphasis on authenticity',
          },
        ],
      },
    },
  });

  console.log('✅ Created optimization with variants');

  // Create photo score
  const photoScore = await prisma.photoScore.create({
    data: {
      listingId: listings[0].id,
      imageUrl: listings[0].images[0],
      overallScore: 78.5,
      compositionScore: 82.0,
      lightingScore: 75.0,
      clarityScore: 80.0,
      backgroundScore: 77.0,
      suggestions: [
        'Improve lighting by using natural light',
        'Consider a cleaner background',
        'Add more product angles',
      ],
    },
  });

  console.log('✅ Created photo score:', photoScore.overallScore);

  // Deduct credits for the optimization
  await prisma.creditLedger.create({
    data: {
      userId: user.id,
      amount: -10,
      balance: 90,
      type: 'usage',
      description: 'Listing optimization',
      referenceId: optimization.id,
      referenceType: 'optimization',
    },
  });

  console.log('✅ Updated credit balance');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



