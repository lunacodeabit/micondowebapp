import { describe, it, expect } from 'vitest';
import { recalculateBalances, calculateAgingBalances } from '../utils/finance';
import type { Transaction, AccountHistoryItem } from '../types';

describe('recalculateBalances', () => {
  it('should return empty array for empty input', () => {
    expect(recalculateBalances([], 0)).toEqual([]);
  });

  it('should add income to running balance', () => {
    const transactions: Transaction[] = [
      { id: '1', date: '2025-01-01', type: 'Ingreso', description: 'Cuota', amount: 5000, balance: 0, category: null },
    ];
    const result = recalculateBalances(transactions, 0);
    expect(result[0].balance).toBe(5000);
  });

  it('should subtract expenses from running balance', () => {
    const transactions: Transaction[] = [
      { id: '1', date: '2025-01-01', type: 'Egreso', description: 'Electricidad', amount: 2000, balance: 0, category: null },
    ];
    const result = recalculateBalances(transactions, 10000);
    expect(result[0].balance).toBe(8000);
  });

  it('should apply initial balance correctly', () => {
    const transactions: Transaction[] = [
      { id: '1', date: '2025-01-01', type: 'Ingreso', description: 'Cuota', amount: 3000, balance: 0, category: null },
      { id: '2', date: '2025-01-15', type: 'Egreso', description: 'Limpieza', amount: 1000, balance: 0, category: null },
    ];
    const result = recalculateBalances(transactions, 5000);
    expect(result[0].balance).toBe(8000);
    expect(result[1].balance).toBe(7000);
  });

  it('should sort transactions by date', () => {
    const transactions: Transaction[] = [
      { id: '2', date: '2025-02-01', type: 'Egreso', description: 'B', amount: 500, balance: 0, category: null },
      { id: '1', date: '2025-01-01', type: 'Ingreso', description: 'A', amount: 1000, balance: 0, category: null },
    ];
    const result = recalculateBalances(transactions, 0);
    expect(result[0].description).toBe('A');
    expect(result[0].balance).toBe(1000);
    expect(result[1].balance).toBe(500);
  });

  it('should handle negative amounts correctly (treat as absolute)', () => {
    const transactions: Transaction[] = [
      { id: '1', date: '2025-01-01', type: 'Egreso', description: 'Gasto', amount: -3000, balance: 0, category: null },
    ];
    const result = recalculateBalances(transactions, 10000);
    expect(result[0].balance).toBe(7000);
  });
});

describe('calculateAgingBalances', () => {
  const asOfDate = new Date('2025-03-15T00:00:00Z');

  it('should return zero aging for empty history', () => {
    const aging = calculateAgingBalances([], asOfDate);
    expect(aging.total).toBe(0);
    expect(aging.current).toBe(0);
  });

  it('should categorize recent debt as current (0-30 days)', () => {
    const history: AccountHistoryItem[] = [
      { id: '1', date: '2025-03-01', type: 'Cargo', description: 'Cuota', amount: 5000 },
    ];
    const aging = calculateAgingBalances(history, asOfDate);
    expect(aging.current).toBe(5000);
    expect(aging.total).toBe(5000);
  });

  it('should categorize 31-60 day old debt correctly', () => {
    const history: AccountHistoryItem[] = [
      { id: '1', date: '2025-02-01', type: 'Cargo', description: 'Cuota', amount: 3000 },
    ];
    const aging = calculateAgingBalances(history, asOfDate);
    expect(aging['31-60']).toBe(3000);
  });

  it('should categorize 91+ day old debt correctly', () => {
    const history: AccountHistoryItem[] = [
      { id: '1', date: '2024-11-01', type: 'Cargo', description: 'Vieja', amount: 2000 },
    ];
    const aging = calculateAgingBalances(history, asOfDate);
    expect(aging['91+']).toBe(2000);
  });

  it('should subtract credits from oldest charges first', () => {
    const history: AccountHistoryItem[] = [
      { id: '1', date: '2025-03-01', type: 'Cargo', description: 'Cuota Mar', amount: 5000 },
      { id: '2', date: '2025-02-01', type: 'Cargo', description: 'Cuota Feb', amount: 5000 },
      { id: '3', date: '2025-03-10', type: 'Abono', description: 'Pago', amount: 5000 },
    ];
    const aging = calculateAgingBalances(history, asOfDate);
    // Credit covers the Feb charge entirely, Mar charge remains
    expect(aging.current).toBe(5000);
    expect(aging['31-60']).toBe(0);
    expect(aging.total).toBe(5000);
  });

  it('should handle partial payments correctly', () => {
    const history: AccountHistoryItem[] = [
      { id: '1', date: '2025-03-01', type: 'Cargo', description: 'Cuota', amount: 5000 },
      { id: '2', date: '2025-03-05', type: 'Abono', description: 'Pago parcial', amount: 2000 },
    ];
    const aging = calculateAgingBalances(history, asOfDate);
    expect(aging.current).toBe(3000);
    expect(aging.total).toBe(3000);
  });
});
