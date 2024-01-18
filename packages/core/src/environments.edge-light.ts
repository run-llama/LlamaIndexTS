import { Sha256 } from "@aws-crypto/sha256-browser";

export const randomUUID = () => {
  return globalThis.crypto.randomUUID();
};

export function dirname(path: string) {
  return path.split("/").at(-2)!;
}

export function join(...paths: string[]) {
  return paths.join("/");
}

export function fileTypeFromBuffer(buffer: Buffer) {
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: "jpg", mime: "image/jpeg" };
  } else if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return { ext: "png", mime: "image/png" };
  } else if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return { ext: "gif", mime: "image/gif" };
  } else if (
    buffer[0] === 0x42 &&
    buffer[1] === 0x4d &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return { ext: "bmp", mime: "image/bmp" };
  }
  return null;
}

export const createSHA256 = () => {
  return new Sha256();
};

// on edge runtime, there is always pretend to be a linux system
export const EOL = "\n";
