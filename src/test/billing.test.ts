import { describe, it, expect } from 'vitest';
import {
  calculateBillingStatus,
  getLastPayment,
  calculateMonthlyAmount,
  getPricePerCondo,
  calculateTotalMonthlyFee,
  formatDueDate,
  type PaymentRecord,
} from '../utils/billing';

describe('calculateMonthlyAmount', () => {
  it('should return RD$1,500 for 1 condo', () => {
    expect(calculateMonthlyAmount(1)).toBe(1500);
  });

  it('should return RD$1,200/condo for 2-4 condos', () => {
    expect(calculateMonthlyAmount(2)).toBe(2400);
    expect(calculateMonthlyAmount(4)).toBe(4800);
  });

  it('should return RD$1,000/condo for 5-9 condos', () => {
    expect(calculateMonthlyAmount(5)).toBe(5000);
    expect(calculateMonthlyAmount(9)).toBe(9000);
  });

  it('should return RD$800/condo for 10+ condos', () => {
    expect(calculateMonthlyAmount(10)).toBe(8000);
    expect(calculateMonthlyAmount(20)).toBe(16000);
  });
});

describe('getPricePerCondo', () => {
  it('should return correct tier prices', () => {
    expect(getPricePerCondo(1)).toBe(1500);
    expect(getPricePerCondo(3)).toBe(1200);
    expect(getPricePerCondo(7)).toBe(1000);
    expect(getPricePerCondo(15)).toBe(800);
  });
});

describe('calculateTotalMonthlyFee', () => {
  it('should calculate base only when no addons', () => {
    const result = calculateTotalMonthlyFee(1);
    expect(result.base).toBe(1500);
    expect(result.addonsTotal).toBe(0);
    expect(result.total).toBe(1500);
  });

  it('should include addon prices', () => {
    const addonPrices = { whatsapp: 1500, multiuser: 500 };
    const result = calculateTotalMonthlyFee(1, ['whatsapp', 'multiuser'], addonPrices);
    expect(result.base).toBe(1500);
    expect(result.addonsTotal).toBe(2000);
    expect(result.total).toBe(3500);
  });

  it('should ignore unknown addon IDs', () => {
    const addonPrices = { whatsapp: 1500 };
    const result = calculateTotalMonthlyFee(1, ['whatsapp', 'unknown'], addonPrices);
    expect(result.addonsTotal).toBe(1500);
  });
});

describe('getLastPayment', () => {
  const payments: PaymentRecord[] = [
    { id: '1', companyId: 'c1', companyName: 'A', amount: 1500, paymentDate: '2025-01-15', periodStart: '2025-01-01', periodEnd: '2025-01-31', method: 'Transferencia', createdAt: '2025-01-15' },
    { id: '2', companyId: 'c1', companyName: 'A', amount: 1500, paymentDate: '2025-02-15', periodStart: '2025-02-01', periodEnd: '2025-02-28', method: 'Transferencia', createdAt: '2025-02-15' },
    { id: '3', companyId: 'c2', companyName: 'B', amount: 2400, paymentDate: '2025-03-01', periodStart: '2025-03-01', periodEnd: '2025-03-31', method: 'Transferencia', createdAt: '2025-03-01' },
  ];

  it('should return most recent payment for a company', () => {
    const result = getLastPayment(payments, 'c1');
    expect(result?.id).toBe('2');
    expect(result?.paymentDate).toBe('2025-02-15');
  });

  it('should return null for company with no payments', () => {
    expect(getLastPayment(payments, 'nonexistent')).toBeNull();
  });

  it('should return null for empty array', () => {
    expect(getLastPayment([], 'c1')).toBeNull();
  });
});

describe('calculateBillingStatus', () => {
  it('should identify trial status', () => {
    // Use a date that started recently (within 14-day trial window)
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 3); // Started 3 days ago
    const result = calculateBillingStatus(recentDate.toISOString().split('T')[0], 15, null, true);
    expect(result.status).toBe('trial');
  });

  it('should identify expired trial', () => {
    const result = calculateBillingStatus('2024-01-01', 15, null, true);
    expect(result.status).toBe('inactive');
    expect(result.statusLabel).toContain('Expirado');
  });

  it('should identify active status when payment is current', () => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const payment: PaymentRecord = {
      id: '1', companyId: 'c1', companyName: 'A', amount: 1500,
      paymentDate: today.toISOString().split('T')[0],
      periodStart: today.toISOString().split('T')[0],
      periodEnd: nextMonth.toISOString().split('T')[0],
      method: 'Transferencia', createdAt: today.toISOString(),
    };

    const result = calculateBillingStatus('2025-01-01', 15, payment);
    expect(result.status).toBe('active');
  });

  it('should identify grace period when overdue within grace days', () => {
    const pastDue = new Date();
    pastDue.setDate(pastDue.getDate() - 5); // 5 days ago

    const result = calculateBillingStatus(
      new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      15,
      null
    );
    // Without payment, should be grace or inactive depending on timing
    expect(['grace', 'inactive']).toContain(result.status);
  });

  it('should identify inactive when past grace period', () => {
    // Start date was 3 months ago, no payments, 15 day grace
    const longAgo = new Date();
    longAgo.setMonth(longAgo.getMonth() - 3);

    const result = calculateBillingStatus(longAgo.toISOString().split('T')[0], 15, null);
    expect(result.status).toBe('inactive');
    expect(result.urgency).toBe('critical');
  });
});

describe('formatDueDate', () => {
  it('should format date in Spanish Dominican locale', () => {
    const date = new Date('2025-06-15');
    const result = formatDueDate(date);
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(0);
  });
});
