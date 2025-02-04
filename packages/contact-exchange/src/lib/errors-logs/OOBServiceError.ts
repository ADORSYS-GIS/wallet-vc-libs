export class OOBServiceError extends Error {
  public constructor(message: string) {
    super(`OOBServiceError: ${message}`);
    this.name = 'OOBServiceError';
  }
}
