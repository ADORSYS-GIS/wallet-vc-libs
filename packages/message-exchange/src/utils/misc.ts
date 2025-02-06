/**
 * Generates a UUID for random identifiers.
 */
export function generateUuid(): string {
  return crypto.randomUUID();
}

/**
 * Returns current unix timestamp in seconds.
 */
export function currentTimestampInSecs(): number {
  return Math.floor(new Date().getTime() / 1000);
}

/**
 * Checks if a string is an HTTP(S) URL.
 */
export function isHttpUrl(url: string): boolean {
  return ['http://', 'https://'].some((scheme) => url.startsWith(scheme));
}

/**
 * Normalizes a value into an array.
 *
 * This function ensures that the input value is always returned as an array.
 * - If the input is already an array, it is returned as-is.
 * - If the input is a single value, it is wrapped in an array.
 * - If the input is `null` or `undefined`, it is filtered out, and an empty array is returned.
 *
 * @template T - The type of the value(s) to normalize.
 * @param {T | Array<T> | undefined} val - The value or array of values to normalize.
 * @returns {Array<T>} - An array containing the normalized value(s). If the input is `null` or `undefined`, an empty array is returned.
 *
 * @example
 * normalizeToArray(42); // Returns [42]
 * normalizeToArray([1, 2, 3]); // Returns [1, 2, 3]
 * normalizeToArray(null); // Returns []
 * normalizeToArray(undefined); // Returns []
 */
export function normalizeToArray<T>(val?: T | Array<T>): Array<T> {
  if (Array.isArray(val)) {
    return val;
  }

  return [val as T].filter((e) => e != null && e != undefined);
}
