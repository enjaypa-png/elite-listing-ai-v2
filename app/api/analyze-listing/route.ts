export const runtime = 'nodejs';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { analyzeImageWithVision } from '@/lib/ai-vision';
import { calculateListingScore, ImageAnalysisResult } from '@/lib/listing-scoring';
import { calculateEtsyCompliance, calculateFinalScore, ImageTechnicalSpecs } from '@/lib/etsy-compliance-scoring';
import { prisma } from '@/lib/prisma';
import { scoreListing, ScoringMode, scoreImage } from '@/lib/deterministic-scoring';
import { ImageAttributes } from '@/lib/database-scoring';

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

    // Extract MODE parameter (deterministic scoring spec)
    const mode = formData.get('mode') as string | null;
    console.log(`[${requestId}] MODE: ${mode || 'not specified (legacy path)'}`);

    // Validate MODE if provided
    if (mode && !['optimize_images', 'evaluate_full_listing'].includes(mode)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_MODE', details: 'MODE must be "optimize_images" or "evaluate_full_listing"' },
        { status: 400 }
      );
    }

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
    // NEW PATH: DETERMINISTIC SCORING (when MODE provided)
    // ===========================================
    if (mode) {
      console.log(`[${requestId}] Using DETERMINISTIC scoring path (MODE: ${mode})`);

      // Process all images in parallel (10-20x faster for multiple images)
      console.log(`[${requestId}] Processing ${imageFiles.length} images in parallel...`);
      const imagePromises = imageFiles.map(async (file, i) => {

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extract technical attributes
        const metadata = await sharp(buffer).metadata();
        const attributes: ImageAttributes = {
          width_px: metadata.width || 0,
          height_px: metadata.height || 0,
          file_size_bytes: buffer.length,
          aspect_ratio: metadata.width && metadata.height ? `${metadata.width}:${metadata.height}` : '0:0',
          file_type: metadata.format || 'jpeg',
          color_profile: metadata.space || 'srgb',
          ppi: metadata.density || 72,
          shortest_side: Math.min(metadata.width || 0, metadata.height || 0),
          // Placeholder values for AI Vision attributes (not used in deterministic scoring)
          has_clean_white_background: false,
          is_product_centered: false,
          has_good_lighting: false,
          is_sharp_focus: false,
          has_no_watermarks: true,
          professional_appearance: false,
          has_studio_shot: false,
          has_lifestyle_shot: false,
          has_scale_shot: false,
          has_detail_shot: false,
          has_group_shot: false,
          has_packaging_shot: false,
          has_process_shot: false,
          shows_texture_or_craftsmanship: false,
          product_clearly_visible: false,
          appealing_context: false,
          reference_object_visible: false,
          size_comparison_clear: false,
        };

        // Get AI analysis (objective detection only)
        const imageBase64 = buffer.toString('base64');
        const mimeType = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

        const visionResponse = await analyzeImageWithVision(imageBase64, mimeType);

        // Extract AI detections from response
        // The AI should return hasSevereBlur, hasSevereLighting, isProductDistinguishable, thumbnailCropSafe
        // For now, derive from legacy response format until AI prompt is fully deployed
        const aiAnalysis = {
          // Derive severe blur from legacy is_sharp_focus flag (inverted)
          hasSevereBlur: visionResponse?.is_sharp_focus === false,

          // Derive severe lighting from legacy has_good_lighting flag (inverted)
          hasSevereLighting: visionResponse?.has_good_lighting === false,

          // Derive distinguishability from legacy product_clearly_visible flag
          isProductDistinguishable: visionResponse?.product_clearly_visible !== false,

          // First photo thumbnail safety - assume safe unless AI indicates cropping issues
          thumbnailCropSafe: i === 0 ? visionResponse?.is_product_centered !== false : undefined,

        // Map AI response to analysis format
        // Extract boolean flags from AI Vision response
        const aiAnalysis = {
          hasSevereBlur: visionResponse?.hasSevereBlur ?? false,
          hasSevereLighting: visionResponse?.hasSevereLighting ?? false,
          isProductDistinguishable: visionResponse?.isProductDistinguishable ?? true,
          thumbnailCropSafe: i === 0 ? (visionResponse?.thumbnailCropSafe ?? true) : undefined,
          altText: visionResponse?.ai_alt_text || `Product image ${i + 1}`,
          detectedPhotoType: visionResponse?.detected_photo_type || 'unknown',
        };

        return { attributes, aiAnalysis };
      });

      const imageData = await Promise.all(imagePromises);

      // Run deterministic scoring
      const scoringResult = scoreListing(mode as ScoringMode, imageData);

      console.log(`[${requestId}] Deterministic scoring complete:`, {
        mode: scoringResult.mode,
        imageQualityScore: scoringResult.imageQualityScore,
        photoCount: imageData.length
      });
      // Persist analysis to database for optimize workflow
      const analysis = await prisma.listingAnalysis.create({
        data: {
          overallListingScore: scoringResult.imageQualityScore,
          mainImageScore: scoringResult.imageResults[0]?.score || 0,
          averageImageScore: scoringResult.imageQualityScore,
          imageScores: scoringResult.imageResults.map(r => r.score),
          imageResults: scoringResult.imageResults,
          detectedPhotoTypes: scoringResult.imageResults.map(r => r.photoType).filter(Boolean),
          missingPhotoTypes: [],
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        }
      });

      console.log(`[${requestId}] Analysis persisted with id: ${analysis.id}`);

      return NextResponse.json({
  success: true,
  analysis_id: analysis.id,
  mode: scoringResult.mode,

        // A) Image Quality Score
        imageQualityScore: scoringResult.imageQualityScore,
        imageResults: scoringResult.imageResults,

        // B) Listing Completeness
        listingCompleteness: scoringResult.listingCompleteness,

        // C) Conversion Headroom
        conversionHeadroom: scoringResult.conversionHeadroom,

        // Listing-level multipliers (only in evaluate_full_listing mode)
        photoCountMultiplier: scoringResult.photoCountMultiplier,
        redundancyPenalty: scoringResult.redundancyPenalty,
        finalListingScore: scoringResult.finalListingScore,

        imageCount: imageData.length
      });
    }

    // ===========================================
    // LEGACY PATH: TWO-ENGINE MODEL (backward compatibility)
    // ===========================================
    console.log(`[${requestId}] Using LEGACY scoring path (no MODE specified)`);

    // Process all images in parallel (10-20x faster for multiple images)
    console.log(`[${requestId}] Analyzing ${imageFiles.length} images in parallel...`);

    const imagePromises = imageFiles.map(async (file, i) => {
      const isMainImage = i === 0;

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

        const etsyCompliance = calculateEtsyCompliance(specs);

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
            throw new Error(`AI score missing for image ${i + 1} after retry`);
          }
        }

        const visualQuality = visionResponse.ai_score;

        // ===========================================
        // CALCULATE FINAL SCORE (WEIGHTED COMBINATION)
        // ===========================================
        const finalScore = calculateFinalScore(visualQuality, etsyCompliance.overallCompliance);

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

        // Return result with BOTH scores and specs
        return {
          result: {
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
          },
          specs
        };

      } catch (imageError: any) {
        console.error(`[${requestId}] Failed to analyze image ${i + 1}:`, imageError);
        throw new Error(`Failed to analyze image ${i + 1}: ${imageError.message}`);
      }
    });

    let processedImages;
    try {
      processedImages = await Promise.all(imagePromises);
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: 'IMAGE_ANALYSIS_FAILED', details: error.message },
        { status: 500 }
      );
    }

    const imageResults = processedImages.map(p => p.result);
    const technicalSpecs = processedImages.map(p => p.specs);
    
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
