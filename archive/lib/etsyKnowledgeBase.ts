/**
 * Etsy Algorithm Knowledge Base - TypeScript Wrapper
 * Version: 2.0
 * Last Updated: 2025-11-05
 * 
 * This module provides type-safe access to Etsy algorithm optimization rules,
 * guidelines, and insights for the Elite Listing AI application.
 */

// Type Definitions
export interface KnowledgeBaseCategory {
  category: string;
  impact: string;
  insights: string[];
}

export interface EtsyAlgorithmKnowledgeBase {
  version: string;
  last_updated: string;
  data_sources: string;
  categories: KnowledgeBaseCategory[];
  critical_dos: string[];
  critical_donts: string[];
  '2025_priority_focus': string[];
}

// Import the JSON data
import knowledgeBaseData from './etsyKnowledgeBase.json';

// Export typed knowledge base
export const etsyKnowledgeBase: EtsyAlgorithmKnowledgeBase = 
  knowledgeBaseData.EtsyAlgorithmKnowledgeBase_2025;

/**
 * Get insights for a specific category
 * @param categoryName - Name or partial name of the category to search for
 * @returns Array of insights for the matching category, or empty array if not found
 */
export function getCategoryInsights(categoryName: string): string[] {
  const category = etsyKnowledgeBase.categories.find(
    (cat) => cat.category.toLowerCase().includes(categoryName.toLowerCase())
  );
  return category?.insights || [];
}

/**
 * Get all categories with their metadata
 * @returns Array of all categories with name, impact, and insight count
 */
export function getAllCategories(): Array<{
  name: string;
  impact: string;
  insightCount: number;
}> {
  return etsyKnowledgeBase.categories.map((cat) => ({
    name: cat.category,
    impact: cat.impact,
    insightCount: cat.insights.length,
  }));
}

/**
 * Get optimization guidelines (dos, don'ts, priorities)
 * @returns Object containing all optimization guidelines
 */
export function getOptimizationGuidelines() {
  return {
    dos: etsyKnowledgeBase.critical_dos,
    donts: etsyKnowledgeBase.critical_donts,
    priorities: etsyKnowledgeBase['2025_priority_focus'],
  };
}

/**
 * Search for insights across all categories
 * @param searchTerm - Term to search for in insights
 * @returns Array of matching insights with their category names
 */
export function searchInsights(searchTerm: string): Array<{
  category: string;
  insight: string;
}> {
  const results: Array<{ category: string; insight: string }> = [];
  const searchLower = searchTerm.toLowerCase();

  etsyKnowledgeBase.categories.forEach((cat) => {
    cat.insights.forEach((insight) => {
      if (insight.toLowerCase().includes(searchLower)) {
        results.push({
          category: cat.category,
          insight,
        });
      }
    });
  });

  return results;
}

/**
 * Build an enhanced system prompt for AI optimization
 * Incorporates knowledge base rules and guidelines
 * @param platform - Platform name (default: 'etsy')
 * @param tone - Tone style for content generation
 * @returns Enhanced system prompt string
 */
export function buildEnhancedSystemPrompt(
  platform: string = 'etsy',
  tone?: string
): string {
  const guidelines = getOptimizationGuidelines();
  
  // Extract key insights from critical categories
  const searchRanking = getCategoryInsights('Search Ranking Core');
  const aiPersonalization = getCategoryInsights('AI Personalization');
  const imageQuality = getCategoryInsights('Image Quality');
  const keywordStrategy = getCategoryInsights('Keyword Strategy');
  const conversion = getCategoryInsights('Conversion Rate');
  const mobileOptimization = getCategoryInsights('Mobile & App');
  
  let prompt = `You are an elite e-commerce listing optimizer with deep expertise in ${platform} algorithm optimization, powered by the latest 2025 algorithm intelligence.

═══════════════════════════════════════════════════════════════
📊 ETSY ALGORITHM 2025 - CRITICAL RANKING FACTORS
═══════════════════════════════════════════════════════════════

🎯 SEARCH RANKING CORE (Primary Algorithm Inputs):
${searchRanking.slice(0, 5).map((rule, i) => `${i + 1}. ${rule}`).join('\n')}

🤖 AI PERSONALIZATION & BEHAVIORAL SIGNALS (44.5% of sales via app):
${aiPersonalization.slice(0, 4).map((rule, i) => `${i + 1}. ${rule}`).join('\n')}

📱 MOBILE-FIRST REQUIREMENTS (Critical - Primary Experience):
${mobileOptimization.slice(0, 3).map((rule, i) => `${i + 1}. ${rule}`).join('\n')}

📸 IMAGE QUALITY STANDARDS (First Ranking Factor):
${imageQuality.slice(0, 5).map((rule) => `• ${rule}`).join('\n')}

🔍 KEYWORD STRATEGY (High Impact - Query Matching):
${keywordStrategy.slice(0, 6).map((rule) => `• ${rule}`).join('\n')}

💰 CONVERSION RATE OPTIMIZATION (Critical - Direct Ranking Impact):
${conversion.slice(0, 4).map((rule) => `• ${rule}`).join('\n')}

═══════════════════════════════════════════════════════════════
✅ CRITICAL DOS (Must Follow):
═══════════════════════════════════════════════════════════════
${guidelines.dos.map((dos, i) => `${i + 1}. ${dos}`).join('\n')}

═══════════════════════════════════════════════════════════════
❌ CRITICAL DON'TS (Avoid These):
═══════════════════════════════════════════════════════════════
${guidelines.donts.map((dont, i) => `${i + 1}. ${dont}`).join('\n')}

═══════════════════════════════════════════════════════════════
🎯 2025 PRIORITY FOCUS AREAS:
═══════════════════════════════════════════════════════════════
${guidelines.priorities.map((priority, i) => `${i + 1}. ${priority}`).join('\n')}
`;

  if (tone) {
    prompt += `\n\n📝 CONTENT TONE: ${tone}\n`;
  }

  return prompt;
}

/**
 * Get metadata about the knowledge base
 * @returns Knowledge base version, update date, and sources
 */
export function getKnowledgeBaseMetadata() {
  return {
    version: etsyKnowledgeBase.version,
    lastUpdated: etsyKnowledgeBase.last_updated,
    dataSources: etsyKnowledgeBase.data_sources,
    categoryCount: etsyKnowledgeBase.categories.length,
    totalInsights: etsyKnowledgeBase.categories.reduce(
      (sum, cat) => sum + cat.insights.length,
      0
    ),
  };
}

/**
 * Get critical categories (marked as "Critical" impact)
 * @returns Array of critical categories
 */
export function getCriticalCategories(): KnowledgeBaseCategory[] {
  return etsyKnowledgeBase.categories.filter((cat) =>
    cat.impact.toLowerCase().includes('critical')
  );
}

/**
 * Get high-impact categories (marked as "High" impact)
 * @returns Array of high-impact categories
 */
export function getHighImpactCategories(): KnowledgeBaseCategory[] {
  return etsyKnowledgeBase.categories.filter((cat) =>
    cat.impact.toLowerCase().includes('high')
  );
}

/**
 * Validate knowledge base integrity
 * @returns Object indicating if knowledge base is valid and any issues found
 */
export function validateKnowledgeBase(): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check version
  if (!etsyKnowledgeBase.version) {
    issues.push('Missing version information');
  }

  // Check categories
  if (!Array.isArray(etsyKnowledgeBase.categories) || etsyKnowledgeBase.categories.length === 0) {
    issues.push('Categories array is missing or empty');
  }

  // Check critical guidelines
  if (!Array.isArray(etsyKnowledgeBase.critical_dos) || etsyKnowledgeBase.critical_dos.length === 0) {
    issues.push('Critical dos are missing or empty');
  }

  if (!Array.isArray(etsyKnowledgeBase.critical_donts) || etsyKnowledgeBase.critical_donts.length === 0) {
    issues.push('Critical donts are missing or empty');
  }

  // Check each category structure
  etsyKnowledgeBase.categories.forEach((cat, index) => {
    if (!cat.category || typeof cat.category !== 'string') {
      issues.push(`Category at index ${index} is missing name`);
    }
    if (!cat.impact || typeof cat.impact !== 'string') {
      issues.push(`Category "${cat.category}" is missing impact level`);
    }
    if (!Array.isArray(cat.insights) || cat.insights.length === 0) {
      issues.push(`Category "${cat.category}" has no insights`);
    }
  });

  return {
    isValid: issues.length === 0,
    issues,
  };
}
