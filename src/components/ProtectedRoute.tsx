import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LoadingScreen } from './views/auth/LoadingScreen';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles
}) => {
    const { currentUser, userRole, loading, isDevAuthenticated } = useAuth();
    const location = useLocation();

    if (loading && !isDevAuthenticated) {
        return <LoadingScreen />;
    }

    if (!currentUser && !isDevAuthenticated) {
        // Redirigir al login si no está autenticado
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        // Redirigir si el rol no tiene permiso
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
