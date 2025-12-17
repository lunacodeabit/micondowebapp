import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginSelector } from "./views/auth/LoginSelector";
import { LoadingScreen } from "./views/auth/LoadingScreen";
import { ResidentPortal } from "./views/resident/ResidentPortal";
import { CondoAdminPanel } from "./views/admin/CondoAdminPanel";
import { AdminHome } from "./views/admin/AdminHome";
import { CondoSelector } from "./views/admin/Dashboard";
import { CondoProvider, useCondo } from "./context/CondoContext";
import { ToastProvider, useToast } from "./context/ToastContext";
import { ToastContainer } from "./components/ui/ToastContainer";
import { Icon } from "./components/ui/Icon";
import { SuperAdminDashboard } from "./views/admin/SuperAdminDashboard";

const AppContent = () => {
  const {
    currentUser,
    loading: authLoading,
    isSuperAdmin,
    companyIsActive,
    userRole,
    residentData,
    logout: authLogout,
    isDevAuthenticated,
  } = useAuth();

  const {
    condos,
    selectedCondo,
    selectCondo,
    addCondo,
    isLoading: condoLoading,
  } = useCondo();
  const { addToast } = useToast();
  const [adminView, setAdminView] = useState("home");

  const handleLogout = async () => {
    try {
      await authLogout();
      selectCondo(null);
      setAdminView("home");
      sessionStorage.clear();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  useEffect(() => {
    if (userRole === "resident" && residentData?.condoId && condos.length > 0) {
      if (
        !selectedCondo ||
        String(selectedCondo.id) !== String(residentData.condoId)
      ) {
        selectCondo(residentData.condoId as any);
      }
    }
  }, [userRole, residentData, condos, selectedCondo, selectCondo]);

  // LOADING
  if (authLoading && !isDevAuthenticated) {
    return <LoadingScreen />;
  }

  // DEV MODE: SuperAdmin
  if (isDevAuthenticated && userRole === "superadmin") {
    return <SuperAdminDashboard />;
  }

  // DEV MODE: Admin
  if (isDevAuthenticated && userRole === "admin") {
    if (condoLoading) return <LoadingScreen />;
    if (selectedCondo) {
      return (
        <CondoAdminPanel
          onBack={() => {
            selectCondo(null);
            setAdminView("condoSelector");
          }}
          onLogout={handleLogout}
        />
      );
    }
    if (adminView === "condoSelector") {
      return (
        <CondoSelector
          condos={condos}
          onSelectCondo={selectCondo}
          onLogout={handleLogout}
          onBack={() => setAdminView("home")}
          onAddCondo={addCondo}
        />
      );
    }
    return (
      <AdminHome
        condos={condos}
        onLogout={handleLogout}
        onNavigateToCondos={() => setAdminView("condoSelector")}
      />
    );
  }

  // DEV MODE: Residente
  if (isDevAuthenticated && userRole === "resident") {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-8 text-white">
        <Icon name="info" className="w-16 h-16 text-yellow-500 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Modo Desarrollo - Residente</h1>
        <p className="text-neutral-400 text-center mb-4">
          Para probar residente, crea datos desde SuperAdmin primero.
        </p>
        <button
          onClick={handleLogout}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
        >
          Volver al Login
        </button>
      </div>
    );
  }

  // DEV MODE fallback o sin rol
  if (isDevAuthenticated && !userRole) {
    return <LoginSelector condos={condos} />;
  }

  // MODO NORMAL - Sin usuario
  if (!currentUser && !isDevAuthenticated) {
    return <LoginSelector condos={condos} />;
  }

  // SuperAdmin real
  if (isSuperAdmin && userRole === "superadmin") {
    return <SuperAdminDashboard />;
  }

  // Usuario sin acceso
  if (currentUser && !companyIsActive) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-8 text-white">
        <Icon name="lock" className="w-16 h-16 text-red-600 mb-4" />
        <h1 className="text-4xl font-bold mb-2">Acceso Denegado</h1>
        <p className="text-neutral-400 text-center mb-6">
          Su cuenta ha sido desactivada.
        </p>
        <button
          onClick={handleLogout}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
        >
          Cerrar Sesion
        </button>
      </div>
    );
  }

  // Residente real
  if (userRole === "resident" && residentData?.condoId) {
    if (
      !selectedCondo ||
      String(selectedCondo.id) !== String(residentData.condoId)
    ) {
      return <LoadingScreen />;
    }
    const units = (selectedCondo.units as unknown as any[]) || [];
    const resident = units.find((u: any) => u.id === residentData.unitId);
    if (resident) {
      return (
        <ResidentPortal
          resident={resident}
          condo={selectedCondo}
          onLogout={handleLogout}
        />
      );
    }
  }

  // Admin real
  if (userRole === "admin") {
    if (selectedCondo) {
      return (
        <CondoAdminPanel
          onBack={() => {
            selectCondo(null);
            setAdminView("condoSelector");
          }}
          onLogout={handleLogout}
        />
      );
    }
    if (adminView === "condoSelector") {
      return (
        <CondoSelector
          condos={condos}
          onSelectCondo={selectCondo}
          onLogout={handleLogout}
          onBack={() => setAdminView("home")}
          onAddCondo={addCondo}
        />
      );
    }
    return (
      <AdminHome
        condos={condos}
        onLogout={handleLogout}
        onNavigateToCondos={() => setAdminView("condoSelector")}
      />
    );
  }

  return <LoginSelector condos={condos} />;
};

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CondoProvider>
          <AppContent />
          <ToastContainer />
        </CondoProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
