import { describe, expect, it } from 'vitest';
import { normalizeToArray } from '../misc';

describe('misc utils', () => {
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