/**
 * SHA-256 Content Hash Utilities
 * Works in both browser (Web Crypto) and Node.js (crypto module)
 */

/**
 * Compute SHA-256 hash of a buffer/ArrayBuffer
 * Returns hex string
 */
export async function computeContentHash(data: ArrayBuffer | Buffer): Promise<string> {
  // Convert Buffer to ArrayBuffer if needed
  const arrayBuffer = data instanceof Buffer 
    ? data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
    : data;
  
  // Use Web Crypto API (works in browser and Node 18+)
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * Compute SHA-256 hash from a File object (browser)
 */
export async function computeFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  return computeContentHash(arrayBuffer);
}
