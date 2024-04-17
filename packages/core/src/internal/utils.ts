export const isAsyncGenerator = (obj: unknown): obj is AsyncGenerator => {
  return obj != null && typeof obj === "object" && Symbol.asyncIterator in obj;
};

export const isGenerator = (obj: unknown): obj is Generator => {
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
