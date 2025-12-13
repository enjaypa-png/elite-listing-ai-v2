export const runtime = 'nodejs';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { fetchScoringRules, calculateScore, ImageAttributes } from '@/lib/database-scoring';
import { analyzeImageWithVision, mergeAttributes } from '@/lib/ai-vision';
import { calculateListingScore, ImageAnalysisResult } from '@/lib/listing-scoring';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * POST /api/analyze-listing
 * Analyzes multiple images as a complete Etsy listing
 */
export async function POST(request: NextRequest) {
  const requestId = randomUUID().substring(0, 8);
  console.log(`[${requestId}] Listing analysis started`);

  try {
    // ===========================================
    // 1. PARSE FORM DATA
    // ===========================================
    const formData = await request.formData();
    const category = formData.get('category') as string || 'single_image_scoring';
    
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
    // 2. CREATE SUPABASE CLIENT & FETCH SCORING RULES
    // ===========================================
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const rules = await fetchScoringRules(supabase);
    
    if (!rules) {
      return NextResponse.json(
        { success: false, error: 'Failed to load scoring rules' },
        { status: 500 }
      );
    }
    
    console.log(`[${requestId}] Rules loaded for category: ${category}`);
    
    // ===========================================
    // 3. ANALYZE EACH IMAGE
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
        
        // Extract technical metadata
        const metadata = await sharp(buffer).metadata();
        const stats = await sharp(buffer).stats();
        
        const technicalAttrs: ImageAttributes = {
          width_px: metadata.width || 0,
          height_px: metadata.height || 0,
          shortest_side: Math.min(metadata.width || 0, metadata.height || 0),
          file_size_bytes: buffer.length,
          file_type: file.type.split('/')[1] || 'jpeg',
          aspect_ratio: metadata.width && metadata.height 
            ? `${Math.round((metadata.width / metadata.height) * 100) / 100}:1`
            : '1:1',
          color_profile: metadata.space || 'sRGB',
          ppi: metadata.density || 72,
          // AI Vision fields (defaults)
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
        };
        
        // Run AI Vision analysis
        let visionResponse = null;
        try {
          visionResponse = await analyzeImageWithVision(buffer);
          console.log(`[${requestId}] Image ${i + 1}: AI Vision complete`);
        } catch (visionError) {
          console.error(`[${requestId}] Image ${i + 1}: AI Vision failed:`, visionError);
          // Continue with technical-only analysis
        }
        
        // Merge attributes
        const attributes = visionResponse 
          ? mergeAttributes(technicalAttrs, visionResponse)
          : technicalAttrs;
        
        // Calculate score using database rules
        const scoring = calculateScore(attributes, rules);
        
        // Detect photo types from AI Vision
        const photoTypes: string[] = [];
        if (attributes.has_studio_shot) photoTypes.push('studio_shot');
        if (attributes.has_lifestyle_shot) photoTypes.push('lifestyle_shot');
        if (attributes.has_detail_shot) photoTypes.push('detail_shot');
        if (attributes.has_scale_shot) photoTypes.push('scale_shot');
        if (attributes.has_group_shot) photoTypes.push('group_shot');
        if (attributes.has_packaging_shot) photoTypes.push('packaging_shot');
        if (attributes.has_process_shot) photoTypes.push('process_shot');
        
        // Add to results
        imageResults.push({
          imageIndex: i,
          score: scoring.total_score,
          feedback: scoring.feedback || [],
          photoTypes,
          technicalPoints: scoring.technical_points,
          photoTypePoints: scoring.photo_type_points,
          compositionPoints: scoring.composition_points,
          isMainImage
        });
        
        console.log(`[${requestId}] Image ${i + 1}: Score = ${scoring.total_score}, Types = ${photoTypes.join(', ')}`);
        
      } catch (imageError: any) {
        console.error(`[${requestId}] Failed to analyze image ${i + 1}:`, imageError);
        
        // Add failed result
        imageResults.push({
          imageIndex: i,
          score: 0,
          feedback: [{
            rule: 'image_processing',
            status: 'critical',
            message: `Failed to process image: ${imageError.message || 'Unknown error'}`
          }],
          photoTypes: [],
          technicalPoints: 0,
          photoTypePoints: 0,
          compositionPoints: 0,
          isMainImage
        });
      }
    }
    
    // ===========================================
    // 4. CALCULATE OVERALL LISTING SCORE
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
    // 5. RETURN RESPONSE
    // ===========================================
    return NextResponse.json({
      success: true,
      overallListingScore: listingScore.overallListingScore,
      mainImageScore: listingScore.mainImageScore,
      averageImageScore: listingScore.averageImageScore,
      varietyScore: listingScore.varietyScore,
      completenessBonus: listingScore.completenessBonus,
      detectedPhotoTypes: listingScore.detectedPhotoTypes,
      missingPhotoTypes: listingScore.missingPhotoTypes,
      breakdown: listingScore.breakdown,
      imageResults,
      imageCount: imageResults.length,
      category
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
