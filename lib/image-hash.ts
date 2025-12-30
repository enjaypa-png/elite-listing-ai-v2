import crypto from 'crypto';

/**
 * Calculate SHA-256 hash of image buffer for deterministic caching
 * Same image = same hash = same AI analysis = deterministic scores
 */
export function calculateImageHash(buffer: Buffer): string {
  return crypto
    .createHash('sha256')
    .update(buffer)
    .digest('hex');
}

/**
 * Check if two images are identical by comparing hashes
 */
export function areImagesIdentical(buffer1: Buffer, buffer2: Buffer): boolean {
  return calculateImageHash(buffer1) === calculateImageHash(buffer2);
}
