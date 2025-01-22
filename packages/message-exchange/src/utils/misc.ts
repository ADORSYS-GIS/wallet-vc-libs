/**
 * Generates a UUID for random identifiers.
 */
export function generateUuid(): string {
  return crypto.randomUUID();
}

/**
 * Returns current unix timestamp in seconds.
 */
export const currentTimestampInSecs = (): number => {
  return Math.floor(new Date().getTime() / 1000);
};
