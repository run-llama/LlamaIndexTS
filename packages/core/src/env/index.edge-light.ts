export const EOL = "\n";

export function ok(value: unknown, message?: string): asserts value {
  if (!value) {
    throw new Error(message);
  }
}

export function randomUUID(): string {
  return crypto.randomUUID();
}
