import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useCondo } from './context/CondoContext';

// Views
import { AuthView } from './views/auth/AuthView';
import { LandingPage } from './views/LandingPage';
import { SuperAdminDashboard } from './views/admin/SuperAdminDashboard';
import { AdminHome } from './views/admin/AdminHome';
import { CondoSelector } from './views/admin/Dashboard';
import { CondoAdminPanel } from './views/admin/CondoAdminPanel';
import { ResidentPortal } from './views/resident/ResidentPortal';


// Components
import { ProtectedRoute } from './components/ProtectedRoute';

export const AppRouter: React.FC = () => {
    const navigate = useNavigate();
    const { userRole, residentData, logout } = useAuth();
    const { condos, selectedCondo, selectCondo, addCondo, isLoading: condoLoading } = useCondo();
    const { loading: authLoading } = useAuth();

    // Auto-select resident's condo
    React.useEffect(() => {
        if (userRole === 'resident' && residentData && !selectedCondo && condos.length > 0) {
            const found = condos.find(c => String(c.id) === String(residentData.condoId));
            if (found) selectCondo(found.id);
        }
    }, [userRole, residentData, selectedCondo, condos, selectCondo]);

    const handleLogout = async () => {
        try {
            await logout();
            selectCondo(null);
            sessionStorage.clear();
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    if (authLoading || condoLoading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center mb-6 border border-neutral-800 animate-pulse">
                    <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                </div>
                <h2 className="text-xs font-black text-white uppercase tracking-[4px] animate-pulse">Sincronizando Ecosistema</h2>
            </div>
        );
    }

    return (
        <Routes>
            {/* Public Routes */}
            <Route
                path="/login"
                element={
                    userRole ? <Navigate to="/" replace /> : <AuthView />
                }
            />



            {/* SuperAdmin Routes */}
            <Route
                path="/superadmin"
                element={
                    <ProtectedRoute allowedRoles={['superadmin']}>
                        <SuperAdminDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Admin Routes */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminHome
                            condos={condos}
                            onLogout={handleLogout}
                            onNavigateToCondos={() => navigate('/admin/condos')}
                        />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/condos"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <CondoSelector
                            condos={condos}
                            onSelectCondo={selectCondo}
                            onLogout={handleLogout}
                            onBack={() => navigate('/admin')}
                            onAddCondo={addCondo}
                        />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/panel"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        {selectedCondo ? (
                            <CondoAdminPanel
                                onBack={() => selectCondo(null)}
                                onLogout={handleLogout}
                            />
                        ) : (
                            <Navigate to="/admin/condos" replace />
                        )}
                    </ProtectedRoute>
                }
            />

            {/* Resident Routes */}
            <Route
                path="/resident"
                element={
                    <ProtectedRoute allowedRoles={['resident']}>
                        {selectedCondo ? (
                            <ResidentPortal
                                resident={((selectedCondo.units as any[]) || []).find((u: any) => String(u.id) === String(residentData?.unitId))}
                                condo={selectedCondo}
                                onLogout={handleLogout}
                            />
                        ) : (
                            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-8">
                                <div className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center mb-6 border border-neutral-800">
                                    <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                                </div>
                                <h2 className="text-xs font-black text-white uppercase tracking-[4px]">Cargando Condominio</h2>
                            </div>
                        )
                        }
                    </ProtectedRoute>
                }
            />

            {/* Default Redirects based on role */}
            <Route
                path="/"
                element={
                    userRole === 'superadmin' ? <Navigate to="/superadmin" replace /> :
                        userRole === 'admin' ? <Navigate to="/admin" replace /> :
                            userRole === 'resident' ? <Navigate to="/resident" replace /> :
                                <LandingPage />
                }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};
