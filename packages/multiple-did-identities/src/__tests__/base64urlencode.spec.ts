import { base64UrlEncode } from '../utils/base64UrlEncode';

describe('base64UrlEncode', () => {
  it('should encode a simple Uint8Array to base64 URL-safe string', () => {
    const data = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
    const result = base64UrlEncode(data);
    expect(result).toBe('SGVsbG8');
  });

  it('should encode binary data to base64 URL-safe string', () => {
    const data = new Uint8Array([255, 255, 255]); // [255, 255, 255]
    const result = base64UrlEncode(data);
    expect(result).toBe('____');
  });

  it('should remove trailing "=" padding characters', () => {
    const data = new Uint8Array([1, 2, 3]);
    const result = base64UrlEncode(data);
    expect(result.endsWith('=')).toBe(false);
  });

  it('should handle an empty Uint8Array and return an empty string', () => {
    const data = new Uint8Array([]);
    const result = base64UrlEncode(data);
    expect(result).toBe('');
  });
});
