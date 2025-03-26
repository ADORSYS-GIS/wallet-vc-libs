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