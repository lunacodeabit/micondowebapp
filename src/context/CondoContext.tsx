import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { initialCondos } from '../data/mockData';

import type { Condo, CondoFormData, Unit } from '../types';
import { recalculateBalances } from '../utils/finance';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'micondo_live_condos_v2';

// --- Tipos de Contexto ---
type CondoContextType = {
    condos: Condo[];
    selectedCondo: Condo | null;
    selectCondo: (id: string | null) => void;
    updateCondo: (updatedCondo: Condo) => void;
    addCondo: (newCondoData: CondoFormData) => void;
    updateUnitInCondo: (condoId: string, unitId: string, updates: Partial<Unit>) => Promise<void>;
    resetCondosToDefault: () => void;
    isLoading: boolean;
};

const CondoContext = createContext<CondoContextType | undefined>(undefined);

const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

// Helper to get initial condos from localStorage or default
const getInitialStoredCondos = (): Condo[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('Error reading stored condos from localStorage:', e);
    }
    return initialCondos;
};

export const CondoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [condos, setCondos] = useState<Condo[]>(() => DEV_MODE ? getInitialStoredCondos() : []);
    const [selectedCondo, setSelectedCondo] = useState<Condo | null>(() => {
        const initial = getInitialStoredCondos();
        const savedCondoId = sessionStorage.getItem('selectedCondoId');
        if (savedCondoId) {
            const found = initial.find(c => String(c.id) === String(savedCondoId));
            if (found) return found;
        }
        return initial[0] || null;
    });
    const [isLoading, setIsLoading] = useState(false);

    // Get the admin's company ID from AuthContext
    const { adminCompanyId, userRole, isSuperAdmin, isDevAuthenticated, residentData } = useAuth();

    // Helper to persist to localStorage
    const persistCondos = (updatedCondos: Condo[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCondos));
        } catch (e) {
            console.warn('Error persisting condos to localStorage:', e);
        }
    };

    // Reset helper
    const resetCondosToDefault = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem('selectedCondoId');
        setCondos(initialCondos);
        setSelectedCondo(initialCondos[0] || null);
    }, []);

    // --- SUPABASE & LOCAL SYNC: FUNCIÓN ASÍNCRONA PARA LEER DATOS ---
    const fetchCondos = useCallback(async () => {
        // En modo desarrollo con autenticación simulada, leer desde localStorage o mock
        if (DEV_MODE && isDevAuthenticated) {
            const storedCondos = getInitialStoredCondos();
            setCondos(storedCondos);

            // Re-select currently selected or first available
            const savedCondoId = sessionStorage.getItem('selectedCondoId');
            if (savedCondoId) {
                const found = storedCondos.find(c => String(c.id) === String(savedCondoId));
                setSelectedCondo(found || storedCondos[0] || null);
            } else if (!selectedCondo && storedCondos.length > 0) {
                setSelectedCondo(storedCondos[0]);
            }
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            // Residents only need their own condo
            if (userRole === 'resident' && residentData?.condoId) {
                const { data: condoData, error } = await supabase
                    .from('condos')
                    .select('*')
                    .eq('id', residentData.condoId)
                    .single();

                if (error) {
                    console.warn("Supabase fetch resident condo failed, falling back to local:", error);
                    const localCondos = getInitialStoredCondos();
                    const residentCondo = localCondos.find(c => String(c.id) === String(residentData.condoId)) || localCondos[0];
                    if (residentCondo) {
                        setCondos([residentCondo]);
                        setSelectedCondo(residentCondo);
                    }
                    setIsLoading(false);
                    return;
                }

                if (!condoData) {
                    setCondos([]);
                    setIsLoading(false);
                    return;
                }

                const { data: units } = await supabase
                    .from('units')
                    .select('*')
                    .eq('condo_id', condoData.id)
                    .order('number');

                const { data: transactions } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('condo_id', condoData.id)
                    .order('date', { ascending: true });

                const condo: Condo = {
                    ...condoData,
                    units: units || [],
                    finances: recalculateBalances(transactions || [], condoData.manual_balance || 0),
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

                setCondos([condo]);
                setSelectedCondo(condo);
                setIsLoading(false);
                return;
            }

            // Build query based on user role
            let query = supabase
                .from('condos')
                .select('*')
                .order('name');

            if (!isSuperAdmin && adminCompanyId) {
                query = query.eq('company_id', adminCompanyId);
            }

            const { data: condosData, error } = await query;

            if (error) {
                console.warn("Supabase condos query failed, fallback to local:", error);
                const local = getInitialStoredCondos();
                setCondos(local);
                setIsLoading(false);
                return;
            }

            const fetchedCondos: Condo[] = [];
            for (const condo of (condosData || [])) {
                const { data: units } = await supabase
                    .from('units')
                    .select('*')
                    .eq('condo_id', condo.id)
                    .order('number');

                const { data: transactions } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('condo_id', condo.id)
                    .order('date', { ascending: true });

                const condoWithData: Condo = {
                    ...condo,
                    units: units || [],
                    finances: recalculateBalances(transactions || [], condo.manual_balance || 0),
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

            if (fetchedCondos.length > 0) {
                setCondos(fetchedCondos);
                persistCondos(fetchedCondos);
            } else {
                const local = getInitialStoredCondos();
                setCondos(local);
            }

        } catch (error) {
            console.error("Error fetching condos:", error);
            const local = getInitialStoredCondos();
            setCondos(local);
        } finally {
            setIsLoading(false);
        }
    }, [adminCompanyId, isSuperAdmin, isDevAuthenticated, userRole, residentData, selectedCondo]);

    // useEffect: Cargar datos al iniciar
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

        const condoToSelect = condos.find(c => String(c.id) === String(id));
        if (condoToSelect) {
            setSelectedCondo(condoToSelect);
            sessionStorage.setItem('selectedCondoId', String(id));
        } else {
            console.error("Condo with id " + id + " not found.");
            setSelectedCondo(null);
            sessionStorage.removeItem('selectedCondoId');
        }
    }, [condos]);

    // Check session storage on load to restore selected condo
    useEffect(() => {
        const savedCondoId = sessionStorage.getItem('selectedCondoId');
        if (savedCondoId && (!selectedCondo || String(selectedCondo.id) !== savedCondoId) && condos.length > 0) {
            const found = condos.find(c => String(c.id) === savedCondoId);
            if (found) selectCondo(found.id);
        }
    }, [condos, selectedCondo, selectCondo]);

    // --- ACTUALIZAR UN CONDOMINIO (Persistencia Local Inmediata + Sync) ---
    const updateCondo = useCallback(async (updatedCondoData: Condo) => {
        setIsLoading(true);
        try {
            // Recalculate financial balances
            const condoWithBalances: Condo = {
                ...updatedCondoData,
                finances: recalculateBalances(updatedCondoData.finances || [], updatedCondoData.manualBalance || 0)
            };

            // 1. Inmediatamente actualizar estado y persistir en localStorage
            setCondos(prev => {
                const next = prev.map(c => String(c.id) === String(condoWithBalances.id) ? condoWithBalances : c);
                persistCondos(next);
                return next;
            });

            if (selectedCondo && String(selectedCondo.id) === String(condoWithBalances.id)) {
                setSelectedCondo(condoWithBalances);
            }

            // 2. Intentar sincronizar con Supabase en background si el id es un UUID válido
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(updatedCondoData.id));
            if (!DEV_MODE && isUuid) {
                const { units, finances, communications, incidents, accountsPayable,
                    employees, suppliers, payrolls, amenities, reservations,
                    files, extraordinaryFees, paymentNotifications, ...condoFields } = updatedCondoData as any;

                supabase
                    .from('condos')
                    .update(condoFields)
                    .eq('id', updatedCondoData.id)
                    .then(({ error }) => {
                        if (error) console.warn('Supabase sync notice:', error.message);
                    });
            }

            await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
            console.error("Error updating condo:", error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCondo]);

    // --- AÑADIR CONDOMINIO ---
    const addCondo = useCallback(async (newCondoData: CondoFormData) => {
        setIsLoading(true);
        try {
            const companyId = adminCompanyId || 'dev-company-id';
            const newId = 'condo-' + Date.now();

            const newFullCondo: Condo = {
                id: newId,
                companyId,
                code: newCondoData.code || String(Date.now()).slice(-4),
                name: newCondoData.name,
                address: newCondoData.address,
                settings: newCondoData.settings,
                manualBalance: 0,
                units: [],
                finances: [],
                communications: [],
                incidents: [],
                accountsPayable: [],
                employees: [],
                suppliers: [
                    { id: '0', name: 'WISE SERVICE SRL', serviceType: 'Adm. Condominios', status: 'Activo', contactName: 'Howard Luna', phone: '829-455-4783', email: 'howard@wiseservicesrd.com', supplierSince: '2022-01-01' }
                ],
                payrolls: [],
                amenities: [],
                reservations: [],
                files: [],
                extraordinaryFees: [],
                paymentNotifications: [],
            };

            // Guardar localmente
            setCondos(prev => {
                const next = [...prev, newFullCondo];
                persistCondos(next);
                return next;
            });
            setSelectedCondo(newFullCondo);
            sessionStorage.setItem('selectedCondoId', newId);

            // Intentar Supabase si no es dev
            if (!DEV_MODE && adminCompanyId) {
                supabase
                    .from('condos')
                    .insert({
                        ...newCondoData,
                        company_id: adminCompanyId,
                        manual_balance: 0,
                    })
                    .select()
                    .single()
                    .then(({ data, error }) => {
                        if (error) console.warn('Supabase insert notice:', error.message);
                    });
            }

            await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
            console.error("Error adding condo:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [adminCompanyId]);

    // --- ACTUALIZAR UNIDAD ---
    const updateUnitInCondo = useCallback(async (condoId: string, unitId: string, updates: Partial<Unit>) => {
        setIsLoading(true);
        try {
            setCondos(prevCondos => {
                const next = prevCondos.map(condo => {
                    if (String(condo.id) !== String(condoId)) return condo;

                    const updatedUnits = (condo.units || []).map(unit => {
                        if (String(unit.id) === String(unitId)) {
                            return { ...unit, ...updates };
                        }
                        return unit;
                    });

                    const updatedCondo = { ...condo, units: updatedUnits };
                    if (selectedCondo && String(selectedCondo.id) === String(condoId)) {
                        setSelectedCondo(updatedCondo);
                    }
                    return updatedCondo;
                });

                persistCondos(next);
                return next;
            });

            // Sync en Supabase si es UUID
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(unitId));
            if (!DEV_MODE && isUuid) {
                supabase
                    .from('units')
                    .update(updates)
                    .eq('id', unitId)
                    .then(({ error }) => {
                        if (error) console.warn('Supabase unit sync notice:', error.message);
                    });
            }

            await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
            console.error("Error updating unit:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [selectedCondo]);

    const value = {
        condos,
        selectedCondo,
        selectCondo,
        updateCondo,
        addCondo,
        updateUnitInCondo,
        resetCondosToDefault,
        isLoading
    };

    return <CondoContext.Provider value={value}>{children}</CondoContext.Provider>;
};

export const useCondo = () => {
    const context = useContext(CondoContext);
    if (context === undefined) {
        throw new Error('useCondo must be used within a CondoProvider');
    }
    return context;
};
