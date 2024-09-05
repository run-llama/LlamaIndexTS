type ObjectEntries<T extends Record<string, any>> = {
	[K in keyof T]: [K, T[K]];
}[keyof T][];

/**
 * Type safe version of `Object.entries`
 */
export function objectEntries<T extends Record<string, any>> (
	obj: T
): ObjectEntries<{
	[K in keyof T]-?: NonNullable<T[K]>
}> {
	return Object.entries(obj);
}