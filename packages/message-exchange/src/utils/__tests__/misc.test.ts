import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  currentTimestampInSecs,
  generateUuid,
  isHttpUrl,
} from '../misc';

describe('utils (misc)', () => {
  describe('generateUuid', () => {
    it('should generate a valid UUID', () => {
      const uuid = generateUuid();
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });
  });

  describe('currentTimestampInSecs', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return the current timestamp in seconds', () => {
      expect(currentTimestampInSecs()).toBe(1735689600);
    });
  });

  describe('isHttpUrl', () => {
    it.each([
      ['http://example.com', true],
      ['https://example.com', true],
      ['ftp://example.com', false],
      ['example.com', false],
      ['', false],
    ])('should return %s for URL "%s"', (url, expected) => {
      expect(isHttpUrl(url)).toBe(expected);
    });
  });
});
