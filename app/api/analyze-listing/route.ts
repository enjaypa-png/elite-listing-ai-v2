export const runtime = 'nodejs';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { analyzeImageWithVision } from '@/lib/ai-vision';
import { calculateListingScore, ImageAnalysisResult } from '@/lib/listing-scoring';
import { calculateEtsyCompliance, calculateFinalScore, ImageTechnicalSpecs } from '@/lib/etsy-compliance-scoring';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/analyze-listing
 * Analyzes multiple images as a complete Etsy listing using TWO-ENGINE MODEL:
 *
 * 1. AI Visual Quality Score (IMMUTABLE)
 *    - Image composition, lighting, styling
 *    - From AI Vision analysis
 *    - Never changes during optimization
 *
 * 2. Etsy Technical Compliance Score (MUTABLE)
 *    - Aspect ratio, resolution, file size, format, color profile
 *    - Deterministic calculation from image properties
 *    - Improves during optimization
 *
 * Final Score = (Visual Quality × 0.6) + (Etsy Compliance × 0.4)
 * Persists BOTH scores to DB for deterministic retrieval
 */
export async function POST(request: NextRequest) {
  const requestId = randomUUID().substring(0, 8);
  console.log(`[${requestId}] Listing analysis started (two-engine model: AI visual + Etsy compliance)`);

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
    // 2. ANALYZE EACH IMAGE (TWO-ENGINE MODEL)
    // ===========================================
    const imageResults: ImageAnalysisResult[] = [];
    const technicalSpecs: ImageTechnicalSpecs[] = [];
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const isMainImage = i === 0;
      
      console.log(`[${requestId}] Analyzing image ${i + 1}/${imageFiles.length} (${file.name})`);
      
      try {
        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // ===========================================
        // ENGINE 1: EXTRACT TECHNICAL SPECS (MUTABLE)
        // ===========================================
        const metadata = await sharp(buffer).metadata();
        const specs: ImageTechnicalSpecs = {
          width: metadata.width || 0,
          height: metadata.height || 0,
          fileSizeBytes: buffer.length,
          colorProfile: metadata.space || 'srgb',
          format: metadata.format || 'jpeg',
          ppi: metadata.density || 72,
        };
        technicalSpecs.push(specs);

        const etsyCompliance = calculateEtsyCompliance(specs);
        console.log(`[${requestId}] Image ${i + 1}: Etsy compliance = ${etsyCompliance.overallCompliance}%`);

        // ===========================================
        // ENGINE 2: AI VISUAL QUALITY (IMMUTABLE)
        // ===========================================
        const imageBase64 = buffer.toString('base64');
        const mimeType = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

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
        
        const visualQuality = visionResponse.ai_score;
        console.log(`[${requestId}] Image ${i + 1}: AI visual quality = ${visualQuality}`);

        // ===========================================
        // CALCULATE FINAL SCORE (WEIGHTED COMBINATION)
        // ===========================================
        const finalScore = calculateFinalScore(visualQuality, etsyCompliance.overallCompliance);
        console.log(`[${requestId}] Image ${i + 1}: Final score = ${finalScore} (${visualQuality} visual × 0.6 + ${etsyCompliance.overallCompliance} compliance × 0.4)`);

        // Detect photo types from AI Vision response
        const photoTypes: string[] = visionResponse?.has_studio_shot ? ['studio_shot'] : [];
        if (visionResponse?.has_lifestyle_shot) photoTypes.push('lifestyle_shot');
        if (visionResponse?.has_detail_shot) photoTypes.push('detail_shot');
        if (visionResponse?.has_scale_shot) photoTypes.push('scale_shot');
        if (visionResponse?.has_group_shot) photoTypes.push('group_shot');
        if (visionResponse?.has_packaging_shot) photoTypes.push('packaging_shot');
        if (visionResponse?.has_process_shot) photoTypes.push('process_shot');

        // Build feedback from AI issues/strengths AND Etsy compliance
        const feedback: { rule: string; status: 'critical' | 'warning' | 'passed'; message: string }[] = [];

        // AI visual feedback
        if (visionResponse?.ai_issues) {
          visionResponse.ai_issues.forEach((issue: string) => {
            feedback.push({ rule: 'ai_visual_quality', status: 'warning', message: issue });
          });
        }
        if (visionResponse?.ai_strengths) {
          visionResponse.ai_strengths.forEach((strength: string) => {
            feedback.push({ rule: 'ai_visual_quality', status: 'passed', message: strength });
          });
        }

        // Etsy compliance feedback
        Object.entries(etsyCompliance.breakdown).forEach(([key, value]) => {
          if (value.score < 70) {
            feedback.push({ rule: 'etsy_compliance', status: 'warning', message: value.message });
          } else if (value.score >= 95) {
            feedback.push({ rule: 'etsy_compliance', status: 'passed', message: value.message });
          }
        });

        // Store results with BOTH scores
        imageResults.push({
          imageIndex: i,
          score: finalScore,  // Final combined score
          visualQuality,  // AI visual quality (immutable)
          etsyCompliance: etsyCompliance.overallCompliance,  // Technical compliance (mutable)
          feedback,
          photoTypes,
          technicalPoints: 0,  // Deprecated
          photoTypePoints: 0,  // Deprecated
          compositionPoints: 0, // Deprecated
          isMainImage,
          ai_issues: visionResponse?.ai_issues || [],
          ai_strengths: visionResponse?.ai_strengths || [],
          ai_caps_applied: visionResponse?.ai_caps_applied || [],
          ai_optimization_recommendations: visionResponse?.ai_optimization_recommendations || [],
          etsyComplianceBreakdown: etsyCompliance.breakdown,

          // Phase 1 Quick Wins - Etsy Preference Fields
          ai_alt_text: visionResponse?.ai_alt_text,
          has_text_elements: visionResponse?.has_text_elements,
          text_readable: visionResponse?.text_readable,
          has_wrinkles: visionResponse?.has_wrinkles,

          // Phase 2: Warm Lighting & White Background
          has_warm_lighting: visionResponse?.has_warm_lighting,
          lighting_temperature: visionResponse?.lighting_temperature,
          background_is_pure_white: visionResponse?.background_is_pure_white,
          background_purity_score: visionResponse?.background_purity_score,
        });
        
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
