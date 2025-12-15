import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Upload images to Supabase Storage (proper approach for production)
// This avoids payload size limits and token limits
export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  try {
    console.log(`[${requestId}] Processing file upload...`);

    // Get file from form data
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'no_file',
            message: 'No image file provided',
            requestId,
          },
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'invalid_file_type',
            message: 'File must be an image',
            requestId,
          },
        },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'file_too_large',
            message: 'Image must be less than 10MB',
            requestId,
          },
        },
        { status: 400 }
      );
    }

    console.log(`[${requestId}] Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) to Supabase Storage...`);

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${requestId}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('product-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error(`[${requestId}] Supabase upload error:`, uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(filePath);

    const imageUrl = urlData.publicUrl;

    console.log(`[${requestId}] File uploaded successfully to: ${imageUrl}`);

    return NextResponse.json({
      ok: true,
      imageUrl: imageUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      requestId,
    });

  } catch (error: any) {
    console.error(`[${requestId}] Error uploading file:`, error);

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'internal_error',
          message: error.message || 'Internal server error',
          requestId,
        },
      },
      { status: 500 }
    );
  }
}

