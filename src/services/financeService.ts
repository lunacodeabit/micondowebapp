// =================================================================
// FINANCIAL SERVICE - Transactions, Account History, Accounts Payable
// Replaces Firestore transaction/finance queries
// =================================================================

import { supabase } from '../supabaseClient';
import type { Transaction } from '../types';

/**
 * Fetch transactions for a condo
 */
export async function fetchTransactions(condoId: number): Promise<Transaction[]> {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('condo_id', condoId)
        .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Create a transaction
 */
export async function createTransaction(
    transactionData: Partial<Transaction>
): Promise<Transaction> {
    const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update a transaction
 */
export async function updateTransaction(
    transactionId: number,
    updates: Partial<Transaction>
): Promise<Transaction> {
    const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', transactionId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(transactionId: number): Promise<void> {
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

    if (error) throw error;
}

// ===========================
// ACCOUNT HISTORY
// ===========================

export async function fetchAccountHistory(unitId: number) {
    const { data, error } = await supabase
        .from('account_history')
        .select('*')
        .eq('unit_id', unitId)
        .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createAccountHistoryEntry(entry: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('account_history')
        .insert(entry)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ===========================
// ACCOUNTS PAYABLE
// ===========================

export async function fetchAccountsPayable(condoId: number) {
    const { data, error } = await supabase
        .from('accounts_payable')
        .select('*')
        .eq('condo_id', condoId)
        .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function createAccountPayable(entry: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('accounts_payable')
        .insert(entry)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateAccountPayable(id: number, updates: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('accounts_payable')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ===========================
// PAYMENT NOTIFICATIONS
// ===========================

export async function fetchPaymentNotifications(condoId: number) {
    const { data, error } = await supabase
        .from('payment_notifications')
        .select('*')
        .eq('condo_id', condoId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createPaymentNotification(entry: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('payment_notifications')
        .insert(entry)
        .select()
        .single();

    if (error) throw error;
    return data;
}
