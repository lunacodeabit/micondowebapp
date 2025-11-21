import type { Transaction, AccountHistoryItem } from '../types';

export const recalculateBalances = (transactions: Transaction[], initialBalance: number): Transaction[] => {
    let currentBalance = initialBalance;
    // Sort transactions by date and then by ID to ensure consistent order
    const sortedTransactions = [...transactions].sort((a, b) => {
        const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateComparison !== 0) return dateComparison;
        return a.id - b.id;
    });

    return sortedTransactions.map(tx => {
        // Ingressos increase balance, Egressos decrease it. Amount for Egressos should be negative.
        const amount = tx.type === 'Ingreso' ? Math.abs(tx.amount) : -Math.abs(tx.amount);
        currentBalance += amount;
        return { ...tx, balance: currentBalance };
    });
};

export const calculateAgingBalances = (accountHistory: AccountHistoryItem[], asOfDate: Date) => {
    const aging = {
        current: 0, // 0-30
        '31-60': 0,
        '61-90': 0,
        '91+': 0,
        total: 0
    };

    const charges = accountHistory
        .filter(item => item.type === 'Cargo')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
    let credits = accountHistory
        .filter(item => item.type === 'Abono')
        .reduce((sum, item) => sum + item.amount, 0);

    for (const charge of charges) {
        if (credits > 0) {
            if (credits >= charge.amount) {
                credits -= charge.amount; // This charge is fully paid
                continue;
            } else {
                // Partially paid
                const remainingChargeAmount = charge.amount - credits;
                credits = 0;
                // Treat the remaining amount as an unpaid charge
                categorizeDebt(charge.date, remainingChargeAmount);
            }
        } else {
            // Unpaid charge
            categorizeDebt(charge.date, charge.amount);
        }
    }

    function categorizeDebt(chargeDateStr: string, amount: number) {
        // Assume UTC to prevent timezone issues where the date might shift by one day
        const chargeDate = new Date(chargeDateStr + 'T00:00:00Z');
        const daysDiff = Math.floor((asOfDate.getTime() - chargeDate.getTime()) / (1000 * 3600 * 24));

        if (daysDiff <= 30) {
            aging.current += amount;
        } else if (daysDiff <= 60) {
            aging['31-60'] += amount;
        } else if (daysDiff <= 90) {
            aging['61-90'] += amount;
        } else {
            aging['91+'] += amount;
        }
    }

    aging.total = aging.current + aging['31-60'] + aging['61-90'] + aging['91+'];
    
    // Round to 2 decimal places to avoid floating point issues
    Object.keys(aging).forEach(key => {
        aging[key as keyof typeof aging] = parseFloat(aging[key as keyof typeof aging].toFixed(2));
    });
    
    return aging;
};