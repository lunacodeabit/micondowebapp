import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'; 
import { db } from '../firebaseConfig'; 
import type { Company, Condo } from '../types'; 

// 2. CONSTANTE DE SUPER ADMIN
const SUPER_ADMIN_UID = "2s683OVMkpZlNdklNZ3RNjHXOt32"; 

export type UserRole = 'superadmin' | 'admin' | 'resident' | null;

interface AuthContextType {
    currentUser: FirebaseUser | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<any>;
    logout: () => Promise<void>;
    
    isSuperAdmin: boolean; 
    userRole: UserRole;
    companyIsActive: boolean;
    
    residentData: { condoId: string, unitId: number } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [userRole, setUserRole] = useState<UserRole>(null);
    const [companyIsActive, setCompanyIsActive] = useState(false);
    const [residentData, setResidentData] = useState<{ condoId: string, unitId: number } | null>(null);

    const login = (email: string, pass: string) => {
        return signInWithEmailAndPassword(auth, email, pass);
    };

    const logout = () => {
        return signOut(auth);
    };

    // FUNCIÓN DE VERIFICACIÓN DE ROL Y PERMISOS
    const checkUserRoleAndStatus = async (user: FirebaseUser) => {
        console.log("🕵️ INICIANDO RASTREO DE USUARIO...");
        
        // 1. ¿ES SUPER ADMIN?
        if (user.uid === SUPER_ADMIN_UID) {
            setIsSuperAdmin(true);
            setUserRole('superadmin');
            setCompanyIsActive(true); 
            return; 
        }

        // 2. ¿ES ADMIN DE COMPAÑÍA?
        const companiesRef = collection(db, "companies");
        const adminQuery = query(companiesRef, where("adminUserEmail", "==", user.email));
        const adminSnapshot = await getDocs(adminQuery);

        if (!adminSnapshot.empty) {
            const companyDoc = adminSnapshot.docs[0]; 
            const companyData = companyDoc.data() as Company;
            setUserRole('admin');
            const isActive = companyData.status === 'Activo' || companyData.status === 'Gracia';
            setCompanyIsActive(isActive);
            return; 
        }

        // 3. ¿ES RESIDENTE?
        const condosRef = collection(db, "condos");
        const condosSnapshot = await getDocs(condosRef); 
        
        let foundResident = false;
        for (const condoDoc of condosSnapshot.docs) {
            const condoData = condoDoc.data() as Condo;
            const units = (condoData.units as unknown as any[]) || [];
            
            const foundUnit = units.find((unit: any) => unit.authUid === user.uid);
            
            if (foundUnit) {
                console.log("🎉 ¡ENCONTRADO! Unidad:", foundUnit.number || foundUnit.id);
                setUserRole('resident');
                foundResident = true;
                
                setResidentData({ condoId: condoDoc.id, unitId: foundUnit.id });

                // --- DEBUGGING PROFUNDO DE COMPAÑÍA ---
                const companyIdToCheck = condoData.companyId;
                console.log(`🏢 Condominio vinculado a CompanyID: '${companyIdToCheck}'`);

                if (!companyIdToCheck) {
                    console.error("⚠️ El condominio no tiene companyId vinculado.");
                    setCompanyIsActive(false); 
                    break;
                }

                const companyRef = doc(db, "companies", companyIdToCheck);
                const companyDocSnapshot = await getDoc(companyRef);
                
                if (companyDocSnapshot.exists()) {
                    const companyData = companyDocSnapshot.data() as Company;
                    
                    // IMPRIMIMOS CON COMILLAS PARA VER ESPACIOS OCULTOS
                    console.log(`📄 Status encontrado en DB: '${companyData.status}'`); 

                    const isActive = companyData.status === 'Activo' || companyData.status === 'Gracia';
                    console.log(`   > ¿Es válido (Activo/Gracia)?: ${isActive}`);
                    
                    setCompanyIsActive(isActive);
                } else {
                    console.error("❌ La compañía con ese ID NO existe en Firestore.");
                    setCompanyIsActive(false); 
                }
                // -------------------------------------
                break; 
            }
        }
        
        // 4. SI NO ES NADA
        if (!foundResident) {
             console.error("❌ ERROR: Usuario logueado pero no asignado a unidad.");
             setUserRole(null);
             setCompanyIsActive(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setIsSuperAdmin(false);
            setUserRole(null);
            setCompanyIsActive(false);
            setResidentData(null);

            if (user) {
                setCurrentUser(user);
                await checkUserRoleAndStatus(user); 
            } else {
                setCurrentUser(null);
            }
            setLoading(false); 
        });

        return unsubscribe;
    }, []); 

    const value = {
        currentUser,
        loading,
        login,
        logout,
        isSuperAdmin, 
        companyIsActive,
        userRole,
        residentData,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};