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
}

interface SEOIssue {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  issue: string;
  suggestion: string;
  impact: string;
}

interface SEOAuditResult {
  overallScore: number;
  categoryScores: {
    titleOptimization: number;
    descriptionQuality: number;
    tagEffectiveness: number;
    keywordUsage: number;
    contentStructure: number;
    metadataCompleteness: number;
  };
  issues: SEOIssue[];
  strengths: string[];
  recommendations: string[];
  competitiveAnalysis: {
    estimatedRanking: string;
    improvementPotential: number;
  };
  detailedAnalysis: {
    keywordDensity: number;
    readabilityScore: number;
    titleLength: number;
    descriptionLength: number;
    tagCount: number;
    primaryKeywordPosition: number;
  };
}

// Helper function to calculate keyword density
function calculateKeywordDensity(text: string, keyword: string): number {
  const words = text.toLowerCase().split(/\s+/);
  const keywordWords = keyword.toLowerCase().split(/\s+/);
  let count = 0;
  
  for (let i = 0; i <= words.length - keywordWords.length; i++) {
    const phrase = words.slice(i, i + keywordWords.length).join(' ');
    if (phrase === keywordWords.join(' ')) {
      count++;
    }
  }
  
  return (count / words.length) * 100;
}

// Helper function to calculate readability (Flesch Reading Ease)
function calculateReadability(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  
  if (sentences.length === 0 || words.length === 0) return 0;
  
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  
  const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  return Math.max(0, Math.min(100, score));
}

function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

// Analyze title optimization
function analyzeTitleOptimization(title: string, platform: string): { score: number; issues: SEOIssue[] } {
  const issues: SEOIssue[] = [];
  let score = 100;
  
  const titleLength = title.length;
  const maxLength = platform === 'Etsy' ? 140 : platform === 'Shopify' ? 70 : 80;
  
  // Check title length
  if (titleLength > maxLength) {
    issues.push({
      severity: 'critical',
      category: 'Title Length',
      issue: `Title exceeds ${platform}'s recommended length (${titleLength}/${maxLength} characters)`,
      suggestion: `Shorten title to ${maxLength} characters or less`,
      impact: 'Title may be truncated in search results, reducing click-through rate'
    });
    score -= 20;
  } else if (titleLength < 40) {
    issues.push({
      severity: 'warning',
      category: 'Title Length',
      issue: 'Title is too short and may not include enough keywords',
      suggestion: 'Expand title to 60-80 characters with relevant keywords',
      impact: 'Missing opportunity to rank for additional search terms'
    });
    score -= 10;
  }
  
  // Check for keyword front-loading
  const firstWords = title.substring(0, 60);
  if (!/^[A-Z]/.test(title)) {
    issues.push({
      severity: 'info',
      category: 'Title Format',
      issue: 'Title should start with a capital letter',
      suggestion: 'Capitalize the first letter of your title',
      impact: 'Minor impact on professionalism'
    });
    score -= 5;
  }
  
  // Check for special characters
  if (/[!@#$%^&*()]/.test(title)) {
    issues.push({
      severity: 'warning',
      category: 'Title Format',
      issue: 'Title contains special characters that may hurt SEO',
      suggestion: 'Remove special characters except hyphens, pipes, and commas',
      impact: 'Some platforms penalize special characters in titles'
    });
    score -= 10;
  }
  
  return { score: Math.max(0, score), issues };
}

// Analyze description quality
function analyzeDescriptionQuality(description: string): { score: number; issues: SEOIssue[] } {
  const issues: SEOIssue[] = [];
  let score = 100;
  
  const descLength = description.length;
  const words = description.split(/\s+/).filter(w => w.length > 0);
  
  // Check description length
  if (descLength < 200) {
    issues.push({
      severity: 'critical',
      category: 'Description Length',
      issue: 'Description is too short (minimum 200 characters recommended)',
      suggestion: 'Expand description to at least 300-500 characters with detailed product information',
      impact: 'Insufficient content for search engines to understand your product'
    });
    score -= 30;
  } else if (descLength > 2000) {
    issues.push({
      severity: 'warning',
      category: 'Description Length',
      issue: 'Description may be too long and lose reader attention',
      suggestion: 'Consider condensing to 500-1000 characters of high-quality content',
      impact: 'Buyers may not read the entire description'
    });
    score -= 10;
  }
  
  // Check for paragraphs
  const paragraphs = description.split(/\n\n+/).filter(p => p.trim().length > 0);
  if (paragraphs.length < 2) {
    issues.push({
      severity: 'warning',
      category: 'Content Structure',
      issue: 'Description lacks paragraph breaks',
      suggestion: 'Break description into 2-4 clear paragraphs for readability',
      impact: 'Poor readability may reduce conversion rates'
    });
    score -= 15;
  }
  
  // Check for bullet points or lists
  if (!/[•\-\*]|\d+\./.test(description)) {
    issues.push({
      severity: 'info',
      category: 'Content Structure',
      issue: 'No bullet points or lists found',
      suggestion: 'Consider adding bullet points to highlight key features',
      impact: 'Easier scanning improves user experience'
    });
    score -= 5;
  }
  
  return { score: Math.max(0, score), issues };
}

// Analyze tag effectiveness
function analyzeTagEffectiveness(tags: string, platform: string): { score: number; issues: SEOIssue[] } {
  const issues: SEOIssue[] = [];
  let score = 100;
  
  const tagArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
  const maxTags = platform === 'Etsy' ? 13 : platform === 'Shopify' ? 250 : 50;
  const minTags = platform === 'Etsy' ? 13 : 5;
  
  // Check tag count
  if (tagArray.length < minTags) {
    issues.push({
      severity: 'critical',
      category: 'Tag Count',
      issue: `Only ${tagArray.length} tags used (${platform} allows up to ${maxTags})`,
      suggestion: `Add ${minTags - tagArray.length} more relevant tags to maximize visibility`,
      impact: 'Missing significant search traffic opportunities'
    });
    score -= 30;
  } else if (tagArray.length === maxTags) {
    // Perfect!
  }
  
  // Check for duplicate tags
  const uniqueTags = new Set(tagArray.map(t => t.toLowerCase()));
  if (uniqueTags.size < tagArray.length) {
    issues.push({
      severity: 'warning',
      category: 'Tag Quality',
      issue: 'Duplicate tags detected',
      suggestion: 'Replace duplicate tags with unique, relevant keywords',
      impact: 'Wasting tag slots that could target different search terms'
    });
    score -= 15;
  }
  
  // Check tag length
  const longTags = tagArray.filter(t => t.length > 20);
  if (longTags.length > 0) {
    issues.push({
      severity: 'info',
      category: 'Tag Quality',
      issue: `${longTags.length} tags are very long (>20 characters)`,
      suggestion: 'Use concise, specific tags for better matching',
      impact: 'Long tags may match fewer searches'
    });
    score -= 5;
  }
  
  return { score: Math.max(0, score), issues };
}

export async function POST(request: NextRequest) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  try {
    const body: SEOAuditRequest = await request.json();
    const { platform, title, description, tags, category, price, imageUrl } = body;
    
    // Validate required fields
    if (!platform || !title || !description || !tags) {
      return NextResponse.json(
        { error: 'Missing required fields: platform, title, description, tags' },
        { status: 400 }
      );
    }
    
    // Perform basic analysis
    const titleAnalysis = analyzeTitleOptimization(title, platform);
    const descriptionAnalysis = analyzeDescriptionQuality(description);
    const tagAnalysis = analyzeTagEffectiveness(tags, platform);
    
    // Extract primary keyword (first significant phrase in title)
    const titleWords = title.split(/[\s,|]+/);
    const primaryKeyword = titleWords.slice(0, 3).join(' ').toLowerCase();
    
    // Calculate detailed metrics
    const keywordDensity = calculateKeywordDensity(description, primaryKeyword);
    const readabilityScore = calculateReadability(description);
    const tagArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
    
    // Find primary keyword position in title
    const primaryKeywordPosition = title.toLowerCase().indexOf(primaryKeyword);
    
    // Collect all issues
    const allIssues: SEOIssue[] = [
      ...titleAnalysis.issues,
      ...descriptionAnalysis.issues,
      ...tagAnalysis.issues
    ];
    
    // Check keyword density
    if (keywordDensity < 1.5) {
      allIssues.push({
        severity: 'warning',
        category: 'Keyword Usage',
        issue: `Keyword density is low (${keywordDensity.toFixed(1)}%)`,
        suggestion: 'Naturally incorporate your primary keyword 2-3 more times in the description',
        impact: 'Low keyword density may reduce search relevance'
      });
    } else if (keywordDensity > 3.0) {
      allIssues.push({
        severity: 'warning',
        category: 'Keyword Usage',
        issue: `Keyword density is too high (${keywordDensity.toFixed(1)}%) - may be seen as keyword stuffing`,
        suggestion: 'Reduce keyword repetition to 1.5-3% density',
        impact: 'Keyword stuffing may trigger platform penalties'
      });
    }
    
    // Check primary keyword position
    if (primaryKeywordPosition > 60) {
      allIssues.push({
        severity: 'warning',
        category: 'Keyword Placement',
        issue: 'Primary keyword appears late in title',
        suggestion: 'Move primary keyword to first 60 characters of title',
        impact: 'Early keyword placement improves search ranking'
      });
    }
    
    // Use AI for advanced analysis
    const aiPrompt = `Analyze this ${platform} product listing for SEO optimization:

Title: ${title}
Description: ${description}
Tags: ${tags}
Category: ${category || 'Not specified'}

Provide:
1. 3 key strengths of this listing
2. 3 specific recommendations for improvement
3. Estimated search ranking potential (Excellent/Good/Fair/Poor)
4. Improvement potential percentage (0-100)

Format as JSON:
{
  "strengths": ["strength1", "strength2", "strength3"],
  "recommendations": ["rec1", "rec2", "rec3"],
  "ranking": "Good",
  "improvementPotential": 75
}`;
    
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in e-commerce SEO optimization, specializing in Etsy, Shopify, and eBay listings. Provide specific, actionable advice.'
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
    
    // Calculate category scores
    const keywordScore = keywordDensity >= 1.5 && keywordDensity <= 3.0 ? 100 : 
                        keywordDensity < 1.5 ? 60 : 70;
    
    const structureScore = description.split(/\n\n+/).length >= 2 ? 90 : 70;
    
    const metadataScore = (
      (title.length > 0 ? 25 : 0) +
      (description.length >= 200 ? 25 : 0) +
      (tagArray.length >= 10 ? 25 : 0) +
      (category ? 25 : 0)
    );
    
    const categoryScores = {
      titleOptimization: titleAnalysis.score,
      descriptionQuality: descriptionAnalysis.score,
      tagEffectiveness: tagAnalysis.score,
      keywordUsage: keywordScore,
      contentStructure: structureScore,
      metadataCompleteness: metadataScore
    };
    
    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      categoryScores.titleOptimization * 0.25 +
      categoryScores.descriptionQuality * 0.20 +
      categoryScores.tagEffectiveness * 0.20 +
      categoryScores.keywordUsage * 0.15 +
      categoryScores.contentStructure * 0.10 +
      categoryScores.metadataCompleteness * 0.10
    );
    
    const result: SEOAuditResult = {
      overallScore,
      categoryScores,
      issues: allIssues,
      strengths: aiAnalysis.strengths || [],
      recommendations: aiAnalysis.recommendations || [],
      competitiveAnalysis: {
        estimatedRanking: aiAnalysis.ranking || 'Good',
        improvementPotential: aiAnalysis.improvementPotential || 50
      },
      detailedAnalysis: {
        keywordDensity: parseFloat(keywordDensity.toFixed(2)),
        readabilityScore: Math.round(readabilityScore),
        titleLength: title.length,
        descriptionLength: description.length,
        tagCount: tagArray.length,
        primaryKeywordPosition
      }
    };
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('SEO Audit Error:', error);
    return NextResponse.json(
      { error: 'Failed to perform SEO audit', details: error.message },
      { status: 500 }
    );
  }
}

