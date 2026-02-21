// =================================================================
// OPERATIONS SERVICE - Communications, Incidents, Employees, Suppliers
// =================================================================

import { supabase } from '../supabaseClient';

// ===========================
// COMMUNICATIONS
// ===========================

export async function fetchCommunications(condoId: number) {
    const { data, error } = await supabase
        .from('communications')
        .select('*')
        .eq('condo_id', condoId)
        .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createCommunication(entry: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('communications')
        .insert(entry)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateCommunication(id: number, updates: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('communications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ===========================
// INCIDENTS
// ===========================

export async function fetchIncidents(condoId: number) {
    const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('condo_id', condoId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createIncident(entry: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('incidents')
        .insert(entry)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateIncident(id: number, updates: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('incidents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ===========================
// EMPLOYEES
// ===========================

export async function fetchEmployees(condoId: number) {
    const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('condo_id', condoId)
        .order('name');

    if (error) throw error;
    return data || [];
}

export async function createEmployee(entry: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('employees')
        .insert(entry)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateEmployee(id: number, updates: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ===========================
// SUPPLIERS
// ===========================

export async function fetchSuppliers(condoId: number) {
    const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('condo_id', condoId)
        .order('name');

    if (error) throw error;
    return data || [];
}

export async function createSupplier(entry: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('suppliers')
        .insert(entry)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateSupplier(id: number, updates: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ===========================
// AMENITIES & RESERVATIONS
// ===========================

export async function fetchAmenities(condoId: number) {
    const { data, error } = await supabase
        .from('amenities')
        .select('*')
        .eq('condo_id', condoId)
        .order('name');

    if (error) throw error;
    return data || [];
}

export async function fetchReservations(condoId: number) {
    const { data, error } = await supabase
        .from('reservations')
        .select(`
      *,
      amenities (name),
      units (number)
    `)
        .eq('condo_id', condoId)
        .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createReservation(entry: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('reservations')
        .insert(entry)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateReservation(id: number, updates: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('reservations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}
