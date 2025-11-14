import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

// File upload endpoint - uploads to Supabase storage and returns URL
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

    // Upload to Supabase Storage
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const fileName = `${requestId}-${file.name}`;
    const filePath = `uploads/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error(`[${requestId}] Supabase upload error:`, uploadError);
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'upload_failed',
            message: uploadError.message || 'Failed to upload image',
            requestId,
          },
        },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    console.log(`[${requestId}] File uploaded successfully: ${urlData.publicUrl}`);

    return NextResponse.json({
      ok: true,
      imageUrl: urlData.publicUrl,
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
