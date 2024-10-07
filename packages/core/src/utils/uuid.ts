import { createSHA256 } from "@llamaindex/env";

export function UUIDFromString(input: string) {
  const hashFunction = createSHA256("hex");
  hashFunction.update(input);
  const hash = hashFunction.digest();

  // Format the hash to resemble a UUID (version 5 style)
  const uuid = [
    hash.substring(0, 8),
    hash.substring(8, 12),
    "5" + hash.substring(13, 16), // Set the version to 5 (name-based)
    ((parseInt(hash.substring(16, 18), 16) & 0x3f) | 0x80).toString(16) +
      hash.substring(18, 20), // Set the variant
    hash.substring(20, 32),
  ].join("-");

  return uuid;
}
