import React, { useState, useEffect } from 'react';
// 1. IMPORTACIONES DE AUTH
import { AuthProvider, useAuth, UserRole } from './context/AuthContext';
import { LoginSelector } from './views/auth/LoginSelector';
import { LoadingScreen } from './views/auth/LoadingScreen';
import { ResidentPortal } from './views/resident/ResidentPortal';
import { CondoAdminPanel } from './views/admin/CondoAdminPanel';
import { AdminHome } from './views/admin/AdminHome';
import { CondoSelector } from './views/admin/Dashboard';
import { CondoProvider, useCondo } from './context/CondoContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { ToastContainer } from './components/ui/ToastContainer';
import { Icon } from './components/ui/Icon';
import { SuperAdminDashboard } from './views/admin/SuperAdminDashboard'; 

// Componente de Pantalla de Bloqueo por Inactividad
const DeactivatedScreen = () => (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-8 text-white">
        <Icon name="lock" className="w-16 h-16 text-red-600 mb-4" />
        <h1 className="text-4xl font-bold mb-2">Acceso Denegado</h1>
        <p className="text-neutral-400 text-center mb-6">
            Su cuenta (o la compañía a la que pertenece) ha sido desactivada.
        </p>
        <p className="text-neutral-300">
            Revisa la consola (F12) para ver el error detallado.
        </p>
    </div>
);

const AppContent = () => {
    // 2. RECUPERAMOS EL ESTADO DE FIREBASE
    const { 
        currentUser, 
        loading: authLoading, 
        isSuperAdmin, 
        companyIsActive, 
        userRole,
        residentData,
        logout: authLogout,
        isDevAuthenticated
    } = useAuth();
    
    const { condos, selectedCondo, selectCondo, addCondo, isLoading: condoLoading } = useCondo();
    const { addToast } = useToast();

    // Estados locales de navegación (solo para Admins)
    const [adminView, setAdminView] = useState('home'); 
    
    // 3. FUNCIÓN DE LOGOUT REAL
    const handleLogout = async () => {
        try {
            await authLogout(); 
            selectCondo(null);
            setAdminView('home');
            sessionStorage.clear();
        } catch (error) {
            console.error("Error during logout:", error);
            addToast('Error al cerrar sesión.', 'error');
        }
    };

    // --- CORRECCIÓN CRÍTICA: SELECCIÓN AUTOMÁTICA EN USEEFFECT ---
    // Esto evita el error "Cannot update a component while rendering"
    // y el problema de IDs NaN (Not a Number).
    useEffect(() => {
        if (userRole === 'resident' && residentData?.condoId && condos.length > 0) {
            // Si no hay seleccionado, o el seleccionado es diferente al del usuario...
            // Nota: Comparamos como String para evitar problemas de tipos
            if (!selectedCondo || String(selectedCondo.id) !== String(residentData.condoId)) {
                console.log(`🔄 Auto-seleccionando Condominio ID: ${residentData.condoId}`);
                // Pasamos el ID tal cual viene de la BD (String), sin forzar a Number
                selectCondo(residentData.condoId as any);
            }
        }
    }, [userRole, residentData, condos, selectedCondo, selectCondo]);
    // -------------------------------------------------------------
    
    // 4. LÓGICA DE RENDERIZADO PRINCIPAL (EL ROUTER)
    const isLoading = authLoading || condoLoading;

    if (isLoading) {
        return <LoadingScreen />;
    }
    
    // A. Vista Super Admin
    if (isSuperAdmin && userRole === 'superadmin') {
        return <SuperAdminDashboard />;
    }
    
    // B. PANTALLA DE BLOQUEO (solo si hay usuario real y no es dev mode)
    if (currentUser && !isDevAuthenticated && !companyIsActive) {
        return <DeactivatedScreen />;
    }

    // C. PANTALLA DE LOGIN (si no hay usuario real Y no estamos autenticados en dev mode)
    if (!currentUser && !isDevAuthenticated) {
        return (
            <LoginSelector 
                condos={condos} 
            />
        );
    }
    
    // D. VISTAS DE USUARIO (ADMIN/RESIDENTE)
    
    // Vista Residente
    if (userRole === 'resident') {
        // DEV MODE: Mostrar mensaje informativo si no hay datos
        if (isDevAuthenticated && (!residentData || !residentData.condoId)) {
            return (
                <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-8 text-white">
                    <Icon name="info" className="w-16 h-16 text-yellow-500 mb-4" />
                    <h1 className="text-3xl font-bold mb-2">Modo Desarrollo - Sin Datos</h1>
                    <p className="text-neutral-400 text-center mb-4">
                        No hay condominios con unidades en la base de datos para simular un residente.
                    </p>
                    <button onClick={handleLogout} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
                        Volver al Login
                    </button>
                </div>
            );
        }
        
        // Esperamos a que residentData esté listo
        if (residentData && residentData.condoId) {
            
            // Si todavía no se ha seleccionado el condominio (el useEffect de arriba está trabajando),
            // mostramos Loading para evitar pantallazos raros.
            if (!selectedCondo || String(selectedCondo.id) !== String(residentData.condoId)) {
                return <LoadingScreen />;
            }

            // Buscamos la unidad del residente dentro del condominio seleccionado
            const units = (selectedCondo.units as unknown as any[]) || [];
            const resident = units.find((u: any) => u.id === residentData.unitId);

            if (resident) {
                return <ResidentPortal resident={resident} condo={selectedCondo} onLogout={handleLogout} />;
            } else {
                // DEV MODE: Mostrar qué unidades hay disponibles
                if (isDevAuthenticated) {
                    return (
                        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-8 text-white">
                            <Icon name="info" className="w-16 h-16 text-yellow-500 mb-4" />
                            <h1 className="text-3xl font-bold mb-2">Modo Desarrollo - Unidad No Encontrada</h1>
                            <p className="text-neutral-400 text-center mb-4">
                                Buscando unitId: {residentData.unitId}<br/>
                                Unidades disponibles: {units.map((u: any) => u.id).join(', ') || 'ninguna'}
                            </p>
                            <button onClick={handleLogout} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
                                Volver al Login
                            </button>
                        </div>
                    );
                }
                console.error("Unidad no encontrada en el condominio seleccionado.");
            }
        }
        
        // Si llegamos aquí, algo falló en la carga de datos del residente
        return <DeactivatedScreen />;
    }
    
    // Vista Admin de Compañía
    if (userRole === 'admin') {
        // DEV MODE: Mostrar mensaje informativo si no hay condos
        if (isDevAuthenticated && condos.length === 0 && !condoLoading) {
            return (
                <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-8 text-white">
                    <Icon name="info" className="w-16 h-16 text-yellow-500 mb-4" />
                    <h1 className="text-3xl font-bold mb-2">Modo Desarrollo - Sin Condominios</h1>
                    <p className="text-neutral-400 text-center mb-4">
                        No hay condominios asignados a esta compañía.<br/>
                        Primero crea un condominio desde SuperAdmin.
                    </p>
                    <button onClick={handleLogout} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
                        Volver al Login
                    </button>
                </div>
            );
        }
        
        if (selectedCondo) {
            return (
                <CondoAdminPanel
                    onBack={() => {
                        selectCondo(null);
                        setAdminView('condoSelector');
                    }}
                    onLogout={handleLogout}
                />
            );
        }

        if (adminView === 'condoSelector') {
            return (
                <CondoSelector
                    condos={condos}
                    onSelectCondo={selectCondo}
                    onLogout={handleLogout}
                    onBack={() => setAdminView('home')}
                    onAddCondo={addCondo}
                />
            );
        }

        return (
            <AdminHome 
                condos={condos} 
                onLogout={handleLogout} 
                onNavigateToCondos={() => setAdminView('condoSelector')} 
            />
        );
    }

    // Fallback final
    handleLogout();
    return <DeactivatedScreen />;
};

export const App = () => {
    return (
        <ToastProvider>
            <AuthProvider> 
                <CondoProvider>
                    <AppContent />
                    <ToastContainer />
                </CondoProvider>
            </AuthProvider>
        </ToastProvider>
    );
};