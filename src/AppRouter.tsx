import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useCondo } from './context/CondoContext';

// Views
import { LoginSelector } from './views/auth/LoginSelector';
import { LandingPage } from './views/LandingPage';
import { SuperAdminDashboard } from './views/admin/SuperAdminDashboard';
import { AdminHome } from './views/admin/AdminHome';
import { CondoSelector } from './views/admin/Dashboard';
import { CondoAdminPanel } from './views/admin/CondoAdminPanel';
import { ResidentPortal } from './views/resident/ResidentPortal';
import { AuroraAnalytics } from './views/mockups/AuroraAnalytics';
import { ZenithResident } from './views/mockups/ZenithResident';
import { ObsidianChat } from './views/mockups/ObsidianChat';
import { PrismLogic } from './views/mockups/PrismLogic';
import { CloudSilk } from './views/mockups/CloudSilk';
import { NeonGraphite } from './views/mockups/NeonGraphite';
import { CobaltPrecision } from './views/mockups/CobaltPrecision';
import { SurgicalWhite } from './views/mockups/SurgicalWhite';
import { GridCommand } from './views/mockups/GridCommand';
import { AuraGlow } from './views/mockups/AuraGlow';
import { SoftOrbit } from './views/mockups/SoftOrbit';
import { ShadowPrime } from './views/mockups/ShadowPrime';
import { AuraShadowFusion } from './views/mockups/AuraShadowFusion';
import { EliteConsole } from './views/mockups/EliteConsole';

// Components
import { ProtectedRoute } from './components/ProtectedRoute';

export const AppRouter: React.FC = () => {
    const navigate = useNavigate();
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

            {/* Mockup Routes (High-End Concepts) */}
            <Route path="/mockup/aurora" element={<AuroraAnalytics />} />
            <Route path="/mockup/zenith" element={<ZenithResident />} />
            <Route path="/mockup/obsidian" element={<ObsidianChat />} />
            <Route path="/mockup/prism" element={<PrismLogic />} />
            <Route path="/mockup/silk" element={<CloudSilk />} />
            <Route path="/mockup/graphite" element={<NeonGraphite />} />
            <Route path="/mockup/cobalt" element={<CobaltPrecision />} />
            <Route path="/mockup/surgical" element={<SurgicalWhite />} />
            <Route path="/mockup/grid" element={<GridCommand />} />
            <Route path="/mockup/aura" element={<AuraGlow />} />
            <Route path="/mockup/orbit" element={<SoftOrbit />} />
            <Route path="/mockup/shadow" element={<ShadowPrime />} />
            <Route path="/mockup/fusion" element={<AuraShadowFusion />} />
            <Route path="/mockup/console" element={<EliteConsole />} />

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
                                <LandingPage />
                }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};
