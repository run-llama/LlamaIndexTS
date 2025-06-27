import { filetypemime } from "magic-bytes.js";

/**
 * Converts a base64 string (without data: prefix) to a Uint8Array
 * @param base64 - The base64 string without data: prefix
 * @returns The Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  // Decode Base64 string
  const binaryString = atob(base64);

  // Convert binary string to Uint8Array
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

/**
 * Converts a Uint8Array to a base64 string.
 * @param uint8Array The Uint8Array to convert.
 * @returns The base64-encoded string.
 */
export function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < uint8Array.byteLength; i++) {
    // Asserts that the value is not undefined, for `noUncheckedIndexedAccess`
    binary += String.fromCharCode(uint8Array[i]!);
  }
  return btoa(binary);
}

/**
 * Extracts the MIME type from a data URL.
 * @param dataUrl The data URL string.
 * @returns The MIME type from the data URL.
 * @throws An error if the data URL is malformed.
 */
export function getMimeTypeFromDataUrl(dataUrl: string): string {
  if (!dataUrl.startsWith("data:")) {
    throw new Error("Not a data URL");
  }
  const commaIndex = dataUrl.indexOf(",");
  if (commaIndex === -1) {
    throw new Error("Invalid data URL format");
  }

  const header = dataUrl.slice(0, commaIndex);
  const semicolonIndex = header.indexOf(";base64");
  if (semicolonIndex === -1) {
    throw new Error("Invalid data URL format: missing base64 encoding");
  }

  return header.slice(5, semicolonIndex);
}

/**
 * Convert base64 data to Blob
 * @param base64 - The base64 string
 * @param mimeType - The MIME type of the file
 * @returns The Blob
 */
export function base64ToBlob(base64: string, mimeType?: string): Blob {
  let extractedMimeType = mimeType;
  let base64Data = base64;

  // Extract mimeType from data URL if not provided
  if (!mimeType && base64.startsWith("data:")) {
    extractedMimeType = getMimeTypeFromDataUrl(base64);
    base64Data = base64.slice(base64.indexOf(",") + 1);
  } else if (!mimeType) {
    throw new Error(
      "No MIME type provided and base64 is not in data URL format",
    );
  } else {
    // Extract base64 data from data URL if present
    const commaIndex = base64.indexOf(",");
    base64Data = commaIndex !== -1 ? base64.slice(commaIndex + 1) : base64;
  }

  if (!extractedMimeType) {
    throw new Error("No MIME type found in base64 data");
  }

  // convert base64 to Uint8Array
  const bytes = base64ToUint8Array(base64Data);

  // Create Blob
  return new Blob([bytes], { type: extractedMimeType });
}

export async function blobToDataUrl(input: Blob) {
  const arrayBuffer = await input.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const mimes = filetypemime(uint8Array);
  if (mimes.length < 1) {
    throw new Error("Unsupported image type");
  }
  const base64 = uint8ArrayToBase64(uint8Array);
  return `data:${mimes[0]};base64,${base64}`;
}
