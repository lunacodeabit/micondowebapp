import React, { useState } from "react";
import type { Condo } from "../../types";
import { Icon } from "../../components/ui/Icon";
// 1. IMPORTAR 'useAuth' PARA USAR LA FUNCIÓN DE LOGIN REAL
import { useAuth } from "../../context/AuthContext";

type LoginSelectorProps = {
  // 2. LAS PROPS DE 'onAdminLogin' y 'onResidentLogin' HAN SIDO ELIMINADAS
  condos: Condo[];
};

export const LoginSelector = ({ condos }: LoginSelectorProps) => {
  // 3. SOLO NECESITAMOS UN ESTADO PARA EL FORMULARIO
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 4. USAMOS EL CONTEXTO DE AUTENTICACIÓN
  const { login, devLogin, isDevMode } = useAuth();

  // 5. FUNCIÓN DE LOGIN UNIFICADA
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    if (!email || !password) {
      setError("Por favor, ingrese email y contraseña.");
      setIsLoading(false);
      return;
    }

    try {
      // 6. LLAMAMOS A LA FUNCIÓN DE LOGIN DEL CONTEXTO
      // AuthContext (en App.tsx) se encargará de determinar el rol
      // y redirigir al panel correcto (SuperAdmin, Admin, o Residente).
      await login(email, password);

      // No necesitamos 'onAdminLogin' o 'onResidentLogin'
      // El 'onAuthStateChanged' en AuthContext manejará la redirección.
    } catch (error) {
      console.error("Error en inicio de sesión:", error);
      setError("Email o contraseña incorrectos.");
      setIsLoading(false);
    }
  };

  // 7. RENDERIZAR UN ÚNICO FORMULARIO
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        <div className="text-center mb-6">
          <Icon
            name="shield-check"
            className="mx-auto text-blue-500 mb-4"
            size={48}
          />
          <h1 className="text-3xl font-bold text-white mb-2">
            Bienvenido a MiCondoApp
          </h1>
          <p className="text-neutral-400">
            Ingrese sus credenciales para acceder.
          </p>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-400 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-400 mb-1"
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? "Ingresando..." : "Ingresar"}
            </button>
          </div>
        </form>

        {/* DEV MODE: Botones de acceso rápido */}
        {isDevMode && (
          <div className="mt-6 pt-6 border-t border-neutral-700">
            <p className="text-center text-xs text-yellow-500 mb-3 flex items-center justify-center gap-2">
              <Icon name="alert-triangle" size={14} />
              MODO DESARROLLO
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => devLogin("superadmin")}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Icon name="shield" size={18} />
                Entrar como SuperAdmin
              </button>
              <button
                type="button"
                onClick={() => devLogin("admin")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Icon name="building-2" size={18} />
                Entrar como Admin
              </button>
              <button
                type="button"
                onClick={() => devLogin("resident")}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Icon name="user" size={18} />
                Entrar como Residente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
