import { createSHA256 } from "@llamaindex/env";

export function UUIDFromString(input: string) {
  const hashFunction = createSHA256();
  hashFunction.update(input);
  const base64Hash = hashFunction.digest();

  // Convert base64 to hex
  const hexHash = Buffer.from(base64Hash, "base64").toString("hex");

  // Format the hash to resemble a UUID (version 5 style)
  const uuid = [
    hexHash.substring(0, 8),
    hexHash.substring(8, 12),
    "5" + hexHash.substring(12, 15), // Set the version to 5 (name-based)
    ((parseInt(hexHash.substring(15, 17), 16) & 0x3f) | 0x80).toString(16) +
      hexHash.substring(17, 19), // Set the variant
    hexHash.substring(19, 31),
  ].join("-");

  return uuid;
}
