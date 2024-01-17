import { Sha256 } from "@aws-crypto/sha256-browser";

export const randomUUID = globalThis.crypto.randomUUID;

export const createSHA256 = () => {
  return new Sha256();
};

// on edge runtime, there is always pretend to be a linux system
export const EOL = "\n";
