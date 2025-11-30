import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    
    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    console.log('[Analyze Image] Processing:', imageFile.name, imageFile.size, 'bytes');

    // Upload to Supabase first
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `analysis-${Date.now()}-${imageFile.name}`;
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('product-images')
      .upload(filename, buffer, {
        contentType: imageFile.type,
        cacheControl: '3600'
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(filename);
    
    const imageUrl = urlData.publicUrl;
    console.log('[Analyze Image] Uploaded to:', imageUrl);

    // Convert image to base64 for analysis
    const base64Image = buffer.toString('base64');
    const mimeType = imageFile.type || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    // Analyze image with OpenAI Vision
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert Etsy product photography analyzer. Analyze product photos for:
- Overall quality (composition, lighting, clarity)
- Specific issues (background, shadows, angles, etc.)
- Actionable suggestions for improvement
- Score out of 100

Return JSON format:
{
  "score": 75,
  "overallAssessment": "brief assessment",
  "strengths": ["strength1", "strength2"],
  "issues": ["issue1", "issue2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this Etsy product photo and provide a detailed quality assessment with score and suggestions.'
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl
              }
            }
          ]
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    console.log('[Analyze Image] Score:', analysis.score);

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      score: analysis.score || 0,
      overallAssessment: analysis.overallAssessment || 'Analysis complete',
      strengths: analysis.strengths || [],
      issues: analysis.issues || [],
      suggestions: analysis.suggestions || []
    });

  } catch (error: any) {
    console.error('[Analyze Image] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to analyze image'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: '/api/analyze-image',
    method: 'POST',
    description: 'Analyzes product photos using OpenAI Vision',
    accepts: 'multipart/form-data with "image" field',
    hasApiKey: !!process.env.OPENAI_API_KEY
  });
}
