import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Maximum dimensions for images (to keep base64 size manageable for OpenAI)
const MAX_WIDTH = 2000;
const MAX_HEIGHT = 2000;
const JPEG_QUALITY = 85;

// Simple file upload that converts to base64 data URL
// Images are resized to reduce token usage in OpenAI Vision API
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

    // Validate file size (max 10MB before processing)
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

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    console.log(`[${requestId}] Original file size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

    // Resize and compress image using sharp
    const resizedBuffer = await sharp(inputBuffer)
      .resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true, // Don't upscale small images
      })
      .jpeg({ quality: JPEG_QUALITY })
      .toBuffer();

    console.log(`[${requestId}] Resized file size: ${(resizedBuffer.length / 1024 / 1024).toFixed(2)}MB`);

    // Convert to base64 data URL
    const base64 = resizedBuffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    // Estimate token usage (rough estimate: 1 token ≈ 4 chars for base64)
    const estimatedTokens = Math.ceil(dataUrl.length / 4);
    console.log(`[${requestId}] Estimated tokens: ${estimatedTokens.toLocaleString()}`);

    if (estimatedTokens > 25000) {
      console.warn(`[${requestId}] WARNING: Image may exceed OpenAI token limits`);
    }

    console.log(`[${requestId}] File processed successfully`);

    return NextResponse.json({
      ok: true,
      imageUrl: dataUrl,
      fileName: file.name,
      fileSize: resizedBuffer.length,
      fileType: 'image/jpeg',
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

