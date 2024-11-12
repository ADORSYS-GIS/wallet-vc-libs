import {
  base64UrlEncode,
  base64UrlEncodeService,
} from '../utils/base64UrlEncode';
import { concatenateKeyStrings } from '../utils/concatenateKeyStrings';

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

// ENCODING STRINGS

describe('base64UrlEncodeService', () => {
  it('should correctly encode a given string in base64url format', () => {
    const input = 'hello world';
    const expectedOutput = 'aGVsbG8gd29ybGQ';

    const result = base64UrlEncodeService(input);
    expect(result).toBe(expectedOutput);
  });

  it('should handle an empty string correctly', () => {
    const input = '';
    const expectedOutput = '';

    const result = base64UrlEncodeService(input);
    expect(result).toBe(expectedOutput);
  });

  it('should handle special characters correctly', () => {
    const input = 'test@example.com';
    const expectedOutput = 'dGVzdEBleGFtcGxlLmNvbQ';

    const result = base64UrlEncodeService(input);
    expect(result).toBe(expectedOutput);
  });
});

// CONCATENATING STRINGS

describe('concatenateKeyStrings', () => {
  it('should concatenate multiple strings into one', () => {
    const result = concatenateKeyStrings('hello', ' ', 'world');
    expect(result).toBe('hello world');
  });

  it('should return a single string unchanged', () => {
    const result = concatenateKeyStrings('single');
    expect(result).toBe('single');
  });

  it('should return an empty string if no strings are provided', () => {
    const result = concatenateKeyStrings();
    expect(result).toBe('');
  });
});
