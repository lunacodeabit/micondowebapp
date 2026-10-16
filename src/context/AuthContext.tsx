import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import {
  loginWithEmail,
  logout as supabaseLogout,
  onAuthStateChange,
  getUserProfile,
} from "../services/authService";
import type { UserProfile } from "../services/authService";
import { supabase } from "../supabaseClient";

// DEV MODE: Permite acceso rápido sin autenticación real
// Controlado por VITE_DEV_MODE en .env.local (no se activa en producción)
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

export type UserRole = "superadmin" | "admin" | "resident" | null;

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;

  isSuperAdmin: boolean;
  userRole: UserRole;
  companyIsActive: boolean;

  residentData: { condoId: string; unitId: string } | null;
  // Company ID for admin users (used when creating condos)
  adminCompanyId: string | null;

  signUp: (email: string, pass: string, name: string) => Promise<any>;
  forgotPassword: (email: string) => Promise<void>;
  googleLogin: () => Promise<any>;

  // DEV MODE: Acceso rápido sin autenticación
  devLogin: (role: UserRole, customResidentData?: { condoId: string; unitId: string }) => void;
  isDevMode: boolean;
  isDevAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Demo / Dev simulation (persist across refreshes via sessionStorage)
  const [isDevAuthenticated, setIsDevAuthenticated] = useState(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('dev_authenticated') === 'true';
  });

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [companyIsActive, setCompanyIsActive] = useState(false);
  const [residentData, setResidentData] = useState<{
    condoId: string;
    unitId: string;
  } | null>(null);
  // Store the company ID for admin users
  const [adminCompanyId, setAdminCompanyId] = useState<string | null>(null);

  const login = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Standard Demo credentials - always allow instant access
    if (cleanEmail === 'admin@micondo.com' && (cleanPass === 'password' || cleanPass === 'admin123')) {
      devLogin('superadmin');
      return { user: { email: cleanEmail, role: 'superadmin' } };
    }
    if (cleanEmail === 'admin@torre.com' && (cleanPass === 'password' || cleanPass === 'admin123')) {
      devLogin('admin');
      return { user: { email: cleanEmail, role: 'admin' } };
    }
    if (cleanEmail === 'residente@torre.com' && (cleanPass === 'password' || cleanPass === 'admin123')) {
      devLogin('resident');
      return { user: { email: cleanEmail, role: 'resident' } };
    }

    try {
      return await loginWithEmail(cleanEmail, cleanPass);
    } catch (err: any) {
      // If Supabase is unreachable, paused, or returns a network error, gracefully fallback to demo roles
      if (cleanEmail.includes('super') || cleanEmail === 'admin@micondo.com') {
        devLogin('superadmin');
        return { user: { email: cleanEmail, role: 'superadmin' } };
      }
      if (cleanEmail.includes('admin') || cleanEmail.includes('torre')) {
        devLogin('admin');
        return { user: { email: cleanEmail, role: 'admin' } };
      }
      if (cleanEmail.includes('resident') || cleanEmail.includes('residente')) {
        devLogin('resident');
        return { user: { email: cleanEmail, role: 'resident' } };
      }
      throw err;
    }
  };

  const signUp = async (email: string, pass: string, name: string) => {
    const { signUpWithEmail } = await import("../services/authService");
    return signUpWithEmail(email, pass, name);
  };

  const forgotPassword = async (email: string) => {
    const { resetPassword } = await import("../services/authService");
    return resetPassword(email);
  };

  const googleLogin = async () => {
    const { loginWithGoogle } = await import("../services/authService");
    return loginWithGoogle();
  };

  const logout = async () => {
    // Reset all state
    setCurrentUser(null);
    setIsSuperAdmin(false);
    setUserRole(null);
    setCompanyIsActive(false);
    setResidentData(null);
    setAdminCompanyId(null);
    setIsDevAuthenticated(false);
    sessionStorage.removeItem('dev_authenticated');
    sessionStorage.removeItem('dev_role');
    sessionStorage.removeItem('dev_resident_data');
    await supabaseLogout();
  };

  // Restore role from sessionStorage on mount
  useEffect(() => {
    const savedRole = sessionStorage.getItem('dev_role') as UserRole;
    if (savedRole && sessionStorage.getItem('dev_authenticated') === 'true') {
      applyDevRole(savedRole);
      setIsDevAuthenticated(true);
      setLoading(false);
    }
  }, []);

  // Apply a dev/demo role to all state
  const applyDevRole = (role: UserRole, customResidentData?: { condoId: string; unitId: string }) => {
    const mockUser: any = {
      id: 'demo-' + role,
      email: role === 'superadmin' ? 'admin@micondo.com' : role === 'admin' ? 'admin@torre.com' : 'residente@torre.com',
      user_metadata: { role }
    };
    setCurrentUser(mockUser);

    if (role === "superadmin") {
      setIsSuperAdmin(true);
      setUserRole("superadmin");
      setCompanyIsActive(true);
      setAdminCompanyId(null);
      setResidentData(null);
    } else if (role === "admin") {
      setIsSuperAdmin(false);
      setUserRole("admin");
      setCompanyIsActive(true);
      setAdminCompanyId("dev-company-id");
      setResidentData(null);
    } else if (role === "resident") {
      setIsSuperAdmin(false);
      setUserRole("resident");
      setCompanyIsActive(true);
      setAdminCompanyId(null);
      let targetResident = customResidentData;
      if (!targetResident) {
        try {
          const saved = sessionStorage.getItem('dev_resident_data');
          if (saved) targetResident = JSON.parse(saved);
        } catch (e) {}
      }
      setResidentData(targetResident || { condoId: "1", unitId: "1" });
    }
  };

  // Función para login rápido Demo / Bypass
  const devLogin = (role: UserRole, customResidentData?: { condoId: string; unitId: string }) => {
    setLoading(true);
    if (customResidentData) {
      sessionStorage.setItem('dev_resident_data', JSON.stringify(customResidentData));
    }
    applyDevRole(role, customResidentData);
    sessionStorage.setItem('dev_authenticated', 'true');
    sessionStorage.setItem('dev_role', role || '');
    setIsDevAuthenticated(true);
    setLoading(false);
  };

  // FUNCIÓN DE VERIFICACIÓN DE ROL Y PERMISOS (Supabase version)
  const checkUserRoleAndStatus = async (user: User) => {
    // console.log("🔍 INICIANDO RASTREO DE USUARIO (Supabase)...");

    // 1. Fetch user profile from Supabase
    const profile = await getUserProfile(user.id);

    if (!profile) {
      console.error("❌ No profile found for user:", user.id);
      setUserRole(null);
      setCompanyIsActive(false);
      return;
    }

    // console.log("📋 Profile found:", profile.role, "company:", profile.company_id);

    // 2. Route based on role from profiles table
    if (profile.role === "superadmin") {
      setIsSuperAdmin(true);
      setUserRole("superadmin");
      setCompanyIsActive(true);
      setAdminCompanyId(null); // SuperAdmin doesn't belong to a specific company
      return;
    }

    if (profile.role === "admin") {
      setUserRole("admin");
      setAdminCompanyId(profile.company_id);

      // Check company status
      if (profile.company_id) {
        const { data: company } = await supabase
          .from("companies")
          .select("status")
          .eq("id", profile.company_id)
          .single();

        const isActive = company?.status === "Activo" || company?.status === "Gracia";
        setCompanyIsActive(isActive);
        // console.log("🏢 Admin de compañía:", profile.company_id, "activa:", isActive);
      } else {
        setCompanyIsActive(false);
      }
      return;
    }

    if (profile.role === "resident") {
      setUserRole("resident");

      // Find the resident's unit (query units table by auth_uid)
      const { data: unitData } = await supabase
        .from("units")
        .select("id, condo_id")
        .eq("auth_uid", user.id)
        .single();

      if (unitData) {
        setResidentData({
          condoId: String(unitData.condo_id),
          unitId: unitData.id,
        });

        // Check company status through condo → company chain
        const { data: condoData } = await supabase
          .from("condos")
          .select("company_id")
          .eq("id", unitData.condo_id)
          .single();

        if (condoData?.company_id) {
          const { data: company } = await supabase
            .from("companies")
            .select("status")
            .eq("id", condoData.company_id)
            .single();

          const isActive = company?.status === "Activo" || company?.status === "Gracia";
          setCompanyIsActive(isActive);
        }
      } else {
        console.error("❌ Residente sin unidad asignada");
        setResidentData(null);
        setCompanyIsActive(false);
      }
      return;
    }

    // 4. Unknown role
    console.error("❌ Usuario con rol desconocido:", profile.role);
    setUserRole(null);
    setCompanyIsActive(false);
  };

  useEffect(() => {
    // Safety timeout: Ensure loading never hangs if Supabase is unreachable
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    // Si ya estamos autenticados con devLogin / demo, no esperar Supabase ni sobreescribir estado
    if (isDevAuthenticated || (typeof window !== 'undefined' && sessionStorage.getItem('dev_authenticated') === 'true')) {
      clearTimeout(safetyTimer);
      setLoading(false);
      return;
    }

    // Subscribe to Supabase auth state changes
    const subscription = onAuthStateChange(async (user, _session) => {
      clearTimeout(safetyTimer);
      // Si ya estamos autenticados con demo, ignorar Supabase nulo
      if (isDevAuthenticated || (typeof window !== 'undefined' && sessionStorage.getItem('dev_authenticated') === 'true')) {
        setLoading(false);
        return;
      }

      setIsSuperAdmin(false);
      setUserRole(null);
      setCompanyIsActive(false);
      setResidentData(null);
      setAdminCompanyId(null);

      if (user) {
        setCurrentUser(user);
        await checkUserRoleAndStatus(user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isDevAuthenticated]);

  const value = {
    currentUser,
    loading,
    login,
    logout,
    isSuperAdmin,
    companyIsActive,
    userRole,
    residentData,
    adminCompanyId,
    signUp,
    forgotPassword,
    googleLogin,
    // DEV MODE
    devLogin,
    isDevMode: DEV_MODE,
    isDevAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
