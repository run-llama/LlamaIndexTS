import type { JSONValue } from "@llamaindex/core/global";
import type { ImageType } from "@llamaindex/core/schema";
import { fs } from "@llamaindex/env";
import { filetypemime } from "magic-bytes.js";

export const isAsyncIterable = (
  obj: unknown,
): obj is AsyncIterable<unknown> => {
  return obj != null && typeof obj === "object" && Symbol.asyncIterator in obj;
};

export const isReadableStream = (obj: unknown): obj is ReadableStream => {
  return obj instanceof ReadableStream;
};

export const isIterable = (obj: unknown): obj is Iterable<unknown> => {
  return obj != null && typeof obj === "object" && Symbol.iterator in obj;
};

/**
 * Prettify an error for AI to read
 */
export function prettifyError(error: unknown): string {
  if (error instanceof Error) {
    return `Error(${error.name}): ${error.message}`;
  } else {
    return `${error}`;
  }
}

export function stringifyJSONToMessageContent(value: JSONValue): string {
  return JSON.stringify(value, null, 2).replace(/"([^"]*)"/g, "$1");
}

async function blobToDataUrl(input: Blob) {
  const buffer = Buffer.from(await input.arrayBuffer());
  const mimes = filetypemime(buffer);
  if (mimes.length < 1) {
    throw new Error("Unsupported image type");
  }
  return "data:" + mimes[0] + ";base64," + buffer.toString("base64");
}

export async function imageToString(input: ImageType): Promise<string> {
  if (input instanceof Blob) {
    // if the image is a Blob, convert it to a base64 data URL
    return await blobToDataUrl(input);
  } else if (typeof input === "string") {
    return input;
  } else if (input instanceof URL) {
    return input.toString();
  } else {
    throw new Error(`Unsupported input type: ${typeof input}`);
  }
}

export function stringToImage(input: string): ImageType {
  if (input.startsWith("data:")) {
    // if the input is a base64 data URL, convert it back to a Blob
    const base64Data = input.split(",")[1]!;
    const byteArray = Buffer.from(base64Data, "base64");
    return new Blob([byteArray]);
  } else if (input.startsWith("http://") || input.startsWith("https://")) {
    return new URL(input);
  } else {
    return input;
  }
}

export async function imageToDataUrl(
  input: ImageType | Uint8Array,
): Promise<string> {
  // first ensure, that the input is a Blob
  if (
    (input instanceof URL && input.protocol === "file:") ||
    typeof input === "string"
  ) {
    // string or file URL
    const dataBuffer = await fs.readFile(
      input instanceof URL ? input.pathname : input,
    );
    input = new Blob([dataBuffer]);
  } else if (!(input instanceof Blob)) {
    if (input instanceof URL) {
      throw new Error(`Unsupported URL with protocol: ${input.protocol}`);
    } else if (input instanceof Uint8Array) {
      input = new Blob([input]); // convert Uint8Array to Blob
    } else {
      throw new Error(`Unsupported input type: ${typeof input}`);
    }
  }
  return await blobToDataUrl(input);
}
