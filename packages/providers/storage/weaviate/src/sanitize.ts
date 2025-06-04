/**
 * Sanitize all keys in a metadata object to conform to Weaviate naming requirements
 */
export const sanitizeMetadata = <T extends Record<string, unknown>>(
  metadata: T,
): Record<string, T[keyof T]> => {
  const sanitized: Record<string, T[keyof T]> = {};
  for (const [key, value] of Object.entries(metadata)) {
    const sanitizedKey = sanitizePropertyName(key);
    if (sanitizedKey !== key) {
      console.warn(
        `Weaviate metadata property name "${key}" was sanitized to "${sanitizedKey}" to comply with GraphQL naming requirements.`,
      );
    }
    sanitized[sanitizedKey] = value as T[keyof T];
  }
  return sanitized;
}; /**
 * Sanitize property names to conform to Weaviate's GraphQL naming requirements.
 * Names must match the pattern [_A-Za-z][_0-9A-Za-z]*
 */

const sanitizePropertyName = (name: string): string => {
  // Replace invalid characters with underscores
  let sanitized = name.replace(/[^_A-Za-z0-9]/g, "_");

  // Ensure it starts with a letter or underscore
  if (!/^[_A-Za-z]/.test(sanitized)) {
    sanitized = "_" + sanitized;
  }

  // Remove consecutive underscores
  sanitized = sanitized.replace(/_+/g, "_");

  // Remove trailing underscores
  sanitized = sanitized.replace(/_+$/, "");

  // Ensure it's not empty
  if (!sanitized) {
    sanitized = "_property";
  }

  return sanitized;
};
