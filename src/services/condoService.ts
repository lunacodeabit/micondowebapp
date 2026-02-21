// =================================================================
// CONDO SERVICE - Supabase Queries
// Replaces Firestore reads/writes in CondoContext.tsx
// =================================================================

import { supabase } from '../supabaseClient';
import type { Condo, Unit } from '../types';

/**
 * Fetch all condos for the current user's company
 * Replaces: getDocs(collection(db, 'condominiums'))
 */
export async function fetchCondos(companyId?: string): Promise<Condo[]> {
    let query = supabase
        .from('condos')
        .select(`
      *,
      units (*)
    `)
        .order('name');

    if (companyId) {
        query = query.eq('company_id', companyId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

/**
 * Fetch a single condo by ID
 */
export async function fetchCondoById(condoId: number): Promise<Condo | null> {
    const { data, error } = await supabase
        .from('condos')
        .select(`
      *,
      units (*)
    `)
        .eq('id', condoId)
        .single();

    if (error) {
        console.error('Error fetching condo:', error);
        return null;
    }
    return data;
}

/**
 * Create a new condo
 * Replaces: setDoc(doc(db, 'condominiums', id), data)
 */
export async function createCondo(condoData: Partial<Condo>): Promise<Condo> {
    const { data, error } = await supabase
        .from('condos')
        .insert(condoData)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update an existing condo
 */
export async function updateCondo(
    condoId: number,
    updates: Partial<Condo>
): Promise<Condo> {
    const { data, error } = await supabase
        .from('condos')
        .update(updates)
        .eq('id', condoId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Delete a condo
 */
export async function deleteCondo(condoId: number): Promise<void> {
    const { error } = await supabase
        .from('condos')
        .delete()
        .eq('id', condoId);

    if (error) throw error;
}

// ===========================
// UNIT OPERATIONS
// ===========================

/**
 * Fetch all units for a condo
 */
export async function fetchUnits(condoId: number): Promise<Unit[]> {
    const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('condo_id', condoId)
        .order('number');

    if (error) throw error;
    return data || [];
}

/**
 * Update a unit
 * Replaces: setDoc in CondoContext for unit updates
 */
export async function updateUnit(
    unitId: number,
    updates: Partial<Unit>
): Promise<Unit> {
    const { data, error } = await supabase
        .from('units')
        .update(updates)
        .eq('id', unitId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Create a new unit
 */
export async function createUnit(unitData: Partial<Unit>): Promise<Unit> {
    const { data, error } = await supabase
        .from('units')
        .insert(unitData)
        .select()
        .single();

    if (error) throw error;
    return data;
}
