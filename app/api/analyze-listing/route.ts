export const runtime = 'nodejs';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { analyzeImageWithVision } from '@/lib/ai-vision';
import { calculateListingScore, ImageAnalysisResult } from '@/lib/listing-scoring';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/analyze-listing
 * Analyzes multiple images as a complete Etsy listing
 * AI Vision is the SINGLE SOURCE OF TRUTH for scores
 * Persists results to DB with analysis_id for deterministic retrieval
 */
export async function POST(request: NextRequest) {
  const requestId = randomUUID().substring(0, 8);
  console.log(`[${requestId}] Listing analysis started (AI scoring authoritative)`);

  try {
    // ===========================================
    // 1. PARSE FORM DATA
    // ===========================================
    const formData = await request.formData();
    
    // Collect all image files
    const imageFiles: File[] = [];
    let index = 0;
    while (true) {
      const file = formData.get(`image_${index}`) as File;
      if (!file) break;
      imageFiles.push(file);
      index++;
    }
    
    // If no indexed images, try single 'images' field (fallback)
    if (imageFiles.length === 0) {
      const files = formData.getAll('images') as File[];
      imageFiles.push(...files);
    }
    
    console.log(`[${requestId}] Received ${imageFiles.length} images for listing analysis`);
    
    // Validation
    if (imageFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No images provided' },
        { status: 400 }
      );
    }
    
    if (imageFiles.length > 10) {
      return NextResponse.json(
        { success: false, error: 'Maximum 10 images allowed per listing' },
        { status: 400 }
      );
    }
    
    // ===========================================
    // 2. ANALYZE EACH IMAGE (AI IS SINGLE SOURCE OF TRUTH)
    // ===========================================
    const imageResults: ImageAnalysisResult[] = [];
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const isMainImage = i === 0;
      
      console.log(`[${requestId}] Analyzing image ${i + 1}/${imageFiles.length} (${file.name})`);
      
      try {
        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Convert buffer to base64 string
        const imageBase64 = buffer.toString('base64');
        const mimeType = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
        
        // Run AI Vision analysis - SINGLE SOURCE OF TRUTH FOR SCORES
        let visionResponse = await analyzeImageWithVision(imageBase64, mimeType);
        
        // HARD ERROR if AI score missing - one retry then fail
        if (visionResponse?.ai_score === undefined || visionResponse?.ai_score === null) {
          console.log(`[${requestId}] Image ${i + 1}: AI score missing, retrying...`);
          visionResponse = await analyzeImageWithVision(imageBase64, mimeType);
          
          if (visionResponse?.ai_score === undefined || visionResponse?.ai_score === null) {
            console.error(`[${requestId}] Image ${i + 1}: AI_SCORE_INVALID after retry`);
            return NextResponse.json(
              { success: false, error: 'AI_SCORE_INVALID', details: `AI score missing for image ${i + 1} after retry` },
              { status: 500 }
            );
          }
        }
        
        const aiScore = visionResponse.ai_score;
        console.log(`[${requestId}] Image ${i + 1}: AI Vision complete, AI score = ${aiScore}`);
        
        // Detect photo types from AI Vision response
        const photoTypes: string[] = visionResponse?.has_studio_shot ? ['studio_shot'] : [];
        if (visionResponse?.has_lifestyle_shot) photoTypes.push('lifestyle_shot');
        if (visionResponse?.has_detail_shot) photoTypes.push('detail_shot');
        if (visionResponse?.has_scale_shot) photoTypes.push('scale_shot');
        if (visionResponse?.has_group_shot) photoTypes.push('group_shot');
        if (visionResponse?.has_packaging_shot) photoTypes.push('packaging_shot');
        if (visionResponse?.has_process_shot) photoTypes.push('process_shot');
        
        // Build feedback from AI issues/strengths
        const feedback: { rule: string; status: 'critical' | 'warning' | 'passed'; message: string }[] = [];
        if (visionResponse?.ai_issues) {
          visionResponse.ai_issues.forEach((issue: string) => {
            feedback.push({ rule: 'ai_analysis', status: 'warning', message: issue });
          });
        }
        if (visionResponse?.ai_strengths) {
          visionResponse.ai_strengths.forEach((strength: string) => {
            feedback.push({ rule: 'ai_analysis', status: 'passed', message: strength });
          });
        }
        
        // Add to results - AI SCORE IS AUTHORITATIVE
        imageResults.push({
          imageIndex: i,
          score: aiScore,  // AI score directly - NO FALLBACK
          feedback,
          photoTypes,
          technicalPoints: 0,  // Deprecated - AI handles scoring
          photoTypePoints: 0,  // Deprecated - AI handles scoring
          compositionPoints: 0, // Deprecated - AI handles scoring
          isMainImage,
          ai_issues: visionResponse?.ai_issues || [],
          ai_strengths: visionResponse?.ai_strengths || [],
          ai_caps_applied: visionResponse?.ai_caps_applied || [],
          ai_optimization_recommendations: visionResponse?.ai_optimization_recommendations || []
        });
        
        console.log(`[${requestId}] Image ${i + 1}: FINAL score = ${aiScore} (AI authoritative), Types = ${photoTypes.join(', ')}`);
        
      } catch (imageError: any) {
        console.error(`[${requestId}] Failed to analyze image ${i + 1}:`, imageError);
        
        // HARD ERROR - do not continue with failed images
        return NextResponse.json(
          { success: false, error: 'IMAGE_ANALYSIS_FAILED', details: `Failed to analyze image ${i + 1}: ${imageError.message}` },
          { status: 500 }
        );
      }
    }
    
    // ===========================================
    // 3. CALCULATE OVERALL LISTING SCORE
    // ===========================================
    const listingScore = calculateListingScore(imageResults);
    
    console.log(`[${requestId}] Listing analysis complete:`, {
      overallScore: listingScore.overallListingScore,
      mainImage: listingScore.mainImageScore,
      average: listingScore.averageImageScore,
      variety: listingScore.varietyScore,
      images: imageResults.length
    });
    
    // ===========================================
    // 4. PERSIST ANALYSIS TO DATABASE
    // ===========================================
    const analysis = await prisma.listingAnalysis.create({
      data: {
        overallListingScore: listingScore.overallListingScore,
        mainImageScore: listingScore.mainImageScore,
        averageImageScore: listingScore.averageImageScore,
        imageScores: imageResults.map(r => r.score),
        imageResults: imageResults,
        detectedPhotoTypes: listingScore.detectedPhotoTypes,
        missingPhotoTypes: listingScore.missingPhotoTypes,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }
    });
    
    console.log(`[${requestId}] Analysis persisted with id: ${analysis.id}`);
    
    // ===========================================
    // 5. RETURN RESPONSE WITH analysis_id
    // ===========================================
    return NextResponse.json({
      success: true,
      analysis_id: analysis.id,
      overallListingScore: listingScore.overallListingScore,
      mainImageScore: listingScore.mainImageScore,
      averageImageScore: listingScore.averageImageScore,
      varietyScore: listingScore.varietyScore,
      completenessBonus: listingScore.completenessBonus,
      detectedPhotoTypes: listingScore.detectedPhotoTypes,
      missingPhotoTypes: listingScore.missingPhotoTypes,
      breakdown: listingScore.breakdown,
      imageResults,
      imageCount: imageResults.length
    });
    
  } catch (error: any) {
    console.error(`[${requestId}] Listing analysis failed:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Listing analysis failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
