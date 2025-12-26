/**
 * ISSUE CATEGORIZATION - Auto-fixable vs Manual
 *
 * Categorizes AI-detected issues into:
 * 1. AUTO-FIXABLE: Can be improved through automated optimization
 * 2. MANUAL: Require re-shooting or manual editing
 */

export interface CategorizedIssues {
  autoFixable: string[];
  manual: string[];
}

export interface CategorizedRecommendations {
  willAutoFix: string[];
  manualSuggestions: string[];
}

/**
 * Keywords that indicate an issue can be fixed by automated optimization
 */
const AUTO_FIXABLE_KEYWORDS = [
  // Technical compliance
  'aspect ratio',
  'resolution',
  'file size',
  'color profile',
  'srgb',
  'dimensions',
  'pixels',
  'compress',

  // Visual enhancements
  'brightness',
  'lighting',
  'dark',
  'underexposed',
  'dim',
  'contrast',
  'flat',
  'dull colors',
  'saturation',
  'sharpness',
  'blur',
  'soft focus',
  'out of focus',
];

/**
 * Keywords that indicate an issue requires manual intervention
 */
const MANUAL_KEYWORDS = [
  // Composition issues
  'product fill',
  'too small',
  'too large',
  'centered',
  'centering',
  'crop',
  'framing',
  'angle',
  'perspective',

  // Background/staging
  'background',
  'clutter',
  'props',
  'staging',
  'messy',
  'distracting',

  // Category requirements
  'scale reference',
  'model',
  'lifestyle',
  'studio shot',
  'detail shot',
  'in use',
  'mockup',
  'room context',

  // Quality issues requiring re-shooting
  'wrinkled',
  'damaged',
  'watermark',
  'text overlay',
];

/**
 * Categorize a single issue as auto-fixable or manual
 */
function categorizeIssue(issue: string): 'auto' | 'manual' {
  const issueLower = issue.toLowerCase();

  // Check for auto-fixable keywords first
  const hasAutoKeyword = AUTO_FIXABLE_KEYWORDS.some(keyword =>
    issueLower.includes(keyword.toLowerCase())
  );

  if (hasAutoKeyword) {
    return 'auto';
  }

  // Check for manual keywords
  const hasManualKeyword = MANUAL_KEYWORDS.some(keyword =>
    issueLower.includes(keyword.toLowerCase())
  );

  if (hasManualKeyword) {
    return 'manual';
  }

  // Default to manual for unknown issues (safer assumption)
  return 'manual';
}

/**
 * Categorize all AI-detected issues
 */
export function categorizeIssues(issues: string[]): CategorizedIssues {
  const autoFixable: string[] = [];
  const manual: string[] = [];

  issues.forEach(issue => {
    const category = categorizeIssue(issue);
    if (category === 'auto') {
      autoFixable.push(issue);
    } else {
      manual.push(issue);
    }
  });

  return { autoFixable, manual };
}

/**
 * Categorize optimization recommendations
 */
export function categorizeRecommendations(recommendations: string[]): CategorizedRecommendations {
  const willAutoFix: string[] = [];
  const manualSuggestions: string[] = [];

  recommendations.forEach(rec => {
    const category = categorizeIssue(rec);
    if (category === 'auto') {
      willAutoFix.push(rec);
    } else {
      manualSuggestions.push(rec);
    }
  });

  return { willAutoFix, manualSuggestions };
}

/**
 * Get user-friendly explanation for each category
 */
export const CATEGORY_EXPLANATIONS = {
  autoFixable: 'These issues will be automatically fixed when you optimize',
  manual: 'These issues require re-shooting or manual editing',
  willAutoFix: 'These improvements will be applied automatically',
  manualSuggestions: 'Consider these improvements for future photos',
};
