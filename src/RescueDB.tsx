import React, { useState } from 'react';
import { supabase } from './supabaseClient';

// TUS DATOS REALES
const MY_COMPANY_ID = "1HRXJrxurjjHegZgm9cb";
const MY_USER_UID = "hf356AcjjfThtQsVjA5umpRuGaF3";
const MY_EMAIL = "resident1a@micondo.com";

export const RescueDB = () => {
  const [status, setStatus] = useState("idle");

  const handleRescue = async () => {
    setStatus("working");
    try {
      // 1. ACTIVAMOS LA COMPAÑÍA (Esto es lo que faltaba)
      console.log("🏢 Activando compañía...");
      await supabase.from('companies').upsert({
        id: MY_COMPANY_ID,
        name: "Wise Services RD",
        status: "Activo", // <--- LA LLAVE MAESTRA
        admin_user_email: "info@wiseservicesrd.com",
        plan: "Pro"
      });

      // 2. CREAMOS UN NUEVO CONDOMINIO (Por si acaso)
      console.log("🏠 Creando condominio...");
      await supabase.from('condos').insert({
        name: "Torre Howard (VIP)",
        address: "Calle Éxito #1",
        company_id: MY_COMPANY_ID,
        created_at: new Date().toISOString(),
      });

      setStatus("success");
      alert("✅ COMPAÑÍA ACTIVADA y Nuevo Condo Creado. ¡Intenta entrar ahora!");
    } catch (e) {
      console.error("Error rescatando:", e);
      setStatus("error");
      alert("Error: Chequea la consola.");
    }
  };

  if (status === "success") return null;

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-6 rounded-xl shadow-2xl z-50 border-4 border-white">
      <h3 className="font-bold text-lg mb-2">🚑 SUPER RESCATE</h3>
      <p className="mb-4 text-sm">Activar Compañía y Crear Acceso.</p>
      <button
        onClick={handleRescue}
        disabled={status === "working"}
        className="w-full bg-white text-blue-600 font-bold py-2 px-4 rounded hover:bg-gray-100"
      >
        {status === "working" ? "Procesando..." : "⚡ ACTIVAR TODO"}
      </button>
    </div>
  );
};