import { PrismaClient } from '@prisma/client';
import manusDataset from './manusDataset.json';

const prisma = new PrismaClient();

async function seedKeywords() {
  console.log('🌱 Starting Manus keyword database seed...');

  try {
    let totalSeeded = 0;

    // Seed Product Keywords (all 11 categories)
    console.log('Seeding Product Keywords...');
    for (const [category, keywords] of Object.entries(manusDataset.ProductKeywords)) {
      const keywordData = (keywords as string[]).map(kw => ({
        keyword: kw,
        category: 'ProductKeywords',
        subcategory: category,
        type: 'product'
      }));

      const result = await prisma.keyword.createMany({
        data: keywordData,
        skipDuplicates: true
      });

      console.log(`  ✓ ${category}: ${result.count} keywords`);
      totalSeeded += result.count;
    }

    // Seed Materials
    console.log('Seeding Materials...');
    if (manusDataset.Materials) {
      const materialData = manusDataset.Materials.map(m => ({
        keyword: m,
        category: 'Materials',
        type: 'material'
      }));

      const result = await prisma.keyword.createMany({
        data: materialData,
        skipDuplicates: true
      });

      console.log(`  ✓ Materials: ${result.count} items`);
      totalSeeded += result.count;
    }

    // Seed Styles
    console.log('Seeding Styles...');
    if (manusDataset.Styles) {
      const styleData = manusDataset.Styles.map(s => ({
        keyword: s,
        category: 'Styles',
        type: 'style'
      }));

      const result = await prisma.keyword.createMany({
        data: styleData,
        skipDuplicates: true
      });

      console.log(`  ✓ Styles: ${result.count} items`);
      totalSeeded += result.count;
    }

    // Seed Buyer Intent
    console.log('Seeding Buyer Intent...');
    if (manusDataset.BuyerIntent) {
      const intentData = manusDataset.BuyerIntent.map(i => ({
        keyword: i,
        category: 'BuyerIntent',
        type: 'intent'
      }));

      const result = await prisma.keyword.createMany({
        data: intentData,
        skipDuplicates: true
      });

      console.log(`  ✓ Buyer Intent: ${result.count} phrases`);
      totalSeeded += result.count;
    }

    // Seed Seasonal
    console.log('Seeding Seasonal Keywords...');
    if (manusDataset.Seasonal) {
      const seasonalData = manusDataset.Seasonal.map(s => ({
        keyword: s,
        category: 'Seasonal',
        type: 'seasonal'
      }));

      const result = await prisma.keyword.createMany({
        data: seasonalData,
        skipDuplicates: true
      });

      console.log(`  ✓ Seasonal: ${result.count} keywords`);
      totalSeeded += result.count;
    }

    // Seed Long-Tail Patterns
    console.log('Seeding Long-Tail Patterns...');
    if (manusDataset.Patterns) {
      const patternData = manusDataset.Patterns.map(p => {
        const variables = extractVariables(p);
        return {
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

      console.log(`  ✓ Patterns: ${result.count} templates`);
      totalSeeded += result.count;
    }

    console.log(`\n✅ Seed completed successfully!`);
    console.log(`   Total keywords seeded: ${totalSeeded}`);
    
  } catch (error) {
    console.error('❌ Error seeding keywords:', error);
    throw error;
  }
}

function extractVariables(pattern: string): string[] {
  const matches = pattern.match(/\{([^}]+)\}/g);
  if (!matches) return [];
  return matches.map(m => m.replace(/[{}]/g, ''));
}

// Run seed
seedKeywords()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
