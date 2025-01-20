/**
 * Generates a UUID for random identifiers.
 */
export function generateUuid(): string {
    return crypto.randomUUID();
}
