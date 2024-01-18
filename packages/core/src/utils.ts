export function assertExists<T>(
  val: T | undefined | null,
  message = "Value unexpectedly not set",
): asserts val is T {
  if (val === undefined || val === null) {
    throw new Error(message);
  }
}
