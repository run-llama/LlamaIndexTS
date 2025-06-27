import {
  base64ToBlob,
  base64ToUint8Array,
  blobToDataUrl,
  getMimeTypeFromDataUrl,
  uint8ArrayToBase64,
} from "@llamaindex/core/utils";
import { describe, expect, it } from "vitest";

const testString = "LlamaIndex";
const testBase64 = "TGxhbWFJbmRleA=="; // btoa('LlamaIndex')
const testUint8Array = new TextEncoder().encode(testString);

const pngB64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const pngMime = "image/png";
const pngDataUrl = `data:${pngMime};base64,${pngB64}`;
const pngBinaryString = atob(pngB64);
const pngBytes = new Uint8Array(pngBinaryString.length);
for (let i = 0; i < pngBinaryString.length; i++) {
  pngBytes[i] = pngBinaryString.charCodeAt(i);
}

describe("Encoding utils", () => {
  describe("base64ToUint8Array", () => {
    it("should correctly convert a base64 string to a Uint8Array", () => {
      const result = base64ToUint8Array(testBase64);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result).toEqual(testUint8Array);
    });
  });

  describe("uint8ArrayToBase64", () => {
    it("should correctly convert a Uint8Array to a base64 string", () => {
      const result = uint8ArrayToBase64(testUint8Array);
      expect(result).toBe(testBase64);
    });
  });

  describe("getMimeTypeFromDataUrl", () => {
    it("should extract the correct MIME type from a data URL", () => {
      const result = getMimeTypeFromDataUrl(pngDataUrl);
      expect(result).toBe(pngMime);
    });

    it("should throw an error for non-data URLs", () => {
      expect(() => getMimeTypeFromDataUrl("not a data url")).toThrow(
        "Not a data URL",
      );
    });

    it("should throw an error for malformed data URLs", () => {
      expect(() => getMimeTypeFromDataUrl("data:image/pngbase64,abc")).toThrow(
        "Invalid data URL format: missing base64 encoding",
      );
      expect(() => getMimeTypeFromDataUrl("data:image/png;base64")).toThrow(
        "Invalid data URL format",
      );
    });
  });

  describe("base64ToBlob", () => {
    it("should convert from a data URL string", async () => {
      const blob = base64ToBlob(pngDataUrl);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe(pngMime);
      const arrayBuffer = await blob.arrayBuffer();
      expect(new Uint8Array(arrayBuffer)).toEqual(pngBytes);
    });

    it("should convert from a base64 string with an explicit MIME type", async () => {
      const blob = base64ToBlob(pngB64, pngMime);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe(pngMime);
      const arrayBuffer = await blob.arrayBuffer();
      expect(new Uint8Array(arrayBuffer)).toEqual(pngBytes);
    });

    it("should prioritize the explicit MIME type if a data URL is provided", async () => {
      const differentMime = "image/jpeg";
      const blob = base64ToBlob(pngDataUrl, differentMime);
      expect(blob.type).toBe(differentMime);
    });

    it("should throw an error if no MIME type can be determined", () => {
      expect(() => base64ToBlob(pngB64)).toThrow(
        "No MIME type provided and base64 is not in data URL format",
      );
    });
  });

  describe("blobToDataUrl", () => {
    it("should correctly convert a blob to a data URL", async () => {
      const blob = new Blob([pngBytes], { type: "image/png" });
      const result = await blobToDataUrl(blob);
      expect(result).toBe(pngDataUrl);
    });
  });
});
