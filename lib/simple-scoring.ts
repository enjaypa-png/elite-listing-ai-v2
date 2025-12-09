export function calculateSimpleScore(imageMetadata: any) {
  let score = 0;
  
  console.log('[SIMPLE SCORE] Input metadata:', imageMetadata);
  
  // Hardcoded rules - no database, no AI
  if (imageMetadata.width >= 2000) {
    score += 20;
    console.log('[SIMPLE SCORE] Width check passed: +20');
  }
  if (imageMetadata.height >= 2000) {
    score += 20;
    console.log('[SIMPLE SCORE] Height check passed: +20');
  }
  if (imageMetadata.fileSize < 1000000) {
    score += 20;
    console.log('[SIMPLE SCORE] File size check passed: +20');
  }
  const aspectRatio = imageMetadata.width / imageMetadata.height;
  if (aspectRatio >= 1.2 && aspectRatio <= 1.4) {
    score += 20;
    console.log('[SIMPLE SCORE] Aspect ratio check passed: +20');
  }
  
  console.log('[SIMPLE SCORE] Final score:', score);
  return score;
}
