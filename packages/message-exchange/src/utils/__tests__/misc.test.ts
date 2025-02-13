import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  currentTimestampInSecs,
  generateUuid,
  isHttpUrl,
  normalizeToArray,
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

  describe('normalizeToArray', () => {
    it('should return an array when given a single value', () => {
      expect(normalizeToArray(42)).toEqual([42]);
    });

    it.each([[[1, 2, 3]], [[1, null, 2, undefined, 3]]])(
      'should return the same array when given an array',
      (arr) => {
        expect(normalizeToArray(arr)).toBe(arr);
      },
    );

    it('should return an empty array for null or undefined', () => {
      expect(normalizeToArray(null)).toEqual([]);
      expect(normalizeToArray(undefined)).toEqual([]);
    });
  });
});
