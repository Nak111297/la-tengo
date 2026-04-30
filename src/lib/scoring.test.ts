import { describe, test, expect } from 'vitest';
import { getBasePoints, calculateScore } from './scoring';

describe('scoring', () => {
  test('base points: 3s = 5, 5s = 4, 10s = 3, 30s = 2', () => {
    expect(getBasePoints(3)).toBe(5);
    expect(getBasePoints(5)).toBe(4);
    expect(getBasePoints(10)).toBe(3);
    expect(getBasePoints(30)).toBe(2);
  });

  test('full correct at 3 seconds with both bonuses = 7', () => {
    expect(calculateScore(3, true, true, false)).toBe(7);
  });

  test('correct at 5 seconds, artist only = 5', () => {
    expect(calculateScore(5, true, false, false)).toBe(5);
  });

  test('correct at 10 seconds, song only = 4', () => {
    expect(calculateScore(10, false, true, false)).toBe(4);
  });

  test('correct at 30 seconds, no bonuses = 2', () => {
    expect(calculateScore(30, false, false, false)).toBe(2);
  });

  test('steal with both bonuses = 3', () => {
    expect(calculateScore(30, true, true, true)).toBe(3);
  });

  test('steal with no bonuses = 1', () => {
    expect(calculateScore(30, false, false, true)).toBe(1);
  });

  test('steal with artist only = 2', () => {
    expect(calculateScore(30, true, false, true)).toBe(2);
  });
});
