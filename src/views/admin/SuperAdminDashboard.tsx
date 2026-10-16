import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import type { Company, Condo, PlanType, AddonConfig, ActivityEvent, ActivityEventType } from "../../types";
import { PLAN_PRICING, AVAILABLE_ADDONS } from "../../types";
import { supabase } from "../../supabaseClient";
import { SuperAdminSidebar } from "./layout/SuperAdminSidebar";
import { Modal } from "../../components/ui/Modal";
import { Spinner } from "../../components/ui/Spinner";
import { Icon } from "../../components/ui/Icon";
import { getLocalDateString } from "../../utils/date";
import { DevRoadmap } from "../dev/DevRoadmap";
import {
  calculateBillingStatus,
  getLastPayment,
  type PaymentRecord,
  type BillingInfo,
} from "../../utils/billing";
import { ElisaAIContent } from "./tabs/ElisaAIContent";
import { notifyPaymentConfirmation } from "../../services/emailNotifications";
import { ThemeToggle } from "../../components/ui/ThemeToggle";

type CompanyFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onCompanySaved: () => void;
  defaultValues: Company | null;
};

const CompanyForm = ({
  isOpen,
  onClose,
  onCompanySaved,
  defaultValues,
}: CompanyFormProps) => {
  const { addToast } = useToast();

  const getInitialState = () => {
    if (defaultValues) {
      return {
        name: defaultValues.name,
        address: defaultValues.address,
        phone: defaultValues.phone,
        email: defaultValues.email,
        rnc: defaultValues.rnc,
        adminUserEmail: defaultValues.adminUserEmail,
        billingStartDate: defaultValues.billingStartDate,
        gracePeriodDays: defaultValues.gracePeriodDays,
        plan: defaultValues.plan || "Trial" as PlanType,
        addons: defaultValues.addons || [] as string[],
      };
    }
    return {
      name: "",
      address: "",
      phone: "",
      email: "",
      rnc: "",
      adminUserEmail: "",
      billingStartDate: getLocalDateString(),
      gracePeriodDays: 7,
      plan: "Trial" as PlanType,
      addons: [] as string[],
    };
  };

  const [formData, setFormData] = useState(getInitialState());
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [condoCount, setCondoCount] = useState(defaultValues?.condoCount || 1);

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState());
      setLogoFile(null);
      setAdminPassword("");
      setCondoCount(defaultValues?.condoCount || 1);
    }
  }, [isOpen, defaultValues]);

  // Calcular precio mensual basado en plan y addons
  const calculateMonthlyFee = () => {
    if (formData.plan === "Trial") return 0;

    // Determinar precio por condo según tier
    let pricePerCondo = 1500; // default Starter
    if (condoCount >= 10) pricePerCondo = 800;
    else if (condoCount >= 5) pricePerCondo = 1000;
    else if (condoCount >= 2) pricePerCondo = 1200;

    const basePrice = condoCount * pricePerCondo;

    // Sumar addons
    const addonsPrice = formData.addons.reduce((sum, addonId) => {
      const addon = AVAILABLE_ADDONS.find(a => a.id === addonId);
      return sum + (addon?.monthlyPrice || 0);
    }, 0);

    return basePrice + addonsPrice;
  };

  const monthlyFee = calculateMonthlyFee();

  const handleAddonToggle = (addonId: string) => {
    setFormData(prev => ({
      ...prev,
      addons: prev.addons.includes(addonId)
        ? prev.addons.filter(id => id !== addonId)
        : [...prev.addons, addonId]
    }));
  };

  // Auto-ajustar condos al mínimo del plan cuando cambia
  const handlePlanChange = (newPlan: string) => {
    const minCondos: Record<string, number> = {
      "Trial": 1,
      "Starter": 1,
      "Growth": 2,
      "Pro": 5,
      "Enterprise": 10,
    };
    const min = minCondos[newPlan] || 1;

    // Si el condo count actual es menor al mínimo del nuevo plan, ajustar
    if (condoCount < min) {
      setCondoCount(min);
    }

    setFormData(prev => ({ ...prev, plan: newPlan as PlanType }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // Si es el plan, usar el handler especial
    if (name === "plan") {
      handlePlanChange(value);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!defaultValues && (!adminPassword || adminPassword.length < 6)) {
      addToast(
        "La contraseña del admin es requerida (mínimo 6 caracteres).",
        "error"
      );
      setLoading(false);
      return;
    }

    try {
      let logoUrl: string | null = defaultValues?.logoUrl || null;

      if (logoFile) {
        const filePath = `company_logos/${formData.rnc}-${logoFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('company-assets')
          .upload(filePath, logoFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from('company-assets')
          .getPublicUrl(filePath);
        logoUrl = urlData.publicUrl;
      }

      const companyData = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        rnc: formData.rnc,
        logo_url: logoUrl,
        admin_user_email: formData.adminUserEmail,
        billing_start_date: formData.billingStartDate,
        grace_period_days: formData.gracePeriodDays,
        status: defaultValues?.status || "Activo",
        // Plan y Addons
        plan: formData.plan,
        addons: formData.addons,
        monthly_fee: monthlyFee,
        condo_count: condoCount,
      };

      // Helper para crear eventos de actividad
      const createActivityEvent = async (
        type: ActivityEventType,
        companyId: string,
        companyName: string,
        description: string,
        details?: ActivityEvent["details"]
      ) => {
        await supabase.from('activity_events').insert({
          type,
          company_id: companyId,
          company_name: companyName,
          description,
          details,
          created_at: new Date().toISOString(),
        });
      };

      if (defaultValues && defaultValues.id) {
        await supabase.from('companies').update(companyData).eq('id', defaultValues.id);

        // Registrar eventos de actividad
        // Cambio de plan
        if (defaultValues.plan !== formData.plan) {
          await createActivityEvent(
            "plan_changed",
            defaultValues.id,
            formData.name,
            `Cambió de plan ${defaultValues.plan} → ${formData.plan}`,
            { oldValue: defaultValues.plan, newValue: formData.plan }
          );
        }

        // Addons añadidos
        const oldAddons = defaultValues.addons || [];
        const newAddons = formData.addons;
        const addedAddons = newAddons.filter(a => !oldAddons.includes(a));
        const removedAddons = oldAddons.filter(a => !newAddons.includes(a));

        for (const addonId of addedAddons) {
          const addon = AVAILABLE_ADDONS.find(a => a.id === addonId);
          await createActivityEvent(
            "addon_added",
            defaultValues.id,
            formData.name,
            `Activó addon "${addon?.name}"`,
            { addonName: addon?.name, newValue: addonId }
          );
        }

        for (const addonId of removedAddons) {
          const addon = AVAILABLE_ADDONS.find(a => a.id === addonId);
          await createActivityEvent(
            "addon_removed",
            defaultValues.id,
            formData.name,
            `Desactivó addon "${addon?.name}"`,
            { addonName: addon?.name, oldValue: addonId }
          );
        }

        addToast(`Compañía "${formData.name}" actualizada.`, "success");
      } else {
        const { data: docRef, error: insertError } = await supabase.from('companies').insert(companyData).select('id').single();
        if (insertError) throw insertError;

        // Registrar evento de nueva compañía
        await createActivityEvent(
          "company_created",
          docRef.id,
          formData.name,
          `Nueva compañía registrada (Plan: ${formData.plan})`,
          { newValue: formData.plan }
        );

        addToast(
          `Compañía "${formData.name}" creada. (Usuario admin PENDIENTE).`,
          "success"
        );
      }

      setLoading(false);
      onCompanySaved();
      onClose();
    } catch (error) {
      console.error("Error saving company:", error);
      addToast("Error al guardar la compañía. Inténtalo de nuevo.", "error");
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        defaultValues
          ? `Editando: ${defaultValues.name}`
          : "Crear Nueva Compañía Administradora"
      }
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
    >
      <form
        onSubmit={handleSubmit}
        className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
      >
        <h3 className="md:col-span-2 text-base font-bold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-2">
          Información de la Compañía
        </h3>
        <div className="mb-2">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
            Nombre de la Compañía
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-white px-3.5 py-2 text-sm shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>
        <div className="mb-2">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
            RNC
          </label>
          <input
            type="text"
            name="rnc"
            value={formData.rnc}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-white px-3.5 py-2 text-sm shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>
        <div className="mb-2">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
            Email de Facturación
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-white px-3.5 py-2 text-sm shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>
        <div className="mb-2">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-white px-3.5 py-2 text-sm shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>
        <div className="md:col-span-2 mb-2">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
            Dirección
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-white px-3.5 py-2 text-sm shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>
        <div className="md:col-span-2 mb-4">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
            Logo de la Compañía (Opcional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-neutral-600 dark:text-neutral-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-neutral-200 dark:file:border-neutral-700 file:text-xs file:font-bold file:bg-neutral-100 dark:file:bg-neutral-800 file:text-neutral-800 dark:file:text-neutral-200 hover:file:bg-neutral-200 dark:hover:file:bg-neutral-700"
          />
          {logoFile && (
            <p className="mt-2 text-xs text-neutral-500">
              Archivo seleccionado: {logoFile.name}
            </p>
          )}
          {!logoFile && defaultValues?.logoUrl && (
            <p className="mt-2 text-xs text-neutral-500">
              Logo actual:{" "}
              {defaultValues.logoUrl.split("%2F").pop()?.split("?")[0]}
            </p>
          )}
        </div>

        <h3 className="md:col-span-2 text-base font-bold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-2">
          Administrador Principal de la Compañía
        </h3>
        <div className="mb-2">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
            Email del Admin (Login)
          </label>
          <input
            type="email"
            name="adminUserEmail"
            value={formData.adminUserEmail}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-white px-3.5 py-2 text-sm shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>
        <div className="mb-2">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
            Nueva Contraseña (Opcional)
          </label>
          <input
            type="password"
            name="adminPassword"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder={
              defaultValues
                ? "Dejar en blanco para no cambiar"
                : "Mínimo 6 caracteres"
            }
            className="mt-1 block w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-white px-3.5 py-2 text-sm shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <h3 className="md:col-span-2 text-base font-bold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-2">
          Facturación SaaS
        </h3>
        <div className="mb-2">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
            Inicio de Facturación
          </label>
          <input
            type="date"
            name="billingStartDate"
            value={formData.billingStartDate}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-white px-3.5 py-2 text-sm shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>
        <div className="mb-2">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
            Días de Gracia
          </label>
          <input
            type="number"
            name="gracePeriodDays"
            value={formData.gracePeriodDays}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-white px-3.5 py-2 text-sm shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        {/* Plan Selection */}
        <h3 className="md:col-span-2 text-base font-bold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-2 mt-4">
          Plan y Pricing
        </h3>
        <div className="mb-2">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
            Plan
          </label>
          <select
            name="plan"
            value={formData.plan}
            onChange={handleChange}
            className="mt-1 block w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-white px-3.5 py-2 text-sm shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          >
            <option value="Trial">🆓 Prueba Gratis (14 días)</option>
            <option value="Starter">⭐ Inicial (1 condo)</option>
            <option value="Growth">🚀 Crecimiento (2-4 condos)</option>
            <option value="Pro">💎 Profesional (5-9 condos)</option>
            <option value="Enterprise">🏢 Corporativo (10+ condos)</option>
          </select>
        </div>
        <div className="mb-2">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
            Cantidad de Condos
          </label>
          <input
            type="number"
            min={formData.plan === "Enterprise" ? 10 : formData.plan === "Pro" ? 5 : formData.plan === "Growth" ? 2 : 1}
            value={condoCount}
            onChange={(e) => {
              const min = formData.plan === "Enterprise" ? 10 : formData.plan === "Pro" ? 5 : formData.plan === "Growth" ? 2 : 1;
              setCondoCount(Math.max(min, parseInt(e.target.value) || min));
            }}
            className="mt-1 block w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-white px-3.5 py-2 text-sm shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Precio: RD${condoCount >= 10 ? '800' : condoCount >= 5 ? '1,000' : condoCount >= 2 ? '1,200' : '1,500'}/condo
          </p>
        </div>

        {/* Addons Section */}
        <div className="md:col-span-2 mb-2">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
            Addons Disponibles
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AVAILABLE_ADDONS.map((addon) => (
              <label
                key={addon.id}
                className={`flex items-start p-3 rounded-xl border cursor-pointer transition-all ${formData.addons.includes(addon.id)
                  ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-500/10'
                  : 'border-neutral-200 dark:border-neutral-700/80 bg-neutral-50/50 dark:bg-neutral-800/50 hover:border-neutral-300 dark:hover:border-neutral-600'
                  }`}
              >
                <input
                  type="checkbox"
                  checked={formData.addons.includes(addon.id)}
                  onChange={() => handleAddonToggle(addon.id)}
                  className="mt-1 h-4 w-4 text-indigo-600 border-neutral-300 dark:border-neutral-600 rounded focus:ring-indigo-500 bg-white dark:bg-neutral-700"
                />
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">{addon.name}</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+RD${addon.monthlyPrice.toLocaleString()}/mes</span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{addon.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-neutral-50 dark:bg-gradient-to-r dark:from-indigo-950/40 dark:to-purple-950/40 border border-neutral-200 dark:border-indigo-500/30 mb-2">
          <h4 className="text-xs font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider mb-3">Resumen de Facturación</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>Plan Base ({condoCount} condo{condoCount > 1 ? 's' : ''})</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-200">RD${formData.plan === 'Trial' ? '0' : ((condoCount * (condoCount >= 10 ? 800 : condoCount >= 5 ? 1000 : condoCount >= 2 ? 1200 : 1500))).toLocaleString()}</span>
            </div>
            {formData.addons.length > 0 && (
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Addons ({formData.addons.length})</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-200">+RD${formData.addons.reduce((sum, id) => sum + (AVAILABLE_ADDONS.find(a => a.id === id)?.monthlyPrice || 0), 0).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-neutral-900 dark:text-white pt-2 border-t border-neutral-200 dark:border-neutral-700/80">
              <span>Total Mensual</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-lg">RD${monthlyFee.toLocaleString()}</span>
            </div>
            {formData.plan === 'Trial' && (
              <p className="text-xs text-amber-600 dark:text-yellow-400 mt-2 font-medium">⚠️ El plan Trial es gratuito por 14 días. Después se requiere seleccionar un plan pago.</p>
            )}
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="mr-3 py-2 px-4 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="py-2 px-5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center shadow-sm transition-colors"
          >
            {loading && <Spinner className="w-4 h-4 mr-2" />}
            {loading ? "Guardando..." : "Guardar Compañía"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// =============================================
// MODAL: VER CLIENTES (CONDOS) DE UNA COMPAÑÍA
// =============================================
type ViewClientsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
};

const ViewClientsModal = ({
  isOpen,
  onClose,
  company,
}: ViewClientsModalProps) => {
  const [condos, setCondos] = useState<Condo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && company) {
      fetchCondos();
    }
  }, [isOpen, company]);

  const fetchCondos = async () => {
    if (!company) return;
    setLoading(true);
    try {
      if (window.location.hostname === 'localhost' || company.id === 'dev-company-id' || company.id.startsWith('dev-')) {
        const stored = localStorage.getItem('micondo_live_condos_v2');
        const localCondos: Condo[] = stored ? JSON.parse(stored) : [];
        const condosToShow = localCondos.length > 0 ? localCondos : [];
        const filtered = condosToShow.filter((c: any) => c.companyId === company.id || company.id === 'dev-company-id');
        setCondos(filtered.length > 0 ? filtered : condosToShow);
        setLoading(false);
        return;
      }

      const { data: condoList, error } = await supabase
        .from('condos')
        .select('*')
        .eq('company_id', company.id);
      if (error) throw error;

      setCondos(condoList || []);
    } catch (error) {
      console.error("Error fetching condos:", error);
      const stored = localStorage.getItem('micondo_live_condos_v2');
      if (stored) {
        setCondos(JSON.parse(stored));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!company) return null;

  const totalUnits = condos.reduce((acc, condo) => {
    const units = (condo.units as unknown as any[]) || [];
    return acc + units.length;
  }, 0);

  const totalActiveUnits = condos.reduce((acc, condo) => {
    const units = (condo.units as unknown as any[]) || [];
    return acc + units.filter((u: any) => u.status === "Activo").length;
  }, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Clientes de: ${company.name}`}
      size="4xl"
    >
      <div className="p-6">
        {/* Resumen */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-neutral-800 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-400">
              {condos.length}
            </div>
            <div className="text-sm text-neutral-400">Condominios</div>
          </div>
          <div className="bg-neutral-800 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-400">
              {totalUnits}
            </div>
            <div className="text-sm text-neutral-400">Unidades Totales</div>
          </div>
          <div className="bg-neutral-800 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-400">
              {totalActiveUnits}
            </div>
            <div className="text-sm text-neutral-400">Unidades Activas</div>
          </div>
        </div>

        {/* Lista de Condos */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner className="w-8 h-8" />
          </div>
        ) : condos.length === 0 ? (
          <div className="text-center py-8 text-neutral-400">
            <Icon
              name="building-2"
              className="w-12 h-12 mx-auto mb-2 opacity-50"
            />
            <p>Esta compañía no tiene condominios registrados.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {condos.map((condo) => {
              const units = (condo.units as unknown as any[]) || [];
              const activeUnits = units.filter(
                (u: any) => u.status === "Activo"
              ).length;

              return (
                <div
                  key={condo.id}
                  className="bg-neutral-800 p-4 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <div className="font-semibold text-white">{condo.name}</div>
                    <div className="text-sm text-neutral-400">
                      {condo.address}
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      Código: {condo.code}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      {units.length}
                    </div>
                    <div className="text-xs text-neutral-400">unidades</div>
                    <div className="text-xs text-green-400">
                      {activeUnits} activas
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

// =============================================
// COMPONENTE: Billing Detail Modal (Portal de Facturación)
// =============================================
import { generateSaasPaymentReceiptPDF } from "../../utils/pdf";

type BillingDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  payments: PaymentRecord[];
  onPaymentRegistered: () => void;
};

const BillingDetailModal = ({
  isOpen,
  onClose,
  company,
  payments,
  onPaymentRegistered,
}: BillingDetailModalProps) => {
  const { addToast } = useToast();
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "Transferencia",
    reference: "",
    notes: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!company) return null;

  const companyPayments = payments
    .filter((p) => p.companyId === company.id)
    .sort(
      (a, b) =>
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );

  const lastPayment = companyPayments.length > 0 ? companyPayments[0] : null;
  const isTrial = company.plan === "Trial" || !company.plan;
  const billing = calculateBillingStatus(
    company.billingStartDate,
    company.gracePeriodDays,
    lastPayment,
    isTrial
  );

  const totalPaid = companyPayments.reduce((acc, p) => acc + p.amount, 0);

  const handleSubmitPayment = async () => {
    if (!paymentForm.amount) {
      addToast("Ingrese el monto del pago", "error");
      return;
    }

    setIsSaving(true);
    try {
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const paymentData = {
        company_id: company.id,
        company_name: company.name,
        amount: parseFloat(paymentForm.amount),
        payment_date: today.toISOString().split("T")[0],
        period_start: today.toISOString().split("T")[0],
        period_end: nextMonth.toISOString().split("T")[0],
        method: paymentForm.method,
        reference: paymentForm.reference,
        notes: paymentForm.notes,
        created_at: today.toISOString(),
      };

      await supabase.from('saas_payments').insert(paymentData);

      // FIX Bug #1: Actualizar status de la compañía a "Activo" para sincronizar Dashboard y Companies
      await supabase.from('companies').update({
        status: "Activo",
        last_payment_date: today.toISOString().split("T")[0]
      }).eq('id', company.id);

      addToast(`Pago de RD$${paymentForm.amount} registrado`, "success");

      // Send payment confirmation email (non-blocking)
      notifyPaymentConfirmation(
        company.id,
        parseFloat(paymentForm.amount),
        paymentData.reference || `PAY-${Date.now()}`,
        paymentData.period_start,
        paymentData.period_end
      ).catch(err => console.warn('Email notification failed:', err));

      setIsPaymentFormOpen(false);
      setPaymentForm({ amount: "", method: "Transferencia", reference: "", notes: "" });
      onPaymentRegistered();
    } catch (error) {
      console.error("Error:", error);
      addToast("Error al registrar el pago", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Facturación: ${company.name}`} size="4xl">
      <div className="p-6 space-y-6">
        {/* Estado de Cuenta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Estado Actual */}
          <div
            className={`rounded-2xl p-4 border shadow-2xs ${billing.status === "active"
              ? "bg-emerald-50/80 dark:bg-green-500/10 border-emerald-200 dark:border-green-500/30 text-emerald-700 dark:text-green-400"
              : billing.status === "grace"
                ? "bg-amber-50/80 dark:bg-yellow-500/10 border-amber-200 dark:border-yellow-500/30 text-amber-700 dark:text-yellow-400"
                : billing.status === "trial"
                  ? "bg-blue-50/80 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400"
                  : "bg-rose-50/80 dark:bg-red-500/10 border-rose-200 dark:border-red-500/30 text-rose-700 dark:text-red-400"
              }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon
                name={
                  billing.status === "active"
                    ? "check-circle"
                    : billing.status === "grace"
                      ? "clock"
                      : billing.status === "trial"
                        ? "gift"
                        : "alert-circle"
                }
                className="w-5 h-5"
              />
              <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Estado</span>
            </div>
            <p className="text-xl font-black tracking-tight">
              {billing.statusLabel}
            </p>
          </div>

          {/* Próximo Vencimiento */}
          <div className="bg-neutral-50 dark:bg-neutral-800/80 rounded-2xl p-4 border border-neutral-200/80 dark:border-neutral-700 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="calendar" className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Próximo Vencimiento</span>
            </div>
            <p className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">
              {billing.nextDueDate.toLocaleDateString("es-DO", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
            {billing.daysUntilDue > 0 && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                en {billing.daysUntilDue} días
              </p>
            )}
          </div>

          {/* Total Pagado */}
          <div className="bg-neutral-50 dark:bg-neutral-800/80 rounded-2xl p-4 border border-neutral-200/80 dark:border-neutral-700 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="dollar-sign" className="w-5 h-5 text-emerald-600 dark:text-green-400" />
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Total Pagado</span>
            </div>
            <p className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">
              RD$ {totalPaid.toLocaleString()}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {companyPayments.length} pagos registrados
            </p>
          </div>
        </div>

        {/* Información del Plan */}
        <div className="bg-neutral-50/80 dark:bg-neutral-800/50 rounded-2xl p-5 border border-neutral-200/80 dark:border-neutral-700/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-2xs">
          <div>
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Plan Actual</p>
            <p className="text-lg font-black text-neutral-900 dark:text-white">{company.plan || "Pro"}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Período de gracia: {company.gracePeriodDays} días • Condos: {company.condoCount || 1}
            </p>
          </div>
          <button
            onClick={() => setIsPaymentFormOpen(!isPaymentFormOpen)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <Icon name="plus" className="w-4 h-4" />
            Registrar Pago
          </button>
        </div>

        {/* Formulario de Pago */}
        {isPaymentFormOpen && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-emerald-300 dark:border-green-500/40 shadow-md space-y-4">
            <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2 text-sm">
              <Icon name="credit-card" className="w-4 h-4 text-emerald-600 dark:text-green-400" />
              Nuevo Pago de Suscripción
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">Monto (RD$) *</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white text-sm shadow-2xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="1500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">Método</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white text-sm shadow-2xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option>Transferencia</option>
                  <option>Depósito</option>
                  <option>Efectivo</option>
                  <option>Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">Referencia</label>
                <input
                  type="text"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white text-sm shadow-2xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="REF-001"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">Notas</label>
                <input
                  type="text"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white text-sm shadow-2xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="Pago mensual periodo actual"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setIsPaymentFormOpen(false)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl text-neutral-700 dark:text-neutral-300 text-xs font-semibold border border-neutral-200 dark:border-neutral-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitPayment}
                disabled={isSaving}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors"
              >
                {isSaving ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Icon name="check" className="w-3.5 h-3.5" />
                )}
                Guardar Pago
              </button>
            </div>
          </div>
        )}

        {/* Historial de Pagos */}
        <div>
          <h4 className="font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
            <Icon name="history" className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            Historial de Pagos
          </h4>
          {companyPayments.length === 0 ? (
            <div className="text-center py-8 text-neutral-400 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
              <Icon name="inbox" className="w-10 h-10 mx-auto mb-2 opacity-40 text-neutral-400" />
              <p className="text-xs font-medium">No hay pagos registrados</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto">
              {companyPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3.5 bg-neutral-50/70 dark:bg-neutral-800/50 rounded-xl border border-neutral-200/80 dark:border-neutral-700/50 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Icon name="check" className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-neutral-900 dark:text-white font-bold text-sm">
                        RD$ {payment.amount.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                        {payment.method} • {payment.reference || "Sin ref."}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        {new Date(payment.paymentDate).toLocaleDateString("es-DO", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        Período: {payment.periodStart} - {payment.periodEnd}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        generateSaasPaymentReceiptPDF({
                          receiptNumber: `REC-${payment.id.slice(-6).toUpperCase()}`,
                          companyName: company.name,
                          companyRnc: company.rnc,
                          amount: payment.amount,
                          paymentDate: payment.paymentDate,
                          periodStart: payment.periodStart,
                          periodEnd: payment.periodEnd,
                          method: payment.method,
                          reference: payment.reference,
                        });
                        addToast("Recibo generado", "success");
                      }}
                      className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                      title="Descargar Recibo"
                    >
                      <Icon name="download" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-700 dark:text-neutral-200 font-semibold text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

// =============================================
// COMPONENTE: TAB DE FACTURACIÓN
// =============================================
type BillingTabProps = {
  companies: Company[];
};

const BillingTab = ({ companies }: BillingTabProps) => {
  const { addToast } = useToast();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "Transferencia",
    reference: "",
    notes: "",
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      // DEV MODE: use mock data when Supabase is unreachable
      if (window.location.hostname === 'localhost') {
        const { data: paymentList, error } = await supabase
          .from('saas_payments')
          .select('*');
        if (error) {
          console.warn('Supabase offline, using mock payments');
          setPayments([{
            id: 'mock-pay-1', companyId: 'dev-company-1', companyName: 'Empresa Demo 1',
            amount: 1500, paymentDate: '2026-03-01', periodStart: '2026-03-01',
            periodEnd: '2026-03-31', method: 'Transferencia', reference: 'REF-DEMO-001',
            createdAt: new Date().toISOString()
          }]);
          setLoading(false);
          return;
        }
        const mappedPayments = (paymentList || []).map((p: any) => ({
          ...p, companyId: p.company_id, companyName: p.company_name,
          paymentDate: p.payment_date, periodStart: p.period_start,
          periodEnd: p.period_end, createdAt: p.created_at
        }));
        mappedPayments.sort((a: any, b: any) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
        setPayments(mappedPayments);
        setLoading(false);
        return;
      }

      const { data: paymentList, error } = await supabase
        .from('saas_payments')
        .select('*');
      if (error) throw error;

      const mappedPayments = (paymentList || []).map((p: any) => ({
        ...p,
        companyId: p.company_id,
        companyName: p.company_name,
        paymentDate: p.payment_date,
        periodStart: p.period_start,
        periodEnd: p.period_end,
        createdAt: p.created_at
      }));

      // Ordenar por fecha descendente
      mappedPayments.sort(
        (a: any, b: any) =>
          new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      );
      setPayments(mappedPayments);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPayment = async () => {
    if (!selectedCompany || !paymentForm.amount) {
      addToast("Seleccione una compañía y monto.", "error");
      return;
    }

    try {
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const paymentData = {
        companyId: selectedCompany.id,
        companyName: selectedCompany.name,
        amount: parseFloat(paymentForm.amount),
        paymentDate: today.toISOString().split("T")[0],
        periodStart: today.toISOString().split("T")[0],
        periodEnd: nextMonth.toISOString().split("T")[0],
        method: paymentForm.method,
        reference: paymentForm.reference,
        notes: paymentForm.notes,
        createdAt: today.toISOString(),
      };

      await supabase.from('saas_payments').insert(paymentData);
      addToast(
        `Pago de $${paymentForm.amount} registrado para ${selectedCompany.name}.`,
        "success"
      );

      // Send payment confirmation email (non-blocking)
      notifyPaymentConfirmation(
        selectedCompany.id,
        parseFloat(paymentForm.amount),
        paymentData.reference || `PAY-${Date.now()}`,
        paymentData.periodStart,
        paymentData.periodEnd
      ).catch(err => console.warn('Email notification failed:', err));

      setIsPaymentModalOpen(false);
      setSelectedCompany(null);
      setPaymentForm({
        amount: "",
        method: "Transferencia",
        reference: "",
        notes: "",
      });
      fetchPayments();
    } catch (error) {
      console.error("Error registering payment:", error);
      addToast("Error al registrar el pago.", "error");
    }
  };

  // Calcular totales
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthPayments = payments.filter((p: any) => {
    const pDate = new Date(p.paymentDate);
    return (
      pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear
    );
  });
  const totalThisMonth = thisMonthPayments.reduce(
    (acc: number, p: any) => acc + (p.amount || 0),
    0
  );
  const totalAllTime = payments.reduce(
    (acc: number, p: any) => acc + (p.amount || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Métricas de Facturación - Estilo moderno */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Recaudado Este Mes - Card destacada */}
        <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Icon name="trending-up" className="w-6 h-6" />
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50 font-semibold">
              Este Mes
            </span>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-1">Recaudado</p>
          <p className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            RD$ {totalThisMonth.toLocaleString()}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
            {thisMonthPayments.length} pagos recibidos
          </p>
        </div>

        {/* Promedio por Cliente */}
        <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Icon name="calculator" className="w-6 h-6" />
            </div>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-1">Promedio por Pago</p>
          <p className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            RD$ {thisMonthPayments.length > 0
              ? Math.round(totalThisMonth / thisMonthPayments.length).toLocaleString()
              : "0"}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
            Ticket promedio mensual
          </p>
        </div>

        {/* Total Histórico */}
        <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Icon name="wallet" className="w-6 h-6" />
            </div>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-1">Total Histórico</p>
          <p className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            RD$ {totalAllTime.toLocaleString()}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
            {payments.length} pagos totales
          </p>
        </div>
      </div>

      {/* Botón Registrar Pago */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">Historial de Pagos</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Transacciones y facturación SaaS de administradoras</p>
        </div>
        <button
          onClick={() => setIsPaymentModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-sm"
        >
          <Icon name="plus" size={16} />
          Registrar Pago
        </button>
      </div>

      {/* Historial de Pagos - Tabla mejorada */}
      <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-2xs">
        <table className="min-w-full">
          <thead className="bg-neutral-50 dark:bg-neutral-800/40 border-b border-neutral-200 dark:border-neutral-800">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Compañía
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Método
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Referencia
              </th>
              <th className="px-6 py-3.5 text-center text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
            {loading && (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <Spinner className="w-8 h-8 mx-auto" />
                  <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-2">Cargando pagos...</p>
                </td>
              </tr>
            )}
            {!loading && payments.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3 text-neutral-400">
                    <Icon name="credit-card" className="w-7 h-7" />
                  </div>
                  <p className="text-neutral-900 dark:text-white font-bold text-sm">
                    No hay pagos registrados
                  </p>
                  <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-1">
                    Los pagos registrados aparecerán aquí
                  </p>
                </td>
              </tr>
            )}
            {!loading &&
              payments.length > 0 &&
              payments.map((payment: any) => (
                <tr
                  key={payment.id}
                  className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30 transition-colors"
                >
                  <td className="px-6 py-4 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {payment.paymentDate}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Icon name="building-2" className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">
                        {payment.companyName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/50 px-2.5 py-1 rounded-lg">
                      RD$ {payment.amount?.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                    {payment.method}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    {payment.reference || "—"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => {
                        generateSaasPaymentReceiptPDF({
                          receiptNumber: `REC-${payment.id.slice(-6).toUpperCase()}`,
                          companyName: payment.companyName,
                          companyRnc: "",
                          amount: payment.amount,
                          paymentDate: payment.paymentDate,
                          periodStart: payment.periodStart || payment.paymentDate,
                          periodEnd: payment.periodEnd || payment.paymentDate,
                          method: payment.method,
                          reference: payment.reference,
                        });
                        addToast("Recibo generado correctamente", "success");
                      }}
                      className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors inline-flex items-center gap-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                      title="Descargar Recibo PDF"
                    >
                      <Icon name="download" className="w-4 h-4" />
                      <span className="text-xs font-semibold">PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Modal Registrar Pago */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Registrar Pago de Suscripción"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Compañía
            </label>
            <select
              value={selectedCompany?.id || ""}
              onChange={(e) =>
                setSelectedCompany(
                  companies.find((c) => c.id === e.target.value) || null
                )
              }
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white text-sm shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Seleccionar compañía...</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Monto (RD$)
            </label>
            <input
              type="number"
              value={paymentForm.amount}
              onChange={(e) =>
                setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))
              }
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white text-sm shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="1500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Método de Pago
            </label>
            <select
              value={paymentForm.method}
              onChange={(e) =>
                setPaymentForm((prev) => ({ ...prev, method: e.target.value }))
              }
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white text-sm shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Transferencia">Transferencia</option>
              <option value="Depósito">Depósito</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Referencia (opcional)
            </label>
            <input
              type="text"
              value={paymentForm.reference}
              onChange={(e) =>
                setPaymentForm((prev) => ({
                  ...prev,
                  reference: e.target.value,
                }))
              }
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white text-sm shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="No. de confirmación"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Notas (opcional)
            </label>
            <textarea
              value={paymentForm.notes}
              onChange={(e) =>
                setPaymentForm((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white text-sm shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-700 dark:text-neutral-200 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleRegisterPayment}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white font-bold text-xs shadow-sm transition-colors"
            >
              Registrar Pago
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// =============================================
// COMPONENTE: TAB DE COMUNICACIONES
// =============================================
type CommunicationsTabProps = {
  companies: Company[];
};

const CommunicationsTab = ({ companies }: CommunicationsTabProps) => {
  const { addToast } = useToast();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    type: "info",
    targetAudience: "all",
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data: announcementsList, error } = await supabase
        .from('saas_announcements')
        .select('*');
      if (error) {
        console.warn('Supabase offline, using mock announcements');
        setAnnouncements([{
          id: 'mock-ann-1', title: 'Bienvenido al modo desarrollo',
          content: 'Supabase est\u00e1 desconectado. Los datos mostrados son de prueba.',
          type: 'info', isActive: true, targetAudience: 'all',
          publishDate: new Date().toISOString().split('T')[0],
          expirationDate: null
        }]);
        setLoading(false);
        return;
      }

      const mappedAnnouncements = (announcementsList || []).map((a: any) => ({
        ...a,
        isActive: a.is_active,
        targetAudience: a.target_audience,
        publishDate: a.publish_date,
        expirationDate: a.expiration_date
      }));

      mappedAnnouncements.sort(
        (a: any, b: any) =>
          new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
      );
      setAnnouncements(mappedAnnouncements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.content) {
      addToast("Complete todos los campos requeridos.", "error");
      return;
    }

    try {
      const newAnnouncement = {
        title: announcementForm.title,
        content: announcementForm.content,
        type: announcementForm.type,
        target_audience: announcementForm.targetAudience,
        is_active: true,
        publish_date: new Date().toISOString().split('T')[0],
      };

      const { data, error } = await supabase.from('saas_announcements').insert(newAnnouncement);
      if (error) throw error;

      addToast("Anuncio publicado correctamente", "success");
      setIsAnnouncementModalOpen(false);
      setAnnouncementForm({
        title: "",
        content: "",
        type: "info",
        targetAudience: "all",
      });
      fetchAnnouncements();
    } catch (error) {
      console.error("Error publishing announcement:", error);
      addToast("Error al publicar el anuncio.", "error");
    }
  };

  const toggleAnnouncementStatus = async (announcement: any) => {
    const newStatus = !announcement.isActive;
    try {
      const { error } = await supabase
        .from('saas_announcements')
        .update({ is_active: newStatus })
        .eq('id', announcement.id);
      if (error) throw error;
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === announcement.id ? { ...a, isActive: newStatus } : a))
      );
      addToast(
        `Anuncio ${newStatus ? "activado" : "desactivado"} correctamente`,
        "success"
      );
    } catch (error) {
      console.error("Error toggling announcement status:", error);
      addToast("Error al actualizar el estado del anuncio", "error");
    }
  };

  const getTypeConfig = (type: string) => {
    const configs: Record<
      string,
      { color: string; icon: string; label: string }
    > = {
      info: { color: "text-blue-400", icon: "info", label: "Información" },
      warning: {
        color: "text-yellow-400",
        icon: "alert-triangle",
        label: "Advertencia",
      },
      update: {
        color: "text-green-400",
        icon: "sparkles",
        label: "Actualización",
      },
      maintenance: {
        color: "text-orange-400",
        icon: "wrench",
        label: "Mantenimiento",
      },
    };
    return configs[type] || configs.info;
  };

  return (
    <div className="space-y-6">
      {/* Métricas de Comunicaciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Anuncios Activos */}
        <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Icon name="megaphone" className="w-6 h-6" />
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50 font-semibold">
              Activos
            </span>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-1">Anuncios Activos</p>
          <p className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            {announcements.filter((a: any) => a.isActive).length}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
            Visibles para administradoras y clientes
          </p>
        </div>

        {/* Total Anuncios */}
        <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Icon name="file-text" className="w-6 h-6" />
            </div>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-1">Total Anuncios</p>
          <p className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            {announcements.length}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">Histórico completo</p>
        </div>

        {/* Alcance */}
        <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Icon name="users" className="w-6 h-6" />
            </div>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-1">Compañías Alcanzadas</p>
          <p className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">{companies.length}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">Empresas administradoras activas</p>
        </div>
      </div>

      {/* Templates Rápidos */}
      <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 shadow-2xs">
        <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          <Icon name="zap" className="w-5 h-5 text-amber-500" />
          Plantillas Rápidas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => {
              setAnnouncementForm({
                title: "Mantenimiento Programado",
                content: "Realizaremos un mantenimiento preventivo de infraestructura el [FECHA] de [HORA] a [HORA]. El servicio permanecerá activo con posibles intermitencias breves.",
                type: "maintenance",
                targetAudience: "all",
              });
              setIsAnnouncementModalOpen(true);
            }}
            className="flex flex-col items-center gap-2 p-4 bg-orange-50/70 hover:bg-orange-100/70 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 border border-orange-200/80 dark:border-orange-500/30 rounded-xl transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Icon name="wrench" className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 text-center">Mantenimiento</span>
          </button>

          <button
            onClick={() => {
              setAnnouncementForm({
                title: "¡Nueva Actualización de Plataforma!",
                content: "Hemos incorporado nuevas funcionalidades en MI CONDO SaaS:\n\n• Conciliación bancaria mejorada\n• Portal de residentes con dark mode y soporte móvil\n• Gestión de asambleas y actas digitales",
                type: "update",
                targetAudience: "all",
              });
              setIsAnnouncementModalOpen(true);
            }}
            className="flex flex-col items-center gap-2 p-4 bg-emerald-50/70 hover:bg-emerald-100/70 dark:bg-green-500/10 dark:hover:bg-green-500/20 border border-emerald-200/80 dark:border-green-500/30 rounded-xl transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-green-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Icon name="sparkles" className="w-5 h-5 text-emerald-600 dark:text-green-400" />
            </div>
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 text-center">Actualización</span>
          </button>

          <button
            onClick={() => {
              setAnnouncementForm({
                title: "Recordatorio de Pago de Licencia",
                content: "Le recordamos que el ciclo de facturación de su suscripción SaaS vence próximamente. Para mantener el acceso continuo a todos sus condominios, realice su pago vía transferencia bancaria.",
                type: "warning",
                targetAudience: "all",
              });
              setIsAnnouncementModalOpen(true);
            }}
            className="flex flex-col items-center gap-2 p-4 bg-amber-50/70 hover:bg-amber-100/70 dark:bg-yellow-500/10 dark:hover:bg-yellow-500/20 border border-amber-200/80 dark:border-yellow-500/30 rounded-xl transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-yellow-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Icon name="bell" className="w-5 h-5 text-amber-600 dark:text-yellow-400" />
            </div>
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 text-center">Recordatorio</span>
          </button>

          <button
            onClick={() => {
              setAnnouncementForm({
                title: "Comunicado Oficial",
                content: "A todas las empresas administradoras: les compartimos información importante acerca de las actualizaciones fiscales DGII aplicables a la gestión de condominios.",
                type: "info",
                targetAudience: "all",
              });
              setIsAnnouncementModalOpen(true);
            }}
            className="flex flex-col items-center gap-2 p-4 bg-blue-50/70 hover:bg-blue-100/70 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 border border-blue-200/80 dark:border-blue-500/30 rounded-xl transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Icon name="info" className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 text-center">Información</span>
          </button>
        </div>
      </div>

      {/* Header + Botón Nuevo Anuncio */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
            Anuncios Publicados
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Circulares y notificaciones globales del sistema</p>
        </div>
        <button
          onClick={() => setIsAnnouncementModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-sm"
        >
          <Icon name="megaphone" size={16} />
          Nuevo Anuncio
        </button>
      </div>

      {/* Lista de Anuncios */}
      <div className="space-y-3.5">
        {loading && (
          <div className="text-center py-12 bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-2xs">
            <Spinner className="w-8 h-8 mx-auto" />
            <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-2">Cargando anuncios...</p>
          </div>
        )}

        {!loading && announcements.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3 text-neutral-400">
              <Icon name="megaphone" className="w-7 h-7" />
            </div>
            <p className="text-neutral-900 dark:text-white font-bold text-sm">
              No hay anuncios publicados
            </p>
            <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-1">
              Crea tu primer anuncio para comunicarte con tus clientes
            </p>
          </div>
        )}

        {!loading &&
          announcements.length > 0 &&
          announcements.map((announcement: any) => {
            const typeConfig = getTypeConfig(announcement.type);
            return (
              <div
                key={announcement.id}
                className={`bg-white dark:bg-[#161b26] border rounded-2xl p-5 transition-all shadow-2xs ${announcement.isActive
                  ? "border-l-4 border-l-emerald-500 border-neutral-200/80 dark:border-neutral-800"
                  : "border-neutral-200/80 dark:border-neutral-800 opacity-60"
                  }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${typeConfig.color}`}
                      >
                        {typeConfig.label}
                      </span>
                      {announcement.isActive ? (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50">
                          ● Activo
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-neutral-900 dark:text-white">
                      {announcement.title}
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1.5 leading-relaxed line-clamp-3">
                      {announcement.content}
                    </p>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-3 flex items-center gap-4 font-medium">
                      <span className="flex items-center gap-1">
                        <Icon name="calendar" className="w-3.5 h-3.5" />
                        {announcement.publishDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="users" className="w-3.5 h-3.5" />
                        Destino: {announcement.targetAudience === "all"
                          ? "Todos"
                          : announcement.targetAudience === "admin"
                            ? "Administradores"
                            : "Residentes"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleAnnouncementStatus(announcement)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${announcement.isActive
                      ? "bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50"
                      : "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50"
                      }`}
                  >
                    {announcement.isActive ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Modal Nuevo Anuncio */}
      <Modal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        title="Publicar Nuevo Anuncio"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Título *
            </label>
            <input
              type="text"
              value={announcementForm.title}
              onChange={(e) =>
                setAnnouncementForm((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white text-sm shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="Ej: Nueva funcionalidad disponible"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Contenido *
            </label>
            <textarea
              value={announcementForm.content}
              onChange={(e) =>
                setAnnouncementForm((prev) => ({
                  ...prev,
                  content: e.target.value,
                }))
              }
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white text-sm shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              rows={4}
              placeholder="Escriba el contenido del anuncio..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Tipo
              </label>
              <select
                value={announcementForm.type}
                onChange={(e) =>
                  setAnnouncementForm((prev) => ({
                    ...prev,
                    type: e.target.value,
                  }))
                }
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white text-sm shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="info">ℹ️ Información</option>
                <option value="update">✨ Actualización</option>
                <option value="warning">⚠️ Advertencia</option>
                <option value="maintenance">🔧 Mantenimiento</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Audiencia
              </label>
              <select
                value={announcementForm.targetAudience}
                onChange={(e) =>
                  setAnnouncementForm((prev) => ({
                    ...prev,
                    targetAudience: e.target.value,
                  }))
                }
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white text-sm shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">Todos los usuarios</option>
                <option value="admin">Solo Administradores</option>
                <option value="resident">Solo Residentes</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              onClick={() => setIsAnnouncementModalOpen(false)}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-700 dark:text-neutral-200 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handlePublishAnnouncement}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-bold text-xs shadow-sm transition-colors"
            >
              Publicar Anuncio
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// =============================================
// COMPONENTE: Tab de Mensajes Directos
// =============================================
const MessagesTab = ({ companies }: { companies: Company[] }) => {
  const { addToast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [messageForm, setMessageForm] = useState({
    companyId: "",
    subject: "",
    content: "",
  });
  const [filter, setFilter] = useState<"all" | "unread" | "sent" | "received">(
    "all"
  );

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data: messagesList, error } = await supabase
        .from('saas_messages')
        .select('*');
      if (error) throw error;

      const mappedMessages = (messagesList || []).map((m: any) => ({
        ...m,
        companyId: m.company_id,
        companyName: m.company_name,
        isRead: m.is_read,
        createdAt: m.created_at
      }));

      // Ordenar por fecha más reciente
      mappedMessages.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setMessages(mappedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      addToast("Error al cargar los mensajes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSendMessage = async () => {
    if (
      !messageForm.companyId ||
      !messageForm.subject ||
      !messageForm.content
    ) {
      addToast("Complete todos los campos", "error");
      return;
    }

    const company = companies.find((c) => c.id === messageForm.companyId);
    if (!company) {
      addToast("Compañía no encontrada", "error");
      return;
    }

    try {
      const newMessage = {
        company_id: messageForm.companyId,
        company_name: company.name,
        subject: messageForm.subject,
        content: messageForm.content,
        direction: "to_client",
        is_read: false,
        created_at: new Date().toISOString(),
      };

      await supabase.from('saas_messages').insert(newMessage);
      addToast("Mensaje enviado correctamente", "success");
      setIsComposeModalOpen(false);
      setMessageForm({ companyId: "", subject: "", content: "" });
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      addToast("Error al enviar el mensaje", "error");
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await supabase.from('saas_messages').update({ is_read: true }).eq('id', messageId);
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, isRead: true } : m))
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const filteredMessages = messages.filter((msg) => {
    if (selectedCompany && msg.companyId !== selectedCompany) return false;
    if (filter === "unread") return !msg.isRead;
    if (filter === "sent") return msg.direction === "to_client";
    if (filter === "received") return msg.direction === "from_client";
    return true;
  });

  const unreadCount = messages.filter(
    (m) => !m.isRead && m.direction === "from_client"
  ).length;
  const sentCount = messages.filter((m) => m.direction === "to_client").length;
  const receivedCount = messages.filter(
    (m) => m.direction === "from_client"
  ).length;

  // Agrupar mensajes por compañía para la vista de conversaciones
  const conversationsByCompany = messages.reduce(
    (acc: Record<string, any[]>, msg) => {
      if (!acc[msg.companyId]) acc[msg.companyId] = [];
      acc[msg.companyId].push(msg);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2 tracking-tight">
            <Icon name="message-circle" className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Mensajes Directos
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Canal de comunicación y soporte técnico con administradoras de condominios
          </p>
        </div>
        <button
          onClick={() => setIsComposeModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <Icon name="send" size={16} />
          Nuevo Mensaje
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#161b26] rounded-2xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
          <div className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">{messages.length}</div>
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mt-1">Total Mensajes</div>
        </div>
        <div className="bg-white dark:bg-[#161b26] rounded-2xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
          <div className="text-2xl font-black text-rose-600 dark:text-red-400 tracking-tight">{unreadCount}</div>
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mt-1">Sin Leer</div>
        </div>
        <div className="bg-white dark:bg-[#161b26] rounded-2xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">{sentCount}</div>
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mt-1">Enviados</div>
        </div>
        <div className="bg-white dark:bg-[#161b26] rounded-2xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
          <div className="text-2xl font-black text-emerald-600 dark:text-green-400 tracking-tight">
            {receivedCount}
          </div>
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mt-1">Recibidos</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={selectedCompany || ""}
          onChange={(e) => setSelectedCompany(e.target.value || null)}
          className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl px-4 py-2 text-xs font-medium text-neutral-800 dark:text-white shadow-2xs focus:border-purple-500"
        >
          <option value="">Todas las compañías</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-xl border border-neutral-200/80 dark:border-neutral-700/80">
          {(["all", "unread", "sent", "received"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${filter === f
                ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white font-bold shadow-2xs"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-medium"
                }`}
            >
              {f === "all"
                ? "Todos"
                : f === "unread"
                  ? "Sin Leer"
                  : f === "sent"
                    ? "Enviados"
                    : "Recibidos"}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {loading && (
          <div className="text-center py-12 bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-2xs">
            <Spinner />
            <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-2">Cargando mensajes...</p>
          </div>
        )}

        {!loading && filteredMessages.length === 0 && (
          <div className="text-center py-12 text-neutral-500 dark:text-neutral-400 bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-2xs">
            <Icon
              name="message-circle"
              className="w-12 h-12 mx-auto mb-2 opacity-40 text-neutral-400"
            />
            <p className="text-sm font-semibold">No hay mensajes en este buzón</p>
          </div>
        )}

        {!loading &&
          filteredMessages.length > 0 &&
          filteredMessages.map((msg: any) => (
            <div
              key={msg.id}
              className={`bg-white dark:bg-[#161b26] p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 border-l-4 cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-2xs ${msg.direction === "from_client"
                ? msg.isRead
                  ? "border-l-neutral-400 dark:border-l-neutral-600"
                  : "border-l-emerald-500"
                : "border-l-blue-500"
                }`}
              onClick={() =>
                !msg.isRead &&
                msg.direction === "from_client" &&
                markAsRead(msg.id)
              }
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon
                      name={
                        msg.direction === "to_client"
                          ? "arrow-right"
                          : "arrow-left"
                      }
                      className={`w-4 h-4 ${msg.direction === "to_client" ? "text-blue-600 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400"}`}
                    />
                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      {msg.direction === "to_client"
                        ? "Enviado a:"
                        : "Recibido de:"}
                    </span>
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">
                      {msg.companyName}
                    </span>
                    {!msg.isRead && msg.direction === "from_client" && (
                      <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        Nuevo
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                    {msg.subject}
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 line-clamp-2 leading-relaxed">
                    {msg.content}
                  </p>
                  <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-2.5 font-medium">
                    {new Date(msg.createdAt).toLocaleString("es-DO", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Modal Nuevo Mensaje */}
      <Modal
        isOpen={isComposeModalOpen}
        onClose={() => setIsComposeModalOpen(false)}
        title="Enviar Nuevo Mensaje"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Destinatario *
            </label>
            <select
              value={messageForm.companyId}
              onChange={(e) =>
                setMessageForm((prev) => ({
                  ...prev,
                  companyId: e.target.value,
                }))
              }
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white text-sm shadow-2xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            >
              <option value="">Seleccione una compañía...</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Asunto *
            </label>
            <input
              type="text"
              value={messageForm.subject}
              onChange={(e) =>
                setMessageForm((prev) => ({ ...prev, subject: e.target.value }))
              }
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white text-sm shadow-2xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              placeholder="Ej: Actualización de cuota de servicio"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Mensaje *
            </label>
            <textarea
              value={messageForm.content}
              onChange={(e) =>
                setMessageForm((prev) => ({ ...prev, content: e.target.value }))
              }
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white text-sm shadow-2xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              rows={5}
              placeholder="Escriba su mensaje aquí..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              onClick={() => setIsComposeModalOpen(false)}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-700 dark:text-neutral-200 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors"
            >
              <Icon name="send" size={16} />
              Enviar Mensaje
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// =============================================
// COMPONENTE: Tab de Configuración
// =============================================
const SettingsTab = () => {
  const { addToast } = useToast();
  const [settings, setSettings] = useState({
    companyName: "MI CONDO SaaS",
    supportEmail: "soporte@micondo.app",
    supportPhone: "809-555-1234",
    defaultGracePeriod: 7,
    defaultCurrency: "DOP",
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    maintenanceMode: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('saas_settings').select('key, value');
      if (error) throw error;

      const newSettings = { ...settings };
      data.forEach((row: any) => {
        Object.assign(newSettings, row.value);
      });
      setSettings(newSettings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      addToast("Error al cargar la configuración", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const updates = [
        { key: 'platform_info', value: { companyName: settings.companyName, supportEmail: settings.supportEmail, supportPhone: settings.supportPhone } },
        { key: 'billing_defaults', value: { defaultGracePeriod: settings.defaultGracePeriod, defaultCurrency: settings.defaultCurrency } },
        { key: 'notifications', value: { enableEmailNotifications: settings.enableEmailNotifications, enableSmsNotifications: settings.enableSmsNotifications } },
        { key: 'system_status', value: { maintenanceMode: settings.maintenanceMode } },
      ];

      for (const update of updates) {
        await supabase.from('saas_settings').update({ value: update.value }).eq('key', update.key);
      }

      addToast("Configuración guardada correctamente", "success");
    } catch (error) {
      console.error("Error saving settings:", error);
      addToast("Error al guardar la configuración", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Configuración</h2>
          <p className="text-neutral-400 text-sm mt-1">
            Ajustes generales del sistema
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition-all"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Icon name="save" className="w-4 h-4" />
              Guardar Cambios
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información General */}
        <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Icon name="building-2" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Información de Plataforma
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Identidad del sistema y canales de soporte</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Nombre de la Plataforma
              </label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) =>
                  setSettings({ ...settings, companyName: e.target.value })
                }
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white text-sm shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Email de Soporte Técnico
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) =>
                  setSettings({ ...settings, supportEmail: e.target.value })
                }
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white text-sm shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Teléfono de Soporte
              </label>
              <input
                type="tel"
                value={settings.supportPhone}
                onChange={(e) =>
                  setSettings({ ...settings, supportPhone: e.target.value })
                }
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white text-sm shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Configuración de Facturación */}
        <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Icon name="credit-card" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Facturación SaaS</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Parámetros por defecto para suscripciones</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Período de Gracia por Defecto (días)
              </label>
              <input
                type="number"
                value={settings.defaultGracePeriod}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultGracePeriod: parseInt(e.target.value) || 7,
                  })
                }
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white text-sm shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Moneda Base del Sistema
              </label>
              <select
                value={settings.defaultCurrency}
                onChange={(e) =>
                  setSettings({ ...settings, defaultCurrency: e.target.value })
                }
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white text-sm shadow-2xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              >
                <option value="DOP">DOP - Peso Dominicano (RD$)</option>
                <option value="USD">USD - Dólar Americano ($)</option>
                <option value="EUR">EUR - Euro (€)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Icon name="bell" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Notificaciones</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Canales de entrega de avisos y alertas</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-neutral-50/70 dark:bg-neutral-800/50 rounded-xl border border-neutral-200/80 dark:border-neutral-700/60">
              <div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">
                  Notificaciones por Email
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Enviar confirmaciones de pago y alertas por correo
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    enableEmailNotifications: !settings.enableEmailNotifications,
                  })
                }
                className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${settings.enableEmailNotifications
                  ? "bg-purple-600"
                  : "bg-neutral-300 dark:bg-neutral-700"
                  }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all duration-200 shadow-sm ${settings.enableEmailNotifications
                    ? "translate-x-5"
                    : "translate-x-0"
                    }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-neutral-50/70 dark:bg-neutral-800/50 rounded-xl border border-neutral-200/80 dark:border-neutral-700/60">
              <div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">
                  Notificaciones por SMS / WhatsApp
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Enviar avisos de pago inmediato al móvil del administrador
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    enableSmsNotifications: !settings.enableSmsNotifications,
                  })
                }
                className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${settings.enableSmsNotifications
                  ? "bg-purple-600"
                  : "bg-neutral-300 dark:bg-neutral-700"
                  }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all duration-200 shadow-sm ${settings.enableSmsNotifications
                    ? "translate-x-5"
                    : "translate-x-0"
                    }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Modo Mantenimiento */}
        <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Icon name="settings" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Sistema & Entorno</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Estado operativo y control de plataforma</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-neutral-50/70 dark:bg-neutral-800/50 rounded-xl border border-neutral-200/80 dark:border-neutral-700/60">
              <div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">
                  Modo Mantenimiento
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Deshabilita temporalmente el acceso general para clientes
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    maintenanceMode: !settings.maintenanceMode,
                  })
                }
                className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${settings.maintenanceMode ? "bg-orange-600" : "bg-neutral-300 dark:bg-neutral-700"
                  }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all duration-200 shadow-sm ${settings.maintenanceMode
                    ? "translate-x-5"
                    : "translate-x-0"
                    }`}
                />
              </button>
            </div>
            <div className="p-4 bg-neutral-50/70 dark:bg-neutral-800/40 rounded-xl border border-neutral-200/80 dark:border-neutral-700/50">
              <div className="flex items-start gap-3">
                <Icon name="info" className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white">
                    MI CONDO SaaS v1.0.0-pro
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Ambiente: {window.location.hostname === "localhost" ? "Desarrollo Local" : "Producción"} • RNC: 1-33-04982-1
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================
// COMPONENTE: Tab de Planes de Suscripción
// =============================================
type PricingTier = {
  minCondos: number;
  maxCondos: number | null;
  pricePerCondo: number;
  priceUSD: number;
  label: string;
};

const PRICING_TIERS: PricingTier[] = [
  { minCondos: 1, maxCondos: 1, pricePerCondo: 1500, priceUSD: 25, label: "1 condo" },
  { minCondos: 2, maxCondos: 4, pricePerCondo: 1200, priceUSD: 20, label: "2-4 condos" },
  { minCondos: 5, maxCondos: 9, pricePerCondo: 1000, priceUSD: 17, label: "5-9 condos" },
  { minCondos: 10, maxCondos: null, pricePerCondo: 800, priceUSD: 13, label: "10+ condos" },
];

const TRIAL_DAYS = 14;

const calculateMonthlyPrice = (condoCount: number): { total: number; perCondo: number; tier: PricingTier } => {
  const tier = PRICING_TIERS.find(
    (t) => condoCount >= t.minCondos && (t.maxCondos === null || condoCount <= t.maxCondos)
  ) || PRICING_TIERS[PRICING_TIERS.length - 1];

  return {
    total: condoCount * tier.pricePerCondo,
    perCondo: tier.pricePerCondo,
    tier,
  };
};

const PlansTab = ({ companies }: { companies: Company[] }) => {
  const { addToast } = useToast();
  const [condoSlider, setCondoSlider] = useState(1);
  const [showCalculator, setShowCalculator] = useState(false);

  const pricing = calculateMonthlyPrice(condoSlider);
  const annualTotal = pricing.total * 12;
  const annualDiscount = annualTotal * 0.1; // 10% descuento anual

  // Estadísticas de planes actuales
  const planStats = {
    trial: companies.filter((c) => c.plan === "Trial" || !c.plan).length,
    active: companies.filter((c) => c.status === "Activo" && c.plan !== "Trial").length,
    totalCondos: companies.reduce((acc, c) => acc + (c.condoCount || 1), 0),
    monthlyRevenue: companies
      .filter((c) => c.status === "Activo" && c.plan !== "Trial")
      .reduce((acc, c) => {
        const condos = c.condoCount || 1;
        return acc + calculateMonthlyPrice(condos).total;
      }, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">Planes y Precios SaaS</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Estructura de cobro mensual a empresas administradoras (Wise Services Dominicana SRL)
          </p>
        </div>
        <button
          onClick={() => setShowCalculator(!showCalculator)}
          className="px-4 py-2 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white border border-neutral-200/80 dark:border-neutral-700 rounded-xl flex items-center gap-2 transition-all text-xs font-bold shadow-2xs"
        >
          <Icon name="calculator" className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          {showCalculator ? "Ocultar Calculadora" : "Abrir Calculadora"}
        </button>
      </div>

      {/* Métricas de Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#161b26] border border-emerald-200/80 dark:border-green-500/30 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-green-500/20 border border-emerald-200/60 dark:border-green-500/30 flex items-center justify-center text-emerald-600 dark:text-green-400">
              <Icon name="dollar-sign" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                RD$ {planStats.monthlyRevenue.toLocaleString()}
              </p>
              <p className="text-xs font-semibold text-emerald-600 dark:text-green-400 uppercase tracking-wider">Ingreso Mensual</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/20 border border-blue-200/60 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Icon name="building-2" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">{planStats.totalCondos}</p>
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Condos Gestionados</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/20 border border-purple-200/60 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Icon name="users" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">{planStats.active}</p>
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Empresas Activas</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-yellow-500/20 border border-amber-200/60 dark:border-yellow-500/30 flex items-center justify-center text-amber-600 dark:text-yellow-400">
              <Icon name="clock" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">{planStats.trial}</p>
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">En Periodo Prueba</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calculadora de Precios */}
      {showCalculator && (
        <div className="bg-white dark:bg-[#161b26] border border-purple-200 dark:border-purple-500/30 rounded-2xl p-6 shadow-2xs">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <Icon name="calculator" className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Calculadora de Precios de Licencia
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-3">
                ¿Cuántos condominios administra la empresa cliente?
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={condoSlider}
                onChange={(e) => setCondoSlider(parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
                <span>15</span>
                <span>20+</span>
              </div>
              <div className="text-center mt-4">
                <span className="text-4xl font-black text-neutral-900 dark:text-white">{condoSlider}</span>
                <span className="text-neutral-500 dark:text-neutral-400 ml-2 font-medium">condominios</span>
              </div>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-900/60 rounded-xl p-5 space-y-3 border border-neutral-200/80 dark:border-neutral-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-600 dark:text-neutral-400">Tarifa por condominio:</span>
                <span className="text-neutral-900 dark:text-white font-bold">
                  RD$ {pricing.perCondo.toLocaleString()}/mes
                </span>
              </div>
              <div className="flex justify-between items-center text-base">
                <span className="text-neutral-700 dark:text-neutral-300 font-bold">Total Mensual:</span>
                <span className="text-emerald-600 dark:text-green-400 font-black text-xl">
                  RD$ {pricing.total.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-neutral-200 dark:border-neutral-700/80 pt-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-600 dark:text-neutral-400">Total Anual estimado:</span>
                  <span className="text-neutral-900 dark:text-white font-bold">RD$ {annualTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs mt-1">
                  <span className="text-emerald-600 dark:text-green-400 font-semibold">Con 10% descuento anual:</span>
                  <span className="text-emerald-600 dark:text-green-400 font-bold">
                    RD$ {(annualTotal - annualDiscount).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="pt-2">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${pricing.tier.minCondos >= 10
                  ? "bg-emerald-50 dark:bg-green-500/20 text-emerald-700 dark:text-green-400"
                  : pricing.tier.minCondos >= 5
                    ? "bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400"
                    : pricing.tier.minCondos >= 2
                      ? "bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400"
                      : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  }`}>
                  Nivel Asignado: {pricing.tier.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Precios */}
      <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">Estructura de Precios por Volumen</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Tarifas escalonadas de cobro en República Dominicana
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-800/40 border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Nivel (Tier)
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Condos
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Precio/Condo (RD$)
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Equiv. USD
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Ahorro
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              <tr className="bg-amber-50/40 dark:bg-yellow-500/5 border-l-4 border-l-amber-500">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Icon name="gift" className="w-4 h-4 text-amber-600 dark:text-yellow-400" />
                    <span className="font-bold text-amber-700 dark:text-yellow-400 text-xs">Trial</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-neutral-600 dark:text-neutral-300">Ilimitado</td>
                <td className="px-6 py-4">
                  <span className="text-emerald-700 dark:text-green-400 font-black text-xs">GRATIS</span>
                </td>
                <td className="px-6 py-4 text-xs text-neutral-500 dark:text-neutral-400">$0</td>
                <td className="px-6 py-4">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-yellow-500/20 text-amber-800 dark:text-yellow-400 font-semibold">
                    {TRIAL_DAYS} días
                  </span>
                </td>
              </tr>
              {PRICING_TIERS.map((tier, index) => (
                <tr key={index} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Icon
                        name={index === 0 ? "building" : index === 3 ? "crown" : "building-2"}
                        className={`w-4 h-4 ${index === 3 ? "text-emerald-600 dark:text-green-400" :
                          index === 2 ? "text-blue-600 dark:text-blue-400" :
                            index === 1 ? "text-purple-600 dark:text-purple-400" : "text-neutral-400"
                          }`}
                      />
                      <span className="font-bold text-neutral-900 dark:text-white text-xs capitalize">
                        {index === 0 ? "Starter" : index === 1 ? "Growth" : index === 2 ? "Pro" : "Enterprise"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-neutral-700 dark:text-neutral-300 font-medium">{tier.label}</td>
                  <td className="px-6 py-4">
                    <span className="text-neutral-900 dark:text-white font-black text-xs">
                      RD$ {tier.pricePerCondo.toLocaleString()}
                    </span>
                    <span className="text-neutral-400 text-[11px] ml-1">/mes</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-neutral-500 dark:text-neutral-400">${tier.priceUSD}/mes</td>
                  <td className="px-6 py-4">
                    {index === 0 ? (
                      <span className="text-neutral-400 text-xs">—</span>
                    ) : (
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${index === 3 ? "bg-emerald-50 dark:bg-green-500/20 text-emerald-700 dark:text-green-400" :
                        index === 2 ? "bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400" :
                          "bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400"
                        }`}>
                        {index === 1 ? "-20%" : index === 2 ? "-33%" : "-47%"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Features Incluidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 shadow-2xs">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <Icon name="check-circle" className="w-5 h-5 text-emerald-600 dark:text-green-400" />
            Incluido en Todos los Planes
          </h3>
          <ul className="space-y-2.5">
            {[
              "Unidades ilimitadas por condominio",
              "Portal de residentes con autogestión de pagos y notificaciones",
              "Gestión de cuentas por pagar y proveedores dominicanos (EDESUR, CAASD)",
              "Reportes financieros y conciliación de cuentas bancarias",
              "Control de acceso y directorio de residentes",
              "Comunicaciones oficiales y circulares",
              "Gestión de incidentes con seguimiento de resolución",
              "Reserva de áreas sociales y amenidades",
              "Soporte local en República Dominicana",
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-2.5 text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                <Icon name="check" className="w-4 h-4 text-emerald-600 dark:text-green-400 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 shadow-2xs">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <Icon name="sparkles" className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Módulos Adicionales (Add-ons)
          </h3>
          <ul className="space-y-2.5">
            {[
              { name: "Notificaciones Automáticas por WhatsApp", price: "RD$ 500/mes" },
              { name: "Reportes Fiscales Avanzados para DGII (606/607)", price: "RD$ 300/mes" },
              { name: "Usuarios Administradores Adicionales", price: "RD$ 200/usuario" },
              { name: "Almacenamiento Extra para Comprobantes", price: "RD$ 100/10GB" },
              { name: "Acceso API para ERP Contable Externo", price: "RD$ 1,000/mes" },
              { name: "Personalización de Marca Blanca (White Label)", price: "Cotizar" },
            ].map((addon, i) => (
              <li key={i} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50/70 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60">
                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                  <Icon name="plus-circle" className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  {addon.name}
                </span>
                <span className="text-xs font-bold text-purple-700 dark:text-purple-400">{addon.price}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// =============================================
// COMPONENTE: MRR Chart (Tendencia de Ingresos)
// =============================================
declare const Chart: any;

type MRRChartProps = {
  payments: PaymentRecord[];
};

const MRRChart = ({ payments }: MRRChartProps) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const chartRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (!canvasRef.current || typeof Chart === 'undefined') return;

    // Calcular MRR de los últimos 6 meses
    const today = new Date();
    const months: { label: string; total: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = monthDate.toLocaleDateString('es-DO', { month: 'short' });
      const year = monthDate.getFullYear();

      // Filtrar pagos de ese mes
      const monthTotal = payments.reduce((sum, payment) => {
        const paymentDate = new Date(payment.paymentDate);
        if (paymentDate.getMonth() === monthDate.getMonth() &&
          paymentDate.getFullYear() === monthDate.getFullYear()) {
          return sum + payment.amount;
        }
        return sum;
      }, 0);

      months.push({ label: `${monthName} ${year}`, total: monthTotal });
    }

    // Destruir chart anterior si existe
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Crear el chart
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months.map(m => m.label),
        datasets: [{
          label: 'MRR',
          data: months.map(m => m.total),
          fill: true,
          backgroundColor: gradient,
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 3,
          tension: 0.4,
          pointBackgroundColor: 'rgb(16, 185, 129)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(23, 23, 23, 0.9)',
            titleColor: '#fff',
            bodyColor: '#10b981',
            borderColor: 'rgba(16, 185, 129, 0.3)',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (context: any) => `RD$ ${context.raw.toLocaleString()}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#888' }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#888',
              callback: (value: number) => `$${(value / 1000).toFixed(0)}k`
            },
            beginAtZero: true
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [payments]);

  return (
    <canvas ref={canvasRef} className="w-full h-full" />
  );
};

// =============================================
// COMPONENTE: Plan Distribution Chart (Pie Chart)
// =============================================
type PlanDistributionChartProps = {
  companies: Company[];
};

const PlanDistributionChart = ({ companies }: PlanDistributionChartProps) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const chartRef = React.useRef<any>(null);

  // Calcular distribución por plan
  const planData = React.useMemo(() => {
    const counts: Record<string, number> = {
      'Trial': 0,
      'Starter': 0,
      'Growth': 0,
      'Pro': 0,
      'Enterprise': 0,
    };

    companies.forEach(company => {
      const plan = company.plan || 'Trial';
      if (counts[plan] !== undefined) {
        counts[plan]++;
      } else {
        counts['Trial']++;
      }
    });

    return counts;
  }, [companies]);

  React.useEffect(() => {
    if (!canvasRef.current || typeof Chart === 'undefined') return;

    // Destruir chart anterior si existe
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const labels = Object.keys(planData);
    const data = Object.values(planData);

    const colors = {
      'Trial': { bg: 'rgba(156, 163, 175, 0.8)', border: 'rgb(156, 163, 175)' }, // Gray
      'Starter': { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgb(59, 130, 246)' }, // Blue
      'Growth': { bg: 'rgba(16, 185, 129, 0.8)', border: 'rgb(16, 185, 129)' }, // Green
      'Pro': { bg: 'rgba(139, 92, 246, 0.8)', border: 'rgb(139, 92, 246)' }, // Purple
      'Enterprise': { bg: 'rgba(245, 158, 11, 0.8)', border: 'rgb(245, 158, 11)' }, // Amber
    };

    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: labels.map(l => colors[l as keyof typeof colors]?.bg || 'rgba(100, 100, 100, 0.8)'),
          borderColor: labels.map(l => colors[l as keyof typeof colors]?.border || 'rgb(100, 100, 100)'),
          borderWidth: 2,
          hoverOffset: 10,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: {
              color: '#ffffff',
              padding: 15,
              font: { size: 12, weight: 500 },
              generateLabels: (chart: any) => {
                const datasets = chart.data.datasets;
                return chart.data.labels.map((label: string, i: number) => ({
                  text: `${label} (${datasets[0].data[i]})`,
                  fillStyle: datasets[0].backgroundColor[i],
                  strokeStyle: datasets[0].borderColor[i],
                  fontColor: '#ffffff',
                  lineWidth: 2,
                  hidden: false,
                  index: i,
                }));
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(23, 23, 23, 0.9)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (context: any) => {
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
                return `${context.label}: ${context.raw} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [planData]);

  // Si no hay compañías, mostrar mensaje
  if (companies.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500">
        <p>No hay datos para mostrar</p>
      </div>
    );
  }

  return (
    <canvas ref={canvasRef} className="w-full h-full" />
  );
};

// =============================================
// COMPONENTE: Top Clients by Revenue
// =============================================
type TopClientsProps = {
  companies: Company[];
};

const TopClients = ({ companies }: TopClientsProps) => {
  const topClients = React.useMemo(() => {
    return [...companies]
      .filter(c => c.status === 'Activo')
      .sort((a, b) => (b.monthlyFee || 0) - (a.monthlyFee || 0))
      .slice(0, 5);
  }, [companies]);

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0: return 'text-yellow-400'; // Gold
      case 1: return 'text-neutral-300'; // Silver
      case 2: return 'text-amber-600'; // Bronze
      default: return 'text-neutral-600';
    }
  };

  if (topClients.length === 0) {
    return (
      <div className="text-center text-neutral-500 py-4">
        No hay clientes activos
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {topClients.map((client, index) => (
        <div
          key={client.id}
          className="flex items-center gap-3 p-3 bg-neutral-800/30 rounded-lg hover:bg-neutral-800/50 transition-colors"
        >
          <div className={`text-xl font-bold ${getMedalColor(index)} w-6 text-center`}>
            {index < 3 ? '🏆' : `#${index + 1}`}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">{client.name}</p>
            <p className="text-xs text-neutral-500">{client.plan || 'Trial'} · {client.condoCount || 1} condo{(client.condoCount || 1) > 1 ? 's' : ''}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-emerald-400">
              RD$ {(client.monthlyFee || 0).toLocaleString()}
            </p>
            <p className="text-xs text-neutral-500">/mes</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export const SuperAdminDashboard = () => {
  const { logout, isDevAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Tab activo con dashboard como default
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "companies"
    | "billing"
    | "communications"
    | "messages"
    | "roadmap"
    | "settings"
    | "plans"
    | "elisa"
  >("dashboard");
  const [showRoadmap, setShowRoadmap] = useState(false);

  // Estado para filtro de compañías
  const [companyFilter, setCompanyFilter] = useState<
    "all" | "active" | "grace" | "inactive"
  >("all");

  // NUEVO: Estado para búsqueda de compañías
  const [searchQuery, setSearchQuery] = useState("");

  // NUEVO: Estado para el modal de Ver Clientes
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);

  // Estados para Billing Portal
  const [allPayments, setAllPayments] = useState<PaymentRecord[]>([]);
  const [selectedCompanyBilling, setSelectedCompanyBilling] = useState<Company | null>(null);
  const [isBillingDetailOpen, setIsBillingDetailOpen] = useState(false);

  // Estados para Activity Feed
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);

  // DEV MODE check
  const isDevMode = window.location.hostname === "localhost";

  const fetchCompanies = async () => {
    // En modo desarrollo, usar datos mock con Wise Services Dominicana SRL conectado a los condominios locales
    if (isDevMode && isDevAuthenticated) {
      let liveCondosCount = 2;
      try {
        const stored = localStorage.getItem('micondo_live_condos_v2');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) liveCondosCount = parsed.length;
        }
      } catch (e) {
        // fallback
      }

      setCompanies([
        {
          id: "dev-company-id",
          name: "Wise Services Dominicana SRL",
          rnc: "430314706",
          address: "Av. Abraham Lincoln #1003, Piantini, Santo Domingo",
          phone: "829-455-4783",
          email: "info@wiseservicesrd.com",
          logoUrl: undefined,
          status: "Activo",
          adminUserEmail: "admin@micondo.com",
          billingStartDate: "2025-01-01",
          gracePeriodDays: 7,
          plan: "Pro",
          condoCount: liveCondosCount,
          monthlyFee: liveCondosCount * 1000,
        },
        {
          id: "dev-company-2",
          name: "CondoAdmin Premier SRL",
          rnc: "131849204",
          address: "Av. Winston Churchill #45, Bella Vista",
          phone: "809-555-0002",
          email: "contacto@condoadminrd.com",
          logoUrl: undefined,
          status: "Activo",
          adminUserEmail: "admin@demo2.com",
          billingStartDate: "2025-01-15",
          gracePeriodDays: 14,
          plan: "Enterprise",
          condoCount: 5,
          monthlyFee: 4000,
        },
      ]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: rawCompanies, error } = await supabase
        .from('companies')
        .select('*');
      if (error) throw error;
      const companyList: Company[] = (rawCompanies || []).map((data: any) => ({
        id: data.id,
        name: data.name || "Sin Nombre",
        rnc: data.rnc || "N/A",
        address: data.address || "Sin Dirección",
        phone: data.phone || "N/A",
        email: data.email || "N/A",
        logoUrl: data.logo_url || null,
        status: data.status || "Inactivo",
        adminUserEmail: data.admin_user_email || "N/A",
        billingStartDate: data.billing_start_date || "N/A",
        gracePeriodDays: data.grace_period_days || 0,
        plan: data.plan || "Pro",
      }));
      setCompanies(companyList);
    } catch (error) {
      console.error("Error fetching companies:", error);
      addToast("Error al cargar la lista de compañías.", "error");
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Fetch de todos los pagos para calcular estados
  const fetchAllPayments = async () => {
    if (isDevMode && isDevAuthenticated) {
      // Mock payments para dev mode
      const mockPayments: PaymentRecord[] = [
        {
          id: "pay-1",
          companyId: "dev-company-1",
          companyName: "Empresa Demo 1",
          amount: 1500,
          paymentDate: "2025-12-01",
          periodStart: "2025-12-01",
          periodEnd: "2025-12-31",
          method: "Transferencia",
          reference: "REF-001",
          createdAt: new Date().toISOString(),
        },
      ];
      setAllPayments(mockPayments);
      return;
    }

    try {
      const { data: paymentList, error } = await supabase
        .from('saas_payments')
        .select('*');
      if (error) throw error;

      const mappedPayments = (paymentList || []).map((p: any) => ({
        ...p,
        companyId: p.company_id,
        companyName: p.company_name,
        paymentDate: p.payment_date,
        periodStart: p.period_start,
        periodEnd: p.period_end,
        createdAt: p.created_at
      }));

      setAllPayments(mappedPayments);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  // Calcular compañías que necesitan atención
  const companiesNeedingAttention = useMemo(() => {
    return companies
      .map((company) => {
        const lastPayment = getLastPayment(allPayments, company.id);
        const isTrial = company.plan === "Trial" || !company.plan;
        const billing = calculateBillingStatus(
          company.billingStartDate,
          company.gracePeriodDays,
          lastPayment,
          isTrial
        );
        return { companyId: company.id, billing };
      })
      .filter(
        (item) =>
          item.billing.status === "grace" ||
          item.billing.status === "inactive" ||
          (item.billing.status === "trial" && item.billing.daysUntilDue <= 3) ||
          (item.billing.status === "active" && item.billing.daysUntilDue <= 5)
      )
      .sort((a, b) => {
        const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3, none: 4 };
        return urgencyOrder[a.billing.urgency] - urgencyOrder[b.billing.urgency];
      });
  }, [companies, allPayments]);

  const toggleCompanyStatus = async (company: Company) => {
    if (isUpdating) return;
    setIsUpdating(true);

    const newStatus = company.status === "Activo" ? "Inactivo" : "Activo";
    try {
      const { error } = await supabase.from('companies').update({ status: newStatus }).eq('id', company.id);
      if (error) throw error;
      setCompanies((prevCompanies) =>
        prevCompanies.map((c) =>
          c.id === company.id ? { ...c, status: newStatus } : c
        )
      );
      addToast(
        `Compañía "${company.name}" actualizada a: ${newStatus}`,
        "success"
      );
    } catch (error) {
      console.error("Error toggling company status:", error);
      addToast("Error al actualizar el estado de la compañía.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCompany(null);
    setIsFormVisible(true);
  };

  const handleOpenEdit = (company: Company) => {
    setEditingCompany(company);
    setIsFormVisible(true);
  };

  const handleFormSaved = () => {
    fetchCompanies();
    fetchActivityEvents(); // Refrescar eventos después de guardar
  };

  // =============================================
  // CÁLCULO DE MÉTRICAS SaaS
  // =============================================
  const metrics = React.useMemo(() => {
    const activeCompanies = companies.filter((c) => c.status === "Activo");
    const inGrace = companies.filter((c) => c.status === "Gracia");
    const inactive = companies.filter((c) => c.status === "Inactivo");

    // MRR estimado (asumiendo plan Pro = $99/mes por defecto)
    const planPrices: Record<string, number> = {
      Basic: 49,
      Pro: 99,
      Enterprise: 199,
    };
    const mrr = activeCompanies.reduce((acc, c) => {
      const price = c.monthlyFee || planPrices[c.plan] || 99;
      return acc + price;
    }, 0);

    // Próximos vencimientos (dentro de 7 días)
    const today = new Date();
    const sevenDaysFromNow = new Date(
      today.getTime() + 7 * 24 * 60 * 60 * 1000
    );
    const upcomingRenewals = activeCompanies.filter((c) => {
      if (!c.billingStartDate) return false;
      const billingDate = new Date(c.billingStartDate);
      // Calcular próxima fecha de facturación (asumiendo mensual)
      const nextBilling = new Date(billingDate);
      while (nextBilling < today) {
        nextBilling.setMonth(nextBilling.getMonth() + 1);
      }
      return nextBilling <= sevenDaysFromNow;
    });

    return {
      total: companies.length,
      active: activeCompanies.length,
      inGrace: inGrace.length,
      inactive: inactive.length,
      mrr,
      upcomingRenewals: upcomingRenewals.length,
    };
  }, [companies]);

  // Fetch activity events
  const fetchActivityEvents = async () => {
    if (isDevMode && isDevAuthenticated) {
      // Mock events para dev mode
      const mockEvents: ActivityEvent[] = [
        {
          id: "evt-1",
          type: "company_created",
          companyId: "dev-company-1",
          companyName: "Empresa Demo 1",
          description: "Nueva compañía registrada (Plan: Pro)",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas
        },
        {
          id: "evt-2",
          type: "addon_added",
          companyId: "dev-company-2",
          companyName: "Empresa Demo 2",
          description: 'Activó addon "SMS/WhatsApp"',
          details: { addonName: "SMS/WhatsApp" },
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 horas
        },
        {
          id: "evt-3",
          type: "plan_changed",
          companyId: "dev-company-1",
          companyName: "Empresa Demo 1",
          description: "Cambió de plan Growth → Pro",
          details: { oldValue: "Growth", newValue: "Pro" },
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 día
        },
      ];
      setActivityEvents(mockEvents);
      return;
    }

    try {
      const { data: eventList, error } = await supabase
        .from('activity_events')
        .select('*');
      if (error) throw error;
      // Ordenar por fecha más reciente
      eventList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setActivityEvents(eventList.slice(0, 20)); // Solo últimos 20
    } catch (error) {
      console.error("Error fetching activity events:", error);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchAllPayments();
    fetchActivityEvents();
  }, []);

  // Filtrar compañías según el filtro y búsqueda
  const filteredCompanies = React.useMemo(() => {
    let result = companies;

    // Aplicar filtro de estado
    switch (companyFilter) {
      case "active":
        result = result.filter((c) => c.status === "Activo");
        break;
      case "grace":
        result = result.filter((c) => c.status === "Gracia");
        break;
      case "inactive":
        result = result.filter((c) => c.status === "Inactivo");
        break;
    }

    // Aplicar búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((c) =>
        c.name.toLowerCase().includes(query) ||
        c.rnc.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.adminUserEmail?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [companies, companyFilter, searchQuery]);

  // Función para exportar a CSV
  const exportToCSV = () => {
    const headers = ["Nombre", "RNC", "Email", "Plan", "Estado", "Condos", "Fee Mensual", "Fecha Inicio"];
    const rows = filteredCompanies.map(c => [
      c.name,
      c.rnc,
      c.email || "",
      c.plan || "Trial",
      c.status,
      c.condoCount || 0,
      c.monthlyFee || 0,
      c.billingStartDate || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `mi-condo-companies-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    addToast("Archivo CSV exportado exitosamente", "success");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        Cargando datos...
      </div>
    );
  }

  // Calcular métricas para el sidebar
  const sidebarMetrics = {
    inGrace: metrics.inGrace,
    unreadMessages: 0, // TODO: conectar con mensajes reales
    pendingPayments: metrics.upcomingRenewals,
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-[#0b0f17] text-neutral-800 dark:text-neutral-100 transition-colors">
      {/* Sidebar */}
      <SuperAdminSidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
        onShowRoadmap={() => setActiveTab("roadmap")}
        onLogout={logout}
        metrics={sidebarMetrics}
        isOpenOnMobile={false}
        onCloseMobile={() => {}}
      />

      {/* Main Content Area */}
      <main className="ml-64 p-8 min-h-screen">
        {/* Page Header */}
        <header className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-neutral-900 dark:text-white mb-1">
                {activeTab === "dashboard" && "Dashboard"}
                {activeTab === "companies" && "Compañías"}
                {activeTab === "billing" && "Facturación"}
                {activeTab === "communications" && "Comunicaciones"}
                {activeTab === "messages" && "Mensajes"}
                {activeTab === "roadmap" && "Development Roadmap"}
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {activeTab === "dashboard" &&
                  "Vista general de tu plataforma SaaS"}
                {activeTab === "companies" &&
                  "Gestiona las compañías administradoras"}
                {activeTab === "billing" &&
                  "Pagos y facturación de suscripciones"}
                {activeTab === "communications" &&
                  "Anuncios para todos los clientes"}
                {activeTab === "messages" && "Mensajería directa con clientes"}
                {activeTab === "roadmap" &&
                  "Progreso y planificación del desarrollo"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {activeTab === "companies" && (
                <button
                  onClick={handleOpenCreate}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-sm text-xs"
                >
                  <Icon name="plus" size={16} />
                  Nueva Compañía
                </button>
              )}
            </div>
          </div>
        </header>

        {/* =============================================
                  CONTENIDO SEGÚN TAB ACTIVO
            ============================================= */}

        {/* Dashboard Tab - Métricas principales */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Métricas destacadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* MRR Card - Grande */}
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-600/20 dark:to-teal-600/10 border border-emerald-500/30 rounded-2xl p-6 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Icon
                      name="dollar-sign"
                      className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 font-bold border border-emerald-300 dark:border-emerald-500/30">
                    +12% vs mes anterior
                  </span>
                </div>
                <p className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  Ingresos Recurrentes (MRR)
                </p>
                <p className="text-4xl font-black text-neutral-900 dark:text-white">
                  RD$ {metrics.mrr.toLocaleString()}
                </p>
                <div className="mt-4 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    style={{ width: "75%" }}
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  75% del objetivo mensual (RD$ 250,000)
                </p>
              </div>

              {/* Clientes Activos Card - Grande */}
              <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 dark:from-blue-600/20 dark:to-indigo-600/10 border border-blue-500/30 rounded-2xl p-6 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Icon name="building-2" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400 font-bold border border-blue-300 dark:border-blue-500/30">
                    {metrics.total} registradas
                  </span>
                </div>
                <p className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  Compañías Administradoras Activas
                </p>
                <p className="text-4xl font-black text-neutral-900 dark:text-white">
                  {metrics.active}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="text-center p-2.5 bg-white/80 dark:bg-neutral-800/50 rounded-xl border border-neutral-200/60 dark:border-neutral-700/50 shadow-2xs">
                    <p className="text-lg font-black text-emerald-600 dark:text-green-400">
                      {metrics.active}
                    </p>
                    <p className="text-[11px] font-medium text-neutral-500">Activas</p>
                  </div>
                  <div className="text-center p-2.5 bg-white/80 dark:bg-neutral-800/50 rounded-xl border border-neutral-200/60 dark:border-neutral-700/50 shadow-2xs">
                    <p className="text-lg font-black text-amber-600 dark:text-yellow-400">
                      {metrics.inGrace}
                    </p>
                    <p className="text-[11px] font-medium text-neutral-500">En Gracia</p>
                  </div>
                  <div className="text-center p-2.5 bg-white/80 dark:bg-neutral-800/50 rounded-xl border border-neutral-200/60 dark:border-neutral-700/50 shadow-2xs">
                    <p className="text-lg font-black text-rose-600 dark:text-red-400">
                      {metrics.inactive}
                    </p>
                    <p className="text-[11px] font-medium text-neutral-500">Inactivas</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Métricas secundarias */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-4 shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                    <Icon name="calendar" className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-neutral-900 dark:text-white">
                      {metrics.upcomingRenewals}
                    </p>
                    <p className="text-xs text-neutral-500">Vencen Pronto</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-4 shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Icon
                      name="message-circle"
                      className="w-5 h-5"
                    />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-neutral-900 dark:text-white">0</p>
                    <p className="text-xs text-neutral-500">Mensajes Nuevos</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-4 shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/15 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                    <Icon name="megaphone" className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-neutral-900 dark:text-white">1</p>
                    <p className="text-xs text-neutral-500">Anuncios Activos</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-4 shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <Icon
                      name="credit-card"
                      className="w-5 h-5"
                    />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-neutral-900 dark:text-white">{allPayments.length}</p>
                    <p className="text-xs text-neutral-500">Pagos Registrados</p>
                  </div>
                </div>
              </div>
            </div>

            {/* MRR Trend Chart - Últimos 6 meses */}
            <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Icon name="trending-up" className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Tendencia de Ingresos SaaS (MRR)
                </h3>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 font-bold border border-emerald-300 dark:border-emerald-500/30">
                  RD$ {metrics.mrr.toLocaleString()}/mes actual
                </span>
              </div>
              <div className="h-64">
                <MRRChart payments={allPayments} />
              </div>
            </div>

            {/* Charts Row: Plan Distribution + Top Clients */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Plan Distribution Pie Chart */}
              <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Icon name="pie-chart" className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    Distribución por Plan
                  </h3>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-400 font-bold border border-purple-300 dark:border-purple-500/30">
                    {companies.length} clientes
                  </span>
                </div>
                <div className="h-64">
                  <PlanDistributionChart companies={companies} />
                </div>
              </div>

              {/* Top Clients by Revenue */}
              <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Icon name="trophy" className="w-5 h-5 text-amber-500" />
                    Top Clientes SaaS
                  </h3>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 font-bold border border-amber-300 dark:border-amber-500/30">
                    Por facturación mensual
                  </span>
                </div>
                <TopClients companies={companies} />
              </div>
            </div>

            {/* Panel de Alertas - Grace Period */}
            {companiesNeedingAttention.length > 0 && (
              <div className="bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-6 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-rose-900 dark:text-rose-200 flex items-center gap-2">
                    <Icon name="alert-triangle" className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    Requieren Atención ({companiesNeedingAttention.length})
                  </h3>
                  <button
                    onClick={() => setActiveTab("billing")}
                    className="text-xs font-bold text-rose-700 dark:text-rose-400 hover:text-rose-800 flex items-center gap-1"
                  >
                    Ver Facturación
                    <Icon name="arrow-right" className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {companiesNeedingAttention.slice(0, 5).map((item) => {
                    const company = companies.find((c) => c.id === item.companyId);
                    if (!company) return null;
                    return (
                      <div
                        key={item.companyId}
                        className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-neutral-800/80 border border-rose-200/80 dark:border-rose-900/50 shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${item.billing.urgency === "critical"
                              ? "bg-red-500 animate-pulse"
                              : item.billing.urgency === "high"
                                ? "bg-orange-500"
                                : "bg-yellow-500"
                              }`}
                          />
                          <div>
                            <p className="text-xs font-bold text-neutral-900 dark:text-white">
                              {company.name}
                            </p>
                            <p className="text-[11px] text-neutral-500">
                              {item.billing.statusLabel}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedCompanyBilling(company);
                            setIsBillingDetailOpen(true);
                          }}
                          className="px-3 py-1.5 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-800 dark:text-white rounded-xl transition-colors"
                        >
                          Ver Detalle
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 shadow-2xs">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4">
                Acciones Rápidas
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => setActiveTab("companies")}
                  className="flex items-center gap-3 p-3 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800/40 dark:hover:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/50 rounded-xl transition-all group text-left"
                >
                  <Icon name="building-2" className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white">
                    Ver Compañías
                  </span>
                </button>
                <button
                  onClick={handleOpenCreate}
                  className="flex items-center gap-3 p-3 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800/40 dark:hover:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/50 rounded-xl transition-all group text-left"
                >
                  <Icon name="plus" className="w-5 h-5 text-emerald-600 dark:text-green-400" />
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white">
                    Nueva Compañía
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("billing")}
                  className="flex items-center gap-3 p-3 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800/40 dark:hover:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/50 rounded-xl transition-all group text-left"
                >
                  <Icon
                    name="credit-card"
                    className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                  />
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white">
                    Registrar Pago
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("communications")}
                  className="flex items-center gap-3 p-3 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800/40 dark:hover:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/50 rounded-xl transition-all group text-left"
                >
                  <Icon name="megaphone" className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white">
                    Nuevo Anuncio
                  </span>
                </button>
              </div>
            </div>

            {/* Panel de Actividad Reciente */}
            <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Icon name="activity" className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Actividad Reciente
                </h3>
                <button
                  onClick={fetchActivityEvents}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
                >
                  <Icon name="refresh-cw" className="w-3.5 h-3.5" />
                  Actualizar
                </button>
              </div>

              {activityEvents.length === 0 ? (
                <p className="text-neutral-400 text-xs text-center py-6">
                  No hay actividad reciente registrada.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto">
                  {activityEvents.map((event) => {
                    const eventDate = new Date(event.createdAt);
                    const now = new Date();
                    const diffMs = now.getTime() - eventDate.getTime();
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMs / 3600000);
                    const diffDays = Math.floor(diffMs / 86400000);

                    let timeAgo = "";
                    if (diffMins < 60) timeAgo = `Hace ${diffMins} min`;
                    else if (diffHours < 24) timeAgo = `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
                    else timeAgo = `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;

                    const eventConfig: Record<string, { icon: string; color: string; bg: string }> = {
                      company_created: { icon: "building-2", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-500/20" },
                      company_updated: { icon: "edit", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/20" },
                      plan_changed: { icon: "arrow-up-circle", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/20" },
                      addon_added: { icon: "plus-circle", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/20" },
                      addon_removed: { icon: "minus-circle", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-500/20" },
                      payment_received: { icon: "dollar-sign", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-500/20" },
                      status_changed: { icon: "toggle-right", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-500/20" },
                    };
                    const config = eventConfig[event.type] || { icon: "activity", color: "text-neutral-500", bg: "bg-neutral-100 dark:bg-neutral-800" };

                    return (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-700/40 rounded-xl"
                      >
                        <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon name={config.icon} className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                            {event.companyName}
                          </p>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            {event.description}
                          </p>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-mono whitespace-nowrap">
                          {timeAgo}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === "billing" && <BillingTab companies={companies} />}
        {activeTab === "communications" && (
          <CommunicationsTab companies={companies} />
        )}
        {activeTab === "messages" && <MessagesTab companies={companies} />}
        {activeTab === "roadmap" && <DevRoadmap embedded={true} />}
        {activeTab === "elisa" && <ElisaAIContent mode="global" />}
        {activeTab === "settings" && <SettingsTab />}
        {activeTab === "plans" && <PlansTab companies={companies} />}
        {activeTab === "companies" && (
          <div className="space-y-6">
            {/* Barra de herramientas - Búsqueda, Filtros, Exportar */}
            <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-4 shadow-2xs">
              <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                {/* Barra de búsqueda */}
                <div className="relative flex-1 max-w-md">
                  <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, RNC o email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
                    >
                      <Icon name="x" className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filtros de estado */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCompanyFilter("all")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${companyFilter === "all"
                      ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs"
                      : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                      }`}
                  >
                    Todos ({companies.length})
                  </button>
                  <button
                    onClick={() => setCompanyFilter("active")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${companyFilter === "active"
                      ? "bg-green-600 text-white"
                      : "bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400 border border-green-200/60 dark:border-green-500/30 hover:bg-green-100"
                      }`}
                  >
                    Activos ({companies.filter((c) => c.status === "Activo").length})
                  </button>
                  <button
                    onClick={() => setCompanyFilter("grace")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${companyFilter === "grace"
                      ? "bg-amber-600 text-white"
                      : "bg-amber-50 dark:bg-yellow-500/15 text-amber-700 dark:text-yellow-400 border border-amber-200/60 dark:border-yellow-500/30 hover:bg-amber-100"
                      }`}
                  >
                    En Gracia ({companies.filter((c) => c.status === "Gracia").length})
                  </button>
                  <button
                    onClick={() => setCompanyFilter("inactive")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${companyFilter === "inactive"
                      ? "bg-rose-600 text-white"
                      : "bg-rose-50 dark:bg-red-500/15 text-rose-700 dark:text-red-400 border border-rose-200/60 dark:border-red-500/30 hover:bg-rose-100"
                      }`}
                  >
                    Inactivos ({companies.filter((c) => c.status === "Inactivo").length})
                  </button>
                </div>

                {/* Botón Exportar */}
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  <Icon name="download" className="w-3.5 h-3.5" />
                  Exportar CSV
                </button>
              </div>

              {/* Resultados de búsqueda */}
              {searchQuery && (
                <div className="mt-3 text-xs text-neutral-500">
                  Mostrando {filteredCompanies.length} resultado{filteredCompanies.length !== 1 ? 's' : ''} para "{searchQuery}"
                </div>
              )}
            </div>

            {/* Empty State */}
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-2xs">
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4 text-neutral-400">
                  <Icon
                    name="building-2"
                    className="w-8 h-8"
                  />
                </div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1">
                  {companies.length === 0
                    ? "No hay compañías registradas"
                    : "No hay compañías con este filtro"}
                </h3>
                <p className="text-neutral-500 text-xs mb-6">
                  {companies.length === 0
                    ? "Comience agregando su primera compañía administradora"
                    : "Pruebe cambiando el filtro o agregando más compañías"}
                </p>
                {companies.length === 0 && (
                  <button
                    onClick={handleOpenCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-xs text-xs"
                  >
                    <Icon name="plus" className="w-4 h-4 inline mr-1.5" />
                    Añadir Primera Compañía
                  </button>
                )}
              </div>
            ) : (
              /* Grid de Cards de Compañías */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredCompanies.map((company) => (
                  <div
                    key={company.id}
                    className={`bg-white dark:bg-[#161b26] border rounded-2xl p-5 transition-all duration-200 hover:shadow-md group shadow-2xs ${company.status === "Activo"
                      ? "border-neutral-200/80 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-500/40"
                      : company.status === "Gracia"
                        ? "border-amber-300 dark:border-yellow-500/30"
                        : "border-rose-300 dark:border-red-500/30 opacity-75"
                      }`}
                  >
                    {/* Header de la Card */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3.5">
                        {/* Logo */}
                        {company.logoUrl ? (
                          <img
                            src={company.logoUrl}
                            alt={`${company.name} Logo`}
                            className="w-12 h-12 object-contain rounded-xl bg-white border border-neutral-200 p-1.5"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60">
                            <Icon
                              name="building-2"
                              className="w-6 h-6 text-blue-600 dark:text-blue-400"
                            />
                          </div>
                        )}
                        {/* Nombre y RNC */}
                        <div>
                          <h3 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {company.name}
                          </h3>
                          <p className="text-xs text-neutral-500 font-mono">
                            RNC: {company.rnc}
                          </p>
                        </div>
                      </div>
                      {/* Badge de Estado */}
                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-full ${company.status === "Activo"
                          ? "bg-emerald-50 dark:bg-green-500/20 text-emerald-700 dark:text-green-400 border border-emerald-200 dark:border-green-500/30"
                          : company.status === "Gracia"
                            ? "bg-amber-50 dark:bg-yellow-500/20 text-amber-700 dark:text-yellow-400 border border-amber-200 dark:border-yellow-500/30"
                            : "bg-rose-50 dark:bg-red-500/20 text-rose-700 dark:text-red-400 border border-rose-200 dark:border-red-500/30"
                          }`}
                      >
                        {company.status === "Activo" && "● "}
                        {company.status}
                      </span>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-2.5 mb-4">
                      <div className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-700/40 rounded-xl p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon
                            name="mail"
                            className="w-3.5 h-3.5 text-neutral-400"
                          />
                          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                            Admin Login
                          </span>
                        </div>
                        <p className="text-xs text-neutral-800 dark:text-neutral-200 font-medium truncate">
                          {company.adminUserEmail}
                        </p>
                      </div>
                      <div className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-700/40 rounded-xl p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon
                            name="phone"
                            className="w-3.5 h-3.5 text-neutral-400"
                          />
                          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                            Teléfono
                          </span>
                        </div>
                        <p className="text-xs text-neutral-800 dark:text-neutral-200 font-medium">{company.phone}</p>
                      </div>
                      <div className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-700/40 rounded-xl p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon
                            name="calendar"
                            className="w-3.5 h-3.5 text-neutral-400"
                          />
                          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                            Facturación
                          </span>
                        </div>
                        <p className="text-xs text-neutral-800 dark:text-neutral-200 font-medium font-mono">
                          {company.billingStartDate}
                        </p>
                      </div>
                      <div className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-700/40 rounded-xl p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon
                            name="clock"
                            className="w-3.5 h-3.5 text-neutral-400"
                          />
                          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                            Gracia
                          </span>
                        </div>
                        <p className="text-xs text-neutral-800 dark:text-neutral-200 font-medium">
                          {company.gracePeriodDays} días
                        </p>
                      </div>
                    </div>

                    {/* Plan Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg ${company.plan === "Enterprise"
                          ? "bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30"
                          : company.plan === "Pro"
                            ? "bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30"
                            : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                          }`}
                      >
                        Plan {company.plan || "Pro"} · {company.condoCount || 1} Condominios
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        RD$ {(company.monthlyFee || ((company.condoCount || 1) * 1000)).toLocaleString()}/mes
                      </span>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                      <button
                        onClick={() => handleOpenEdit(company)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white text-xs font-bold transition-colors"
                      >
                        <Icon name="edit" className="w-3.5 h-3.5" />
                        Editar
                      </button>
                      <button
                        onClick={() => setViewingCompany(company)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 text-xs font-bold transition-colors border border-blue-200/60 dark:border-blue-800/60"
                      >
                        <Icon name="building-2" className="w-3.5 h-3.5" />
                        Ver Condos ({company.condoCount || 1})
                      </button>
                      <button
                        onClick={() => toggleCompanyStatus(company)}
                        disabled={isUpdating}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors ${company.status === "Activo"
                          ? "bg-rose-50 hover:bg-rose-100 dark:bg-red-500/20 dark:hover:bg-red-500/30 text-rose-700 dark:text-red-400 border border-rose-200/60 dark:border-red-500/30"
                          : "bg-emerald-50 hover:bg-emerald-100 dark:bg-green-500/20 dark:hover:bg-green-500/30 text-emerald-700 dark:text-green-400 border border-emerald-200/60 dark:border-green-500/30"
                          }`}
                      >
                        {isUpdating
                          ? "..."
                          : company.status === "Activo"
                            ? "Desactivar"
                            : "Activar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <CompanyForm
          isOpen={isFormVisible}
          onClose={() => setIsFormVisible(false)}
          onCompanySaved={handleFormSaved}
          defaultValues={editingCompany}
        />

        <ViewClientsModal
          isOpen={viewingCompany !== null}
          onClose={() => setViewingCompany(null)}
          company={viewingCompany}
        />

        <BillingDetailModal
          isOpen={isBillingDetailOpen}
          onClose={() => {
            setIsBillingDetailOpen(false);
            setSelectedCompanyBilling(null);
          }}
          company={selectedCompanyBilling}
          payments={allPayments}
          onPaymentRegistered={() => {
            fetchAllPayments();
          }}
        />
      </main>
    </div>
  );
};
