/**
 * OBJECT DETECTION - Google Cloud Vision API
 *
 * Detects product bounding boxes and calculates product fill percentage
 * Used to intelligently zoom/crop images to achieve Etsy's recommended 70-80% product fill
 */

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ProductDetectionResult {
  boundingBox: BoundingBox;
  productFillPercent: number;
  confidence: number;
  needsZoom: boolean; // true if product fill < 70%
  recommendedZoom: number; // factor to achieve ~75% fill
}

/**
 * Detect product in image using Google Cloud Vision API
 * Returns bounding box and product fill percentage
 */
export async function detectProduct(
  imageBase64: string,
  imageWidth: number,
  imageHeight: number
): Promise<ProductDetectionResult | null> {

  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.error('[Object Detection] GOOGLE_API_KEY not found');
    return null;
  }

  try {
    console.log('[Object Detection] Detecting product bounds with Google Vision...');

    const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

    const requestBody = {
      requests: [
        {
          image: {
            content: imageBase64,
          },
          features: [
            {
              type: 'OBJECT_LOCALIZATION',
              maxResults: 5,
            },
          ],
        },
      ],
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Object Detection] Google Vision error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    const annotations = data.responses?.[0]?.localizedObjectAnnotations;

    if (!annotations || annotations.length === 0) {
      console.log('[Object Detection] No objects detected in image');
      return null;
    }

    // Find the largest/most confident object (likely the main product)
    const mainObject = annotations.reduce((prev: any, current: any) => {
      return (current.score > prev.score) ? current : prev;
    });

    console.log('[Object Detection] Detected:', mainObject.name, '| Confidence:', mainObject.score);

    // Convert normalized vertices to pixel coordinates
    const vertices = mainObject.boundingPoly.normalizedVertices;
    const minX = Math.min(...vertices.map((v: any) => v.x)) * imageWidth;
    const maxX = Math.max(...vertices.map((v: any) => v.x)) * imageWidth;
    const minY = Math.min(...vertices.map((v: any) => v.y)) * imageHeight;
    const maxY = Math.max(...vertices.map((v: any) => v.y)) * imageHeight;

    const boundingBox: BoundingBox = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };

    // Calculate product fill percentage
    const productArea = boundingBox.width * boundingBox.height;
    const imageArea = imageWidth * imageHeight;
    const productFillPercent = (productArea / imageArea) * 100;

    // Determine if zoom is needed and calculate factor
    const targetFill = 75; // Aim for middle of 70-80% range
    const needsZoom = productFillPercent < 70;

    // Calculate zoom factor to achieve target fill
    // zoomFactor = sqrt(targetFill / currentFill)
    const recommendedZoom = needsZoom
      ? Math.sqrt(targetFill / productFillPercent)
      : 1.0;

    console.log('[Object Detection] Product fill:', productFillPercent.toFixed(1) + '%', '| Needs zoom:', needsZoom);

    return {
      boundingBox,
      productFillPercent,
      confidence: mainObject.score,
      needsZoom,
      recommendedZoom: Math.min(recommendedZoom, 2.0), // Cap at 2x zoom
    };

  } catch (error: any) {
    console.error('[Object Detection] Error:', error.message);
    return null;
  }
}

/**
 * Calculate smart crop coordinates to achieve target product fill
 *
 * @param originalWidth - Original image width
 * @param originalHeight - Original image height
 * @param productBox - Detected product bounding box
 * @param targetFillPercent - Target product fill (default 75%)
 * @param targetAspectRatio - Target aspect ratio width/height (default 4/3 for Etsy)
 * @returns Crop coordinates {x, y, width, height}
 */
export function calculateSmartCrop(
  originalWidth: number,
  originalHeight: number,
  productBox: BoundingBox,
  targetFillPercent: number = 75,
  targetAspectRatio: number = 4 / 3
): BoundingBox {

  // Calculate product center
  const productCenterX = productBox.x + (productBox.width / 2);
  const productCenterY = productBox.y + (productBox.height / 2);

  // Calculate required crop dimensions to achieve target fill
  const productArea = productBox.width * productBox.height;
  const targetCropArea = productArea / (targetFillPercent / 100);

  // Calculate crop dimensions maintaining target aspect ratio
  // cropWidth / cropHeight = targetAspectRatio
  // cropWidth * cropHeight = targetCropArea
  // Therefore: cropWidth = sqrt(targetCropArea * targetAspectRatio)
  let cropWidth = Math.sqrt(targetCropArea * targetAspectRatio);
  let cropHeight = cropWidth / targetAspectRatio;

  // Ensure crop doesn't exceed original image dimensions
  if (cropWidth > originalWidth) {
    cropWidth = originalWidth;
    cropHeight = cropWidth / targetAspectRatio;
  }
  if (cropHeight > originalHeight) {
    cropHeight = originalHeight;
    cropWidth = cropHeight * targetAspectRatio;
  }

  // Center crop on product
  let cropX = productCenterX - (cropWidth / 2);
  let cropY = productCenterY - (cropHeight / 2);

  // Adjust if crop exceeds image bounds
  if (cropX < 0) cropX = 0;
  if (cropY < 0) cropY = 0;
  if (cropX + cropWidth > originalWidth) cropX = originalWidth - cropWidth;
  if (cropY + cropHeight > originalHeight) cropY = originalHeight - cropHeight;

  return {
    x: Math.round(cropX),
    y: Math.round(cropY),
    width: Math.round(cropWidth),
    height: Math.round(cropHeight),
  };
}

/**
 * Check if image needs smart cropping for product fill
 */
export function needsSmartCrop(productFillPercent: number): boolean {
  return productFillPercent < 70 || productFillPercent > 85;
}
