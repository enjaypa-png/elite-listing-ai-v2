import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface SEOAuditRequest {
  platform: string;
  title: string;
  description: string;
  tags: string;
  category?: string;
  price?: number;
  imageUrl?: string;
  photoCount?: number;
}

interface SEOIssue {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  issue: string;
  suggestion: string;
  impact: string;
  pointsLost: number;
}

interface SEOAuditResult {
  overallScore: number;
  maxScore: number;
  percentage: number;
  categoryScores: {
    titleOptimization: { score: number; max: number };
    descriptionQuality: { score: number; max: number };
    tagEffectiveness: { score: number; max: number };
    imageOptimization: { score: number; max: number };
    pricingStrategy: { score: number; max: number };
    metadataCompleteness: { score: number; max: number };
  };
  issues: SEOIssue[];
  strengths: string[];
  recommendations: string[];
  algorithmBreakdown: {
    listingQualityScore: string;
    conversionPotential: string;
    customerExperience: string;
    overallRanking: string;
  };
  detailedAnalysis: {
    keywordDensity: number;
    readabilityScore: number;
    titleLength: number;
    descriptionLength: number;
    tagCount: number;
    primaryKeywordPosition: number;
    buyerIntentScore: number;
    mobileOptimizationScore: number;
  };
}

// Analyze title with 285-point system
function analyzeTitleOptimization(title: string, platform: string): { score: number; max: number; issues: SEOIssue[] } {
  const issues: SEOIssue[] = [];
  let score = 50; // Max points for title in 285-point system
  const max = 50;
  
  const titleLength = title.length;
  const words = title.split(/\s+/);
  
  // Rule 1: Primary keyword in first 5 words (15 points)
  const firstFiveWords = words.slice(0, 5).join(' ').toLowerCase();
  if (words.length < 3) {
    issues.push({
      severity: 'critical',
      category: 'Title Keywords',
      issue: 'Title too short - likely missing primary keyword in first 5 words',
      suggestion: 'Start title with your primary keyword phrase (2-3 words)',
      impact: 'Missing 15 points - primary keyword positioning is critical for algorithm',
      pointsLost: 15
    });
    score -= 15;
  }
  
  // Rule 2: Buyer intent phrases (10 points)
  const buyerIntentPhrases = ['gift for', 'personalized', 'custom', 'unique', 'handmade', 'wedding', 'birthday', 'anniversary'];
  const hasBuyerIntent = buyerIntentPhrases.some(phrase => title.toLowerCase().includes(phrase));
  if (!hasBuyerIntent) {
    issues.push({
      severity: 'warning',
      category: 'Buyer Intent',
      issue: 'No buyer intent phrases detected (e.g., "gift for", "personalized")',
      suggestion: 'Add buyer intent language to improve conversion rate (25% algorithm weight)',
      impact: 'Missing 10 points - reduced conversion signals',
      pointsLost: 10
    });
    score -= 10;
  }
  
  // Rule 3: Readability (10 points)
  const keywordStuffing = /(\w+)(\s+\1){2,}/gi.test(title);
  if (keywordStuffing) {
    issues.push({
      severity: 'critical',
      category: 'Readability',
      issue: 'Keyword stuffing detected - algorithm penalizes this in 2025',
      suggestion: 'Rewrite title naturally while keeping key terms',
      impact: 'Penalty: -10 points + potential algorithmic suppression',
      pointsLost: 10
    });
    score -= 10;
  }
  
  // Rule 4: Character count 60-140 (5 points)
  if (titleLength < 60) {
    issues.push({
      severity: 'warning',
      category: 'Title Length',
      issue: `Title too short (${titleLength} chars) - optimal is 60-140 for Etsy`,
      suggestion: 'Expand to 80-120 characters with descriptive keywords',
      impact: 'Missing 5 points - opportunity for more keywords',
      pointsLost: 5
    });
    score -= 5;
  } else if (titleLength > 140) {
    issues.push({
      severity: 'warning',
      category: 'Title Length',
      issue: `Title too long (${titleLength} chars) - truncated in mobile search`,
      suggestion: 'Reduce to 140 characters or less',
      impact: '44% of Etsy traffic is mobile - truncation reduces CTR',
      pointsLost: 5
    });
    score -= 5;
  }
  
  // Rule 5: Multi-word phrases (5 points)
  const singleWords = words.filter(w => w.length > 3);
  const avgWordLength = singleWords.reduce((sum, w) => sum + w.length, 0) / singleWords.length;
  if (avgWordLength < 5) {
    issues.push({
      severity: 'info',
      category: 'Keyword Strategy',
      issue: 'Title uses mostly short, single words',
      suggestion: 'Use multi-word phrases (e.g., "modern wall art" vs "art wall modern")',
      impact: 'Multi-word phrases perform better in 2025 algorithm',
      pointsLost: 5
    });
    score -= 5;
  }
  
  return { score: Math.max(0, score), max, issues };
}

// Analyze tags with 285-point system
function analyzeTagEffectiveness(tags: string, platform: string): { score: number; max: number; issues: SEOIssue[] } {
  const issues: SEOIssue[] = [];
  let score = 35; // Max points for tags
  const max = 35;
  
  const tagArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
  
  // Rule 1: 13 tags used (10 points)
  if (tagArray.length < 13) {
    issues.push({
      severity: 'critical',
      category: 'Tag Count',
      issue: `Only ${tagArray.length}/13 tags used`,
      suggestion: `Add ${13 - tagArray.length} more tags - each tag is a search opportunity`,
      impact: 'Missing 10 points + losing search visibility',
      pointsLost: 10
    });
    score -= 10;
  }
  
  // Rule 3: Long-tail variations (7 points)
  const longTailTags = tagArray.filter(t => t.split(/\s+/).length >= 3);
  if (longTailTags.length < 5) {
    issues.push({
      severity: 'warning',
      category: 'Tag Strategy',
      issue: `Only ${longTailTags.length} long-tail tags (need 5+ for niche targeting)`,
      suggestion: 'Add 3-word phrase tags like "boho nursery wall art" for niche searches',
      impact: 'Missing 7 points - long-tail = less competition',
      pointsLost: 7
    });
    score -= 7;
  }
  
  // Rule 4: No duplicates (5 points)
  const uniqueTags = new Set(tagArray.map(t => t.toLowerCase()));
  if (uniqueTags.size < tagArray.length) {
    issues.push({
      severity: 'warning',
      category: 'Tag Quality',
      issue: 'Duplicate tags detected - wasting slots',
      suggestion: 'Replace duplicates with unique keywords',
      impact: 'Missing 5 points + lost search opportunities',
      pointsLost: 5
    });
    score -= 5;
  }
  
  return { score: Math.max(0, score), max, issues };
}

// Analyze description with 285-point system
function analyzeDescriptionQuality(description: string): { score: number; max: number; issues: SEOIssue[] } {
  const issues: SEOIssue[] = [];
  let score = 30; // Max points for description
  const max = 30;
  
  const descLength = description.length;
  
  // Rule 1: First 160 characters compelling + keyword-rich (10 points)
  if (descLength < 160) {
    issues.push({
      severity: 'critical',
      category: 'Description Length',
      issue: 'Description shorter than 160 characters (shows in preview)',
      suggestion: 'Write compelling 160+ char opening with primary keyword',
      impact: 'Missing 10 points - first 160 chars appear in search results',
      pointsLost: 10
    });
    score -= 10;
  }
  
  // Rule 2: Benefits-focused language (10 points)
  const benefitWords = ['perfect', 'great', 'ideal', 'best', 'quality', 'unique', 'special', 'beautiful'];
  const hasBenefits = benefitWords.some(word => description.toLowerCase().includes(word));
  if (!hasBenefits) {
    issues.push({
      severity: 'warning',
      category: 'Description Quality',
      issue: 'Description lacks benefit-focused language',
      suggestion: 'Highlight why buyers should choose this (quality, uniqueness, value)',
      impact: 'Missing 10 points - benefits drive conversion (25% algorithm weight)',
      pointsLost: 10
    });
    score -= 10;
  }
  
  // Rule 3: Formatting/structure (5 points)
  const hasLineBreaks = description.includes('\n') || description.match(/\n\n/);
  if (!hasLineBreaks && descLength > 200) {
    issues.push({
      severity: 'info',
      category: 'Formatting',
      issue: 'No paragraph breaks - difficult to read',
      suggestion: 'Break into 2-3 paragraphs for better mobile readability',
      impact: 'Missing 5 points - readability affects conversion',
      pointsLost: 5
    });
    score -= 5;
  }
  
  // Additional check: Too short overall
  if (descLength < 300) {
    issues.push({
      severity: 'critical',
      category: 'Description Length',
      issue: `Description too short (${descLength} chars) - aim for 300-1000`,
      suggestion: 'Add: materials, dimensions, use cases, care instructions, benefits',
      impact: 'Insufficient content for algorithm to understand product',
      pointsLost: 0 // Already penalized above
    });
  }
  
  return { score: Math.max(0, score), max, issues };
}

// Analyze images (based on count)
function analyzeImageOptimization(photoCount: number = 0): { score: number; max: number; issues: SEOIssue[] } {
  const issues: SEOIssue[] = [];
  let score = 70; // Max points for images in 285-point system
  const max = 70;
  
  // Rule: 5+ photos strongly recommended (Etsy shows 10 slots)
  if (photoCount < 5) {
    const pointsLost = (5 - photoCount) * 14; // ~14 points per missing photo
    issues.push({
      severity: 'critical',
      category: 'Image Count',
      issue: `Only ${photoCount} photos (Etsy allows 10, recommends 5+ minimum)`,
      suggestion: `Add ${5 - photoCount} more photos - listings with 10 photos get 40% more views`,
      impact: `Missing ${pointsLost} points - images = 70 points in algorithm`,
      pointsLost: pointsLost
    });
    score -= pointsLost;
  } else if (photoCount < 10) {
    const pointsLost = (10 - photoCount) * 5;
    issues.push({
      severity: 'warning',
      category: 'Image Count',
      issue: `${photoCount}/10 photos used`,
      suggestion: `Add ${10 - photoCount} more photos for maximum visibility`,
      impact: `Missing ${pointsLost} points - 10 photos = 40% more views`,
      pointsLost: pointsLost
    });
    score -= pointsLost;
  }
  
  return { score: Math.max(0, score), max, issues };
}

export async function POST(request: NextRequest) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  try {
    const body: SEOAuditRequest = await request.json();
    const { platform, title, description, tags, category, price, photoCount = 0 } = body;
    
    if (!platform || !title || !description || !tags) {
      return NextResponse.json(
        { error: 'Missing required fields: platform, title, description, tags' },
        { status: 400 }
      );
    }
    
    console.log('Running 285-point SEO audit for:', { title, platform, photoCount });
    
    // Perform analysis with 285-point system
    const titleAnalysis = analyzeTitleOptimization(title, platform);
    const descriptionAnalysis = analyzeDescriptionQuality(description);
    const tagAnalysis = analyzeTagEffectiveness(tags, platform);
    const imageAnalysis = analyzeImageOptimization(photoCount);
    
    // Calculate pricing score (simplified - in production would check competitiveness)
    const pricingScore = price && price > 0 ? 23 : 0;
    const pricingMax = 23;
    
    // Calculate metadata score
    const metadataScore = (
      (title.length > 0 ? 7 : 0) +
      (description.length >= 200 ? 7 : 0) +
      (tags.split(',').length >= 10 ? 7 : 0) +
      (category ? 7 : 0)
    );
    const metadataMax = 28;
    
    const categoryScores = {
      titleOptimization: { score: titleAnalysis.score, max: titleAnalysis.max },
      descriptionQuality: { score: descriptionAnalysis.score, max: descriptionAnalysis.max },
      tagEffectiveness: { score: tagAnalysis.score, max: tagAnalysis.max },
      imageOptimization: { score: imageAnalysis.score, max: imageAnalysis.max },
      pricingStrategy: { score: pricingScore, max: pricingMax },
      metadataCompleteness: { score: metadataScore, max: metadataMax }
    };
    
    // Calculate overall score out of 285
    const overallScore = 
      titleAnalysis.score + 
      descriptionAnalysis.score + 
      tagAnalysis.score + 
      imageAnalysis.score + 
      pricingScore + 
      metadataScore;
    
    const maxScore = 285;
    const percentage = Math.round((overallScore / maxScore) * 100);
    
    // Collect all issues
    const allIssues: SEOIssue[] = [
      ...titleAnalysis.issues,
      ...descriptionAnalysis.issues,
      ...tagAnalysis.issues,
      ...imageAnalysis.issues
    ];
    
    // Calculate detailed metrics
    const titleWords = title.split(/\s+/);
    const primaryKeyword = titleWords.slice(0, 3).join(' ').toLowerCase();
    const keywordMatches = description.toLowerCase().match(new RegExp(primaryKeyword, 'g'));
    const keywordDensity = keywordMatches ? (keywordMatches.length / description.split(/\s+/).length * 100) : 0;
    
    const buyerIntentWords = ['gift', 'personalized', 'custom', 'unique', 'handmade', 'wedding', 'birthday'];
    const buyerIntentScore = Math.min(100, buyerIntentWords.filter(word => 
      title.toLowerCase().includes(word) || description.toLowerCase().includes(word)
    ).length * 15);
    
    const mobileOptimizationScore = Math.min(100, 
      (title.length <= 140 ? 50 : 30) + 
      (photoCount >= 5 ? 50 : photoCount * 10)
    );
    
    // Get AI insights
    const aiPrompt = `Analyze this ${platform} listing against Etsy's 2025 algorithm (285-point system):

Title: ${title}
Description: ${description.substring(0, 500)}...
Tags: ${tags}
Photos: ${photoCount}/10
Category: ${category || 'Not specified'}

Provide:
1. 3 strengths aligned with algorithm priorities
2. 3 specific recommendations to increase score
3. Algorithm breakdown:
   - Listing Quality Score assessment
   - Conversion potential (3-4% target)
   - Customer experience factors
   - Overall ranking potential

Format as JSON:
{
  "strengths": ["strength1", "strength2", "strength3"],
  "recommendations": ["rec1", "rec2", "rec3"],
  "algorithmBreakdown": {
    "listingQualityScore": "Assessment of CTR/conversion/images",
    "conversionPotential": "Estimated % and factors",
    "customerExperience": "Review/response time assessment",
    "overallRanking": "Excellent/Good/Fair/Poor with reasoning"
  }
}`;
    
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in Etsy\'s 2025 algorithm (285-point system). Provide specific, actionable advice based on: Listing Quality (30%), Conversion (25%), Customer Experience (15%), Recency (10%), Shipping (8%), CTR (7%), Shop Performance (3%), Personalization (2%).'
        },
        {
          role: 'user',
          content: aiPrompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });
    
    const aiAnalysis = JSON.parse(aiResponse.choices[0].message.content || '{}');
    
    const result: SEOAuditResult = {
      overallScore,
      maxScore,
      percentage,
      categoryScores,
      issues: allIssues.sort((a, b) => b.pointsLost - a.pointsLost),
      strengths: aiAnalysis.strengths || [],
      recommendations: aiAnalysis.recommendations || [],
      algorithmBreakdown: aiAnalysis.algorithmBreakdown || {
        listingQualityScore: 'Moderate - needs photo optimization',
        conversionPotential: '2-3% estimated',
        customerExperience: 'Cannot assess without shop data',
        overallRanking: 'Fair'
      },
      detailedAnalysis: {
        keywordDensity: parseFloat(keywordDensity.toFixed(2)),
        readabilityScore: 75, // Simplified
        titleLength: title.length,
        descriptionLength: description.length,
        tagCount: tags.split(',').filter(t => t.trim()).length,
        primaryKeywordPosition: title.toLowerCase().indexOf(primaryKeyword),
        buyerIntentScore,
        mobileOptimizationScore
      }
    };
    
    console.log('285-point audit complete:', {
      score: overallScore,
      percentage,
      criticalIssues: allIssues.filter(i => i.severity === 'critical').length
    });
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('SEO Audit Error:', error);
    return NextResponse.json(
      { error: 'Failed to perform SEO audit', details: error.message },
      { status: 500 }
    );
  }
}
