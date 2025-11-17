import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const runtime = 'nodejs';

const ExpandRequestSchema = z.object({
  product: z.string().min(1, 'Product is required'),
  count: z.number().int().min(1).max(50).default(20)
});

// POST /api/keywords/expand - Expand long-tail patterns with product context
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product, count } = ExpandRequestSchema.parse(body);

    // Fetch patterns and keywords to fill them
    const [patterns, materials, styles, intents] = await Promise.all([
      prisma.longTailPattern.findMany({ where: { isActive: true } }),
      prisma.keyword.findMany({ where: { type: 'material', isActive: true }, take: 20 }),
      prisma.keyword.findMany({ where: { type: 'style', isActive: true }, take: 20 }),
      prisma.keyword.findMany({ where: { type: 'intent', isActive: true }, take: 20 })
    ]);

    // Generate expansions
    const expansions: string[] = [];
    const used = new Set<string>();

    // Try each pattern
    for (const pattern of patterns) {
      if (expansions.length >= count) break;

      const variables = pattern.variables as string[];
      
      // Simple variable substitution
      let expanded = pattern.pattern;

      // Replace {product}
      expanded = expanded.replace(/\{product\}/g, product);

      // Replace {material} with random material
      if (variables.includes('material') && materials.length > 0) {
        const randomMaterial = materials[Math.floor(Math.random() * materials.length)];
        expanded = expanded.replace(/\{material\}/g, randomMaterial.keyword);
      }

      // Replace {style} with random style
      if (variables.includes('style') && styles.length > 0) {
        const randomStyle = styles[Math.floor(Math.random() * styles.length)];
        expanded = expanded.replace(/\{style\}/g, randomStyle.keyword);
      }

      // Replace {recipient} with common values
      expanded = expanded.replace(/\{recipient\}/g, ['her', 'him', 'mom', 'dad'][Math.floor(Math.random() * 4)]);

      // Replace {adjective} with common values
      expanded = expanded.replace(/\{adjective\}/g, ['handmade', 'custom', 'unique', 'beautiful'][Math.floor(Math.random() * 4)]);

      // Replace {feature} with common values  
      expanded = expanded.replace(/\{feature\}/g, ['name', 'photo', 'initials', 'message'][Math.floor(Math.random() * 4)]);

      // Replace {event} with common values
      expanded = expanded.replace(/\{event\}/g, ['wedding', 'birthday', 'anniversary', 'christmas'][Math.floor(Math.random() * 4)]);

      // Skip if still has unfilled variables or is duplicate
      if (!expanded.includes('{') && !used.has(expanded)) {
        expansions.push(expanded);
        used.add(expanded);
      }
    }

    return NextResponse.json({
      ok: true,
      expansions: expansions.slice(0, count),
      totalGenerated: expansions.length,
      product
    });

  } catch (error: any) {
    console.error('Error expanding keywords:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'validation_error',
            message: 'Invalid request data',
            details: error.errors
          }
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'internal_error',
          message: error.message || 'Failed to expand keywords'
        }
      },
      { status: 500 }
    );
  }
}
