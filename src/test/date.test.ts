import { describe, it, expect } from 'vitest';
import { getLocalDateString, formatDate, formatTime } from '../utils/date';

describe('getLocalDateString', () => {
  it('should return today in YYYY-MM-DD format when no argument', () => {
    const result = getLocalDateString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should format a given date string', () => {
    const result = getLocalDateString('2025-06-15');
    expect(result).toBe('2025-06-15');
  });

  it('should handle ISO date strings', () => {
    const result = getLocalDateString('2025-06-15T10:30:00Z');
    expect(result).toBe('2025-06-15');
  });
});

describe('formatDate', () => {
  it('should return N/A for undefined', () => {
    expect(formatDate()).toBe('N/A');
  });

  it('should return N/A for null', () => {
    expect(formatDate(null)).toBe('N/A');
  });

  it('should return N/A for empty string', () => {
    expect(formatDate('')).toBe('N/A');
  });

  it('should format valid date in DD/MM/YYYY format', () => {
    const result = formatDate('2025-06-15');
    // es-ES locale with UTC, expecting something like 15/06/2025
    expect(result).toMatch(/15\/06\/2025/);
  });

  it('should handle dates consistently regardless of timezone', () => {
    // The function appends T00:00:00Z to prevent timezone shift
    const result = formatDate('2025-01-01');
    expect(result).toContain('01');
    expect(result).toContain('2025');
  });
});

describe('formatTime', () => {
  it('should return --:-- for undefined', () => {
    expect(formatTime()).toBe('--:--');
  });

  it('should return --:-- for null', () => {
    expect(formatTime(null)).toBe('--:--');
  });

  it('should format valid datetime string', () => {
    const result = formatTime('2025-06-15T14:30:00Z');
    expect(result).toBeTruthy();
    expect(result).not.toBe('--:--');
  });

  it('should return --:-- for invalid date', () => {
    expect(formatTime('not-a-date')).toBe('--:--');
  });
});
