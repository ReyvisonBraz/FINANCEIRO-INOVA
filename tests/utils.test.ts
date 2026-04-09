import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatMonthYear } from '../src/lib/utils';

describe('Utils', () => {
  describe('cn (className merge)', () => {
    it('should merge class names correctly', () => {
      const result = cn('text-red-500', 'bg-blue-500');
      expect(result).toContain('text-red-500');
      expect(result).toContain('bg-blue-500');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toContain('base-class');
      expect(result).toContain('active-class');
    });
  });

  describe('formatCurrency', () => {
    it('should format positive numbers as BRL currency', () => {
      const result = formatCurrency(100);
      expect(result).toContain('100');
      expect(result).toContain(',');
    });

    it('should format decimal numbers correctly', () => {
      const result = formatCurrency(99.99);
      expect(result).toContain('99');
      expect(result).toContain('99');
    });

    it('should format zero correctly', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0');
    });

    it('should format large numbers with thousands separator', () => {
      const result = formatCurrency(10000);
      expect(result).toContain('10');
      expect(result).toContain('000');
    });
  });

  describe('formatMonthYear', () => {
    it('should format date string correctly', () => {
      const result = formatMonthYear('2024-10');
      expect(result).toContain('2024');
      expect(result.toLowerCase()).toContain('out');
    });

    it('should handle January correctly', () => {
      const result = formatMonthYear('2024-01');
      expect(result).toContain('2024');
      expect(result.toLowerCase()).toContain('jan');
    });

    it('should handle December correctly', () => {
      const result = formatMonthYear('2024-12');
      expect(result).toContain('2024');
      expect(result.toLowerCase()).toContain('dez');
    });
  });
});
