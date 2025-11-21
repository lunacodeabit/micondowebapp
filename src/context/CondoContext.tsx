import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
// 1. IMPORTACIONES DE FIRESTORE
import { collection, query, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; 
// ---

import type { Condo, CondoFormData, Unit } from '../types';
import { recalculateBalances } from '../utils/finance';

// --- Tipos de Contexto ---
type CondoContextType = {
    condos: Condo[];
    selectedCondo: Condo | null;
    selectCondo: (id: number | null) => void;
    updateCondo: (updatedCondo: Condo) => void;
    addCondo: (newCondoData: CondoFormData) => void;
    updateUnitInCondo: (condoId: number, unitId: number, updates: Partial<Unit>) => Promise<void>;
    isLoading: boolean;
};

const CondoContext = createContext<CondoContextType | undefined>(undefined);

// --- Componente Proveedor (Provider) ---
export const CondoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [condos, setCondos] = useState<Condo[]>([]);
    const [selectedCondo, setSelectedCondo] = useState<Condo | null>(null);
    const [isLoading, setIsLoading] = useState(true); 

    // --- LÓGICA DE FIRESTORE: FUNCIÓN ASÍNCRONA PARA LEER DATOS ---
    const fetchCondos = useCallback(async () => {
        setIsLoading(true);
        try {
            const condosCollectionRef = collection(db, "condos");
            const q = query(condosCollectionRef);
            const querySnapshot = await getDocs(q);

            const fetchedCondos: Condo[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data() as Omit<Condo, 'id'>;
                
                const condoWithBalances = { 
                    ...data, 
                    id: doc.id as unknown as number, 
                    // Aseguramos que las listas existan (Airbag)
                    units: data.units || [],
                    communications: data.communications || [],
                    incidents: data.incidents || [],
                    accountsPayable: data.accountsPayable || [],
                    employees: data.employees || [],
                    suppliers: data.suppliers || [],
                    payrolls: data.payrolls || [],
                    amenities: data.amenities || [],
                    reservations: data.reservations || [],
                    files: data.files || [],
                    extraordinaryFees: data.extraordinaryFees || [],
                    paymentNotifications: data.paymentNotifications || [],
                    // Recálculo de balances (Definido UNA SOLA VEZ aquí al final)
                    finances: recalculateBalances(data.finances || [], data.manualBalance || 0),
                } as Condo;

                fetchedCondos.push(condoWithBalances);
            });
            
            if (fetchedCondos.length === 0) {
                 console.log("No se encontraron condominios en Firestore. Cargando vacío.");
            }

            setCondos(fetchedCondos);

        } catch (error) {
            console.error("Error fetching condos:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 4. useEffect: Cargar datos al iniciar
    useEffect(() => {
        fetchCondos();
    }, [fetchCondos]);

    // --- FUNCIÓN DE SELECCIÓN ---
    const selectCondo = useCallback((id: number | null) => {
        if (id === null) {
            setSelectedCondo(null);
            sessionStorage.removeItem('selectedCondoId');
            return;
        }

        setIsLoading(true);
        setTimeout(() => { 
            // Buscamos usando String() para evitar problemas de tipo number vs string ID
            const condoToSelect = condos.find(c => String(c.id) === String(id));
            if (condoToSelect) {
                setSelectedCondo(condoToSelect);
                sessionStorage.setItem('selectedCondoId', String(id));
            } else {
                console.error(`Condo with id ${id} not found.`);
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
            // Intentamos seleccionar usando el ID guardado
            const found = condos.find(c => String(c.id) === savedCondoId);
            if(found) selectCondo(found.id);
        }
    }, [condos, selectedCondo, selectCondo]);

    // --- LÓGICA DE ESCRITURA: ACTUALIZAR UN CONDOMINIO COMPLETO ---
    const updateCondo = useCallback(async (updatedCondoData: Condo) => {
        setIsLoading(true);
        try {
            const condoRef = doc(db, "condos", String(updatedCondoData.id)); 
            
            await setDoc(condoRef, updatedCondoData); 
            
            const condoWithBalances = {
                ...updatedCondoData,
                finances: recalculateBalances(updatedCondoData.finances, updatedCondoData.manualBalance)
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

    // --- LÓGICA DE ESCRITURA: AÑADIR CONDOMINIO ---
    const addCondo = useCallback(async (newCondoData: CondoFormData) => {
        setIsLoading(true);
        try {
            const newCondoRef = doc(collection(db, "condos")); 
            const newId = newCondoRef.id;

            // CORRECCIÓN: Añadimos companyId por defecto
            const defaultCompanyId = "1HRXJrxurjjHegZgm9cb"; 

            const newFullCondo: Condo = {
                ...newCondoData,
                id: newId as unknown as number, 
                companyId: defaultCompanyId, 
                manualBalance: 0,
                finances: [], units: [], communications: [], incidents: [], accountsPayable: [],
                employees: [], suppliers: [], payrolls: [], amenities: [], reservations: [],
                files: [], extraordinaryFees: [], paymentNotifications: []
            };

            await setDoc(newCondoRef, newFullCondo);

            setCondos(prev => [...prev, newFullCondo]);
            await new Promise(resolve => setTimeout(resolve, 300)); 
            
        } catch (error) {
             console.error("Error adding condo:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // --- LÓGICA DE ESCRITURA: ACTUALIZAR UNIDAD (Vincular Residente) ---
    const updateUnitInCondo = useCallback(async (condoId: number, unitId: number, updates: Partial<Unit>) => {
        setIsLoading(true);
        
        try {
            const condoToUpdate = condos.find(c => c.id === condoId);
            if (!condoToUpdate) throw new Error("Condo not found for unit update.");

            const updatedUnits = condoToUpdate.units.map(unit => {
                if (unit.id === unitId) {
                    return { ...unit, ...updates }; 
                }
                return unit;
            });
            const updatedCondoData = { ...condoToUpdate, units: updatedUnits };

            const condoRef = doc(db, "condos", String(condoId)); 
            await setDoc(condoRef, updatedCondoData); 

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