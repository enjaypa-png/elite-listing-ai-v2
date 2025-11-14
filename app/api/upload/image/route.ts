import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Simple file upload that converts to base64 data URL
// This avoids needing Supabase storage bucket setup
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

    // Validate file size (max 5MB for base64 conversion)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'file_too_large',
            message: 'Image must be less than 5MB',
            requestId,
          },
        },
        { status: 400 }
      );
    }

    // Convert to base64 data URL
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    console.log(`[${requestId}] File converted to base64 successfully`);

    return NextResponse.json({
      ok: true,
      imageUrl: dataUrl,
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

