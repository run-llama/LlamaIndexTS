/**
 * Converts a Uint8Array to a base64 string.
 * For large arrays, it processes the data in chunks to avoid memory issues.
 * Falls back to Buffer if available for better performance.
 *
 * @param bytes - The Uint8Array to convert
 * @returns The base64 string representation
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  // Use Buffer if available (Node.js environment)
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }

  // For browsers and other environments without Buffer
  // Process in chunks for large arrays to avoid memory issues
  const CHUNK_SIZE = 32768; // 32KB chunks
  let result = "";

  // For small arrays, use the built-in btoa function directly
  if (bytes.length < CHUNK_SIZE) {
    const binary = Array.from(bytes)
      .map((byte) => String.fromCharCode(byte))
      .join("");
    return globalThis.btoa(binary);
  }

  // For large arrays, process in chunks
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE);
    const binary = Array.from(chunk)
      .map((byte) => String.fromCharCode(byte))
      .join("");
    result += globalThis.btoa(binary);
  }

  return result;
}
