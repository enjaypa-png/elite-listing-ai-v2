import { NextResponse } from 'next/server';
import {
  etsyKnowledgeBase,
  getAllCategories,
  getOptimizationGuidelines,
  getKnowledgeBaseMetadata,
  getCriticalCategories,
  getHighImpactCategories,
  validateKnowledgeBase,
  searchInsights,
  getCategoryInsights,
} from '@/lib/etsyKnowledgeBase';

export const runtime = 'nodejs';

/**
 * GET /api/knowledge-base
 * Returns information about the Etsy Algorithm Knowledge Base
 * 
 * Query Parameters:
 * - ?action=metadata     - Get version, update date, and stats
 * - ?action=categories   - Get all categories with counts
 * - ?action=guidelines   - Get dos, don'ts, and priorities
 * - ?action=critical     - Get only critical categories
 * - ?action=validate     - Validate knowledge base integrity
 * - ?action=search&q=    - Search insights (e.g., ?action=search&q=shipping)
 * - ?action=category&name= - Get specific category insights
 * 
 * Default (no params): Returns full overview
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const query = searchParams.get('q');
    const categoryName = searchParams.get('name');

    // Handle different actions
    switch (action) {
      case 'metadata':
        return NextResponse.json({
          ok: true,
          data: getKnowledgeBaseMetadata(),
        });

      case 'categories':
        return NextResponse.json({
          ok: true,
          data: {
            categories: getAllCategories(),
            total: getAllCategories().length,
          },
        });

      case 'guidelines':
        return NextResponse.json({
          ok: true,
          data: getOptimizationGuidelines(),
        });

      case 'critical':
        return NextResponse.json({
          ok: true,
          data: {
            categories: getCriticalCategories(),
            count: getCriticalCategories().length,
          },
        });

      case 'high-impact':
        return NextResponse.json({
          ok: true,
          data: {
            categories: getHighImpactCategories(),
            count: getHighImpactCategories().length,
          },
        });

      case 'validate':
        const validation = validateKnowledgeBase();
        return NextResponse.json({
          ok: validation.isValid,
          data: validation,
          message: validation.isValid
            ? 'Knowledge base is valid'
            : 'Knowledge base has issues',
        });

      case 'search':
        if (!query) {
          return NextResponse.json(
            {
              ok: false,
              error: 'Search query parameter "q" is required',
            },
            { status: 400 }
          );
        }
        const searchResults = searchInsights(query);
        return NextResponse.json({
          ok: true,
          data: {
            query,
            results: searchResults,
            count: searchResults.length,
          },
        });

      case 'category':
        if (!categoryName) {
          return NextResponse.json(
            {
              ok: false,
              error: 'Category name parameter "name" is required',
            },
            { status: 400 }
          );
        }
        const insights = getCategoryInsights(categoryName);
        return NextResponse.json({
          ok: true,
          data: {
            categoryName,
            insights,
            count: insights.length,
            found: insights.length > 0,
          },
        });

      default:
        // Default: Return full overview
        const metadata = getKnowledgeBaseMetadata();
        const guidelines = getOptimizationGuidelines();
        const categories = getAllCategories();
        const criticalCount = getCriticalCategories().length;
        const highImpactCount = getHighImpactCategories().length;

        return NextResponse.json({
          ok: true,
          message: 'Etsy Algorithm Knowledge Base loaded successfully',
          data: {
            metadata,
            statistics: {
              totalCategories: categories.length,
              criticalCategories: criticalCount,
              highImpactCategories: highImpactCount,
              totalInsights: metadata.totalInsights,
              totalDos: guidelines.dos.length,
              totalDonts: guidelines.donts.length,
              priorities: guidelines.priorities.length,
            },
            categories: categories.map((cat) => ({
              name: cat.name,
              impact: cat.impact,
              insightCount: cat.insightCount,
            })),
            guidelines: {
              dosPreview: guidelines.dos.slice(0, 3),
              dontsPreview: guidelines.donts.slice(0, 3),
              priorities: guidelines.priorities,
            },
            availableActions: [
              'metadata - Get KB version and stats',
              'categories - List all categories',
              'guidelines - Get all dos/donts/priorities',
              'critical - Get critical categories only',
              'high-impact - Get high-impact categories',
              'validate - Check KB integrity',
              'search&q=term - Search insights',
              'category&name=term - Get category insights',
            ],
          },
        });
    }
  } catch (error: any) {
    console.error('Error loading knowledge base:', error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          message: 'Failed to load knowledge base',
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}
