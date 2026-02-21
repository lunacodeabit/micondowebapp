import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useCondo } from './context/CondoContext';

// Views
import { LoginSelector } from './views/auth/LoginSelector';
import { SuperAdminDashboard } from './views/admin/SuperAdminDashboard';
import { AdminHome } from './views/admin/AdminHome';
import { CondoSelector } from './views/admin/Dashboard';
import { CondoAdminPanel } from './views/admin/CondoAdminPanel';
import { ResidentPortal } from './views/resident/ResidentPortal';

// Components
import { ProtectedRoute } from './components/ProtectedRoute';

export const AppRouter: React.FC = () => {
    const { userRole, residentData, logout } = useAuth();
    const { condos, selectedCondo, selectCondo, addCondo, isLoading: condoLoading } = useCondo();

    const handleLogout = async () => {
        try {
            await logout();
            selectCondo(null);
            sessionStorage.clear();
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
        <Routes>
            {/* Public Routes */}
            <Route
                path="/login"
                element={
                    userRole ? <Navigate to="/" replace /> : <LoginSelector condos={condos} />
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
                            onNavigateToCondos={() => { }} // This will be handled by Link or navigate
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
                            onBack={() => { }} // Handled by navigation
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
                        {residentData && selectedCondo ? (
                            <ResidentPortal
                                resident={((selectedCondo.units as any) || []).find((u: any) => u.id === residentData.unitId)}
                                condo={selectedCondo}
                                onLogout={handleLogout}
                            />
                        ) : (
                            <Navigate to="/login" replace />
                        )}
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
                                <Navigate to="/login" replace />
                }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};
