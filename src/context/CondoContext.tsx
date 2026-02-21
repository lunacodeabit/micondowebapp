import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

import type { Condo, CondoFormData, Unit } from '../types';
import { recalculateBalances } from '../utils/finance';
import { useAuth } from './AuthContext';

// --- Tipos de Contexto ---
type CondoContextType = {
    condos: Condo[];
    selectedCondo: Condo | null;
    selectCondo: (id: string | null) => void;
    updateCondo: (updatedCondo: Condo) => void;
    addCondo: (newCondoData: CondoFormData) => void;
    updateUnitInCondo: (condoId: string, unitId: string, updates: Partial<Unit>) => Promise<void>;
    isLoading: boolean;
};

const CondoContext = createContext<CondoContextType | undefined>(undefined);

// --- Componente Proveedor (Provider) ---
const DEV_MODE = window.location.hostname === 'localhost';

export const CondoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [condos, setCondos] = useState<Condo[]>([]);
    const [selectedCondo, setSelectedCondo] = useState<Condo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Get the admin's company ID from AuthContext
    const { adminCompanyId, userRole, isSuperAdmin, isDevAuthenticated } = useAuth();

    // --- SUPABASE: FUNCIÓN ASÍNCRONA PARA LEER DATOS ---
    // Replaces Firestore collection queries with Supabase .from().select()
    const fetchCondos = useCallback(async () => {
        // En modo desarrollo con autenticación simulada, no intentar Supabase
        if (DEV_MODE && isDevAuthenticated) {
            // console.log('🔧 DEV MODE: Saltando carga de Supabase, usando datos vacíos');
            setCondos([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            // Build query based on user role
            // RLS policies handle most filtering, but we add explicit filters for clarity
            let query = supabase
                .from('condos')
                .select('*')
                .order('name');

            if (!isSuperAdmin && adminCompanyId) {
                // Admin only sees condos from their company (also enforced by RLS)
                query = query.eq('company_id', adminCompanyId);
            }

            const { data: condosData, error } = await query;

            if (error) throw error;

            // For each condo, fetch its units separately (normalized tables)
            const fetchedCondos: Condo[] = [];
            for (const condo of (condosData || [])) {
                const { data: units } = await supabase
                    .from('units')
                    .select('*')
                    .eq('condo_id', condo.id)
                    .order('number');

                // Fetch transactions for finance recalculation
                const { data: transactions } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('condo_id', condo.id)
                    .order('date', { ascending: true });

                const condoWithData: Condo = {
                    ...condo,
                    // Map normalized tables back to the Condo interface
                    units: units || [],
                    finances: recalculateBalances(transactions || [], condo.manual_balance || 0),
                    // These will be loaded on-demand in their respective views
                    communications: [],
                    incidents: [],
                    accountsPayable: [],
                    employees: [],
                    suppliers: [],
                    payrolls: [],
                    amenities: [],
                    reservations: [],
                    files: [],
                    extraordinaryFees: [],
                    paymentNotifications: [],
                } as Condo;

                fetchedCondos.push(condoWithData);
            }

            if (fetchedCondos.length === 0) {
                // console.log("No se encontraron condominios en Supabase. Cargando vacío.");
            }

            setCondos(fetchedCondos);

        } catch (error) {
            console.error("Error fetching condos:", error);
        } finally {
            setIsLoading(false);
        }
    }, [adminCompanyId, isSuperAdmin, isDevAuthenticated]);

    // useEffect: Cargar datos al iniciar (re-fetch when company changes)
    useEffect(() => {
        fetchCondos();
    }, [fetchCondos]);

    // --- FUNCIÓN DE SELECCIÓN ---
    const selectCondo = useCallback((id: string | null) => {
        if (id === null) {
            setSelectedCondo(null);
            sessionStorage.removeItem('selectedCondoId');
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            const condoToSelect = condos.find(c => String(c.id) === String(id));
            if (condoToSelect) {
                setSelectedCondo(condoToSelect);
                sessionStorage.setItem('selectedCondoId', String(id));
            } else {
                console.error("Condo with id " + id + " not found.");
                setSelectedCondo(null);
                sessionStorage.removeItem('selectedCondoId');
            }
            setIsLoading(false);
        }, 300);
    }, [condos]);

    // Check session storage on load to restore selected condo
    useEffect(() => {
        const savedCondoId = sessionStorage.getItem('selectedCondoId');
        if (savedCondoId && !selectedCondo && condos.length > 0) {
            const found = condos.find(c => String(c.id) === savedCondoId);
            if (found) selectCondo(found.id);
        }
    }, [condos, selectedCondo, selectCondo]);

    // --- SUPABASE: ACTUALIZAR UN CONDOMINIO ---
    const updateCondo = useCallback(async (updatedCondoData: Condo) => {
        setIsLoading(true);
        try {
            // Extract only the condo-level fields (not nested arrays)
            const { units, finances, communications, incidents, accountsPayable,
                employees, suppliers, payrolls, amenities, reservations,
                files, extraordinaryFees, paymentNotifications, ...condoFields } = updatedCondoData as any;

            const { error } = await supabase
                .from('condos')
                .update(condoFields)
                .eq('id', updatedCondoData.id);

            if (error) throw error;

            const condoWithBalances = {
                ...updatedCondoData,
                finances: recalculateBalances(updatedCondoData.finances, (updatedCondoData as any).manual_balance || 0)
            };

            setCondos(prev => prev.map(c => c.id === condoWithBalances.id ? condoWithBalances : c));
            if (selectedCondo?.id === condoWithBalances.id) {
                setSelectedCondo(condoWithBalances);
            }

            await new Promise(resolve => setTimeout(resolve, 300));

        } catch (error) {
            console.error("Error updating condo:", error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCondo?.id]);

    // --- SUPABASE: AÑADIR CONDOMINIO ---
    const addCondo = useCallback(async (newCondoData: CondoFormData) => {
        setIsLoading(true);
        try {
            if (!adminCompanyId) {
                throw new Error("No company ID found. User must be a company admin to create condos.");
            }

            // Insert into Supabase (id is auto-generated)
            const { data: newCondo, error } = await supabase
                .from('condos')
                .insert({
                    ...newCondoData,
                    company_id: adminCompanyId,
                    manual_balance: 0,
                })
                .select()
                .single();

            if (error) throw error;

            // Build full Condo object for local state
            const newFullCondo: Condo = {
                ...newCondo,
                units: [],
                finances: [],
                communications: [],
                incidents: [],
                accountsPayable: [],
                employees: [],
                suppliers: [],
                payrolls: [],
                amenities: [],
                reservations: [],
                files: [],
                extraordinaryFees: [],
                paymentNotifications: [],
            } as Condo;

            setCondos(prev => [...prev, newFullCondo]);
            await new Promise(resolve => setTimeout(resolve, 300));

        } catch (error) {
            console.error("Error adding condo:", error);
            throw error; // Re-throw so the UI can show an error
        } finally {
            setIsLoading(false);
        }
    }, [adminCompanyId]);

    // --- SUPABASE: ACTUALIZAR UNIDAD ---
    const updateUnitInCondo = useCallback(async (condoId: string, unitId: string, updates: Partial<Unit>) => {
        setIsLoading(true);

        try {
            // Update directly in the units table (normalized, not nested in condo doc)
            const { error } = await supabase
                .from('units')
                .update(updates)
                .eq('id', unitId);

            if (error) throw error;

            // Update local state
            const condoToUpdate = condos.find(c => c.id === condoId);
            if (!condoToUpdate) throw new Error("Condo not found for unit update.");

            const updatedUnits = condoToUpdate.units.map(unit => {
                if (unit.id === unitId) {
                    return { ...unit, ...updates };
                }
                return unit;
            });
            const updatedCondoData = { ...condoToUpdate, units: updatedUnits };

            setCondos(prevCondos =>
                prevCondos.map(c => c.id === condoId ? updatedCondoData : c)
            );
            setSelectedCondo(updatedCondoData);

            await new Promise(resolve => setTimeout(resolve, 300));

        } catch (error) {
            console.error("Error updating unit:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [condos]);


    const value = { condos, selectedCondo, selectCondo, updateCondo, addCondo, updateUnitInCondo, isLoading };

    return <CondoContext.Provider value={value}>{children}</CondoContext.Provider>;
};

export const useCondo = () => {
    const context = useContext(CondoContext);
    if (context === undefined) {
        throw new Error('useCondo must be used within a CondoProvider');
    }
    return context;
};
