import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import manusDataset from '@/prisma/manusDataset.json';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for seeding

const SEED_TOKEN = process.env.SEED_SECRET_TOKEN || 'SEED123';

// POST /api/internal/seed-keywords?token=SEED123
// Secure endpoint to seed Manus keywords - runs once, idempotent
export async function POST(request: NextRequest) {
  try {
    // Verify secret token
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (token !== SEED_TOKEN) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Unauthorized - invalid token'
        },
        { status: 401 }
      );
    }

    console.log('🌱 Starting Manus keyword database seed...');

    // Check if already seeded
    const existingCount = await prisma.keyword.count();
    if (existingCount > 0) {
      console.log(`ℹ️ Database already has ${existingCount} keywords - running idempotent seed`);
    }

    let totalSeeded = 0;
    const results: any = {};

    // Seed Product Keywords (all 11 categories)
    console.log('Seeding Product Keywords...');
    for (const [category, keywords] of Object.entries(manusDataset.ProductKeywords)) {
      const keywordData = (keywords as string[]).map(kw => ({
        id: `kw_${category}_${kw.replace(/[^a-z0-9]/gi, '_')}`,
        keyword: kw,
        category: 'ProductKeywords',
        subcategory: category,
        type: 'product'
      }));

      const result = await prisma.keyword.createMany({
        data: keywordData,
        skipDuplicates: true
      });

      results[`ProductKeywords_${category}`] = result.count;
      console.log(`  ✓ ${category}: ${result.count} keywords`);
      totalSeeded += result.count;
    }

    // Seed Materials
    console.log('Seeding Materials...');
    if (manusDataset.Materials) {
      const materialData = manusDataset.Materials.map((m: string) => ({
        id: `mat_${m.replace(/[^a-z0-9]/gi, '_')}`,
        keyword: m,
        category: 'Materials',
        type: 'material'
      }));

      const result = await prisma.keyword.createMany({
        data: materialData,
        skipDuplicates: true
      });

      results.Materials = result.count;
      console.log(`  ✓ Materials: ${result.count} items`);
      totalSeeded += result.count;
    }

    // Seed Styles
    console.log('Seeding Styles...');
    if (manusDataset.Styles) {
      const styleData = manusDataset.Styles.map((s: string) => ({
        id: `style_${s.replace(/[^a-z0-9]/gi, '_')}`,
        keyword: s,
        category: 'Styles',
        type: 'style'
      }));

      const result = await prisma.keyword.createMany({
        data: styleData,
        skipDuplicates: true
      });

      results.Styles = result.count;
      console.log(`  ✓ Styles: ${result.count} items`);
      totalSeeded += result.count;
    }

    // Seed Buyer Intent
    console.log('Seeding Buyer Intent...');
    if (manusDataset.BuyerIntent) {
      const intentData = manusDataset.BuyerIntent.map((i: string) => ({
        id: `intent_${i.replace(/[^a-z0-9]/gi, '_')}`,
        keyword: i,
        category: 'BuyerIntent',
        type: 'intent'
      }));

      const result = await prisma.keyword.createMany({
        data: intentData,
        skipDuplicates: true
      });

      results.BuyerIntent = result.count;
      console.log(`  ✓ Buyer Intent: ${result.count} phrases`);
      totalSeeded += result.count;
    }

    // Seed Seasonal
    console.log('Seeding Seasonal Keywords...');
    if (manusDataset.Seasonal) {
      const seasonalData = manusDataset.Seasonal.map((s: string) => ({
        id: `seasonal_${s.replace(/[^a-z0-9]/gi, '_')}`,
        keyword: s,
        category: 'Seasonal',
        type: 'seasonal'
      }));

      const result = await prisma.keyword.createMany({
        data: seasonalData,
        skipDuplicates: true
      });

      results.Seasonal = result.count;
      console.log(`  ✓ Seasonal: ${result.count} keywords`);
      totalSeeded += result.count;
    }

    // Seed Long-Tail Patterns
    console.log('Seeding Long-Tail Patterns...');
    if (manusDataset.Patterns) {
      const patternData = manusDataset.Patterns.map((p: string, index: number) => {
        const variables = extractVariables(p);
        return {
          id: `pattern_${index}_${p.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}`,
          pattern: p,
          variables: variables,
          category: 'general',
          description: `Generate variations using: ${variables.join(', ')}`
        };
      });

      const result = await prisma.longTailPattern.createMany({
        data: patternData,
        skipDuplicates: true
      });

      results.Patterns = result.count;
      console.log(`  ✓ Patterns: ${result.count} templates`);
      totalSeeded += result.count;
    }

    console.log(`\n✅ Seed completed successfully!`);
    console.log(`   Total new keywords seeded: ${totalSeeded}`);

    return NextResponse.json({
      ok: true,
      message: 'Manus keyword database seeded successfully',
      totalSeeded,
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ Error seeding keywords:', error);
    
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'seed_failed',
          message: error.message || 'Failed to seed keywords',
          details: error.toString()
        }
      },
      { status: 500 }
    );
  }
}

function extractVariables(pattern: string): string[] {
  const matches = pattern.match(/\{([^}]+)\}/g);
  if (!matches) return [];
  return matches.map(m => m.replace(/[{}]/g, ''));
}

// GET endpoint for status check
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (token !== SEED_TOKEN) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check seed status
    const [keywordCount, patternCount] = await Promise.all([
      prisma.keyword.count(),
      prisma.longTailPattern.count()
    ]);

    const isSeed = keywordCount > 0 || patternCount > 0;

    return NextResponse.json({
      ok: true,
      seeded: isSeeded,
      keywordCount,
      patternCount,
      status: isSeeded ? 'Database is seeded' : 'Database is empty - ready to seed'
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}
