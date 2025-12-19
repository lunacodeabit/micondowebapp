import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import type { Company, Condo, PlanType, AddonConfig, ActivityEvent, ActivityEventType } from "../../types";
import { PLAN_PRICING, AVAILABLE_ADDONS } from "../../types";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { SuperAdminSidebar } from "./layout/SuperAdminSidebar";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebaseConfig";
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
        const storageRef = ref(
          storage,
          `company_logos/${formData.rnc}-${logoFile.name}`
        );
        const snapshot = await uploadBytes(storageRef, logoFile);
        logoUrl = await getDownloadURL(snapshot.ref);
      }

      const companyData = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        rnc: formData.rnc,
        logoUrl: logoUrl,
        adminUserEmail: formData.adminUserEmail,
        billingStartDate: formData.billingStartDate,
        gracePeriodDays: formData.gracePeriodDays,
        status: defaultValues?.status || "Activo",
        // Plan y Addons
        plan: formData.plan,
        addons: formData.addons,
        monthlyFee: monthlyFee,
        condoCount: condoCount,
      };

      // Helper para crear eventos de actividad
      const createActivityEvent = async (
        type: ActivityEventType,
        companyId: string,
        companyName: string,
        description: string,
        details?: ActivityEvent["details"]
      ) => {
        await addDoc(collection(db, "activity_events"), {
          type,
          companyId,
          companyName,
          description,
          details,
          createdAt: new Date().toISOString(),
        });
      };

      if (defaultValues && defaultValues.id) {
        const companyRef = doc(db, "companies", defaultValues.id);
        await updateDoc(companyRef, companyData);

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
        const docRef = await addDoc(collection(db, "companies"), companyData);

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
        <h3 className="md:col-span-2 text-lg font-semibold text-white border-b border-neutral-700 pb-2 mb-2">
          Información de la Compañía
        </h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-400">
            Nombre de la Compañía
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-neutral-700 bg-neutral-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-400">
            RNC
          </label>
          <input
            type="text"
            name="rnc"
            value={formData.rnc}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-neutral-700 bg-neutral-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-400">
            Email de Facturación
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-neutral-700 bg-neutral-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-400">
            Teléfono
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-neutral-700 bg-neutral-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="md:col-span-2 mb-4">
          <label className="block text-sm font-medium text-neutral-400">
            Dirección
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-neutral-700 bg-neutral-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="md:col-span-2 mb-6">
          <label className="block text-sm font-medium text-neutral-400">
            Logo de la Compañía (Opcional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-neutral-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
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

        <h3 className="md:col-span-2 text-lg font-semibold text-white border-b border-neutral-700 pb-2 mb-2">
          Administrador Principal de la Compañía
        </h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-400">
            Email del Admin (Login)
          </label>
          <input
            type="email"
            name="adminUserEmail"
            value={formData.adminUserEmail}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-neutral-700 bg-neutral-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-400">
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
            className="mt-1 block w-full rounded-md border-neutral-700 bg-neutral-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <h3 className="md:col-span-2 text-lg font-semibold text-white border-b border-neutral-700 pb-2 mb-2">
          Facturación SaaS
        </h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-400">
            Inicio de Facturación
          </label>
          <input
            type="date"
            name="billingStartDate"
            value={formData.billingStartDate}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-neutral-700 bg-neutral-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-400">
            Días de Gracia
          </label>
          <input
            type="number"
            name="gracePeriodDays"
            value={formData.gracePeriodDays}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-neutral-700 bg-neutral-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Plan Selection */}
        <h3 className="md:col-span-2 text-lg font-semibold text-white border-b border-neutral-700 pb-2 mb-2 mt-4">
          Plan y Pricing
        </h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-400">
            Plan
          </label>
          <select
            name="plan"
            value={formData.plan}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-neutral-700 bg-neutral-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="Trial">🆓 Trial (14 días gratis)</option>
            <option value="Starter">⭐ Starter (1 condo)</option>
            <option value="Growth">🚀 Growth (2-4 condos)</option>
            <option value="Pro">💎 Pro (5-9 condos)</option>
            <option value="Enterprise">🏢 Enterprise (10+ condos)</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-400">
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
            className="mt-1 block w-full rounded-md border-neutral-700 bg-neutral-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Precio: RD${condoCount >= 10 ? '800' : condoCount >= 5 ? '1,000' : condoCount >= 2 ? '1,200' : '1,500'}/condo
          </p>
        </div>

        {/* Addons Section */}
        <div className="md:col-span-2 mb-4">
          <label className="block text-sm font-medium text-neutral-400 mb-3">
            Addons Disponibles
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AVAILABLE_ADDONS.map((addon) => (
              <label
                key={addon.id}
                className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${formData.addons.includes(addon.id)
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-neutral-700 bg-neutral-800/50 hover:border-neutral-600'
                  }`}
              >
                <input
                  type="checkbox"
                  checked={formData.addons.includes(addon.id)}
                  onChange={() => handleAddonToggle(addon.id)}
                  className="mt-1 h-4 w-4 text-indigo-600 border-neutral-600 rounded focus:ring-indigo-500 bg-neutral-700"
                />
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white">{addon.name}</span>
                    <span className="text-xs font-bold text-green-400">+RD${addon.monthlyPrice.toLocaleString()}/mes</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">{addon.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="md:col-span-2 p-4 rounded-lg bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 mb-4">
          <h4 className="text-sm font-medium text-neutral-300 mb-3">Resumen de Facturación</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-neutral-400">
              <span>Plan Base ({condoCount} condo{condoCount > 1 ? 's' : ''})</span>
              <span>RD${formData.plan === 'Trial' ? '0' : ((condoCount * (condoCount >= 10 ? 800 : condoCount >= 5 ? 1000 : condoCount >= 2 ? 1200 : 1500))).toLocaleString()}</span>
            </div>
            {formData.addons.length > 0 && (
              <div className="flex justify-between text-neutral-400">
                <span>Addons ({formData.addons.length})</span>
                <span>+RD${formData.addons.reduce((sum, id) => sum + (AVAILABLE_ADDONS.find(a => a.id === id)?.monthlyPrice || 0), 0).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-neutral-700">
              <span>Total Mensual</span>
              <span className="text-green-400">RD${monthlyFee.toLocaleString()}</span>
            </div>
            {formData.plan === 'Trial' && (
              <p className="text-xs text-yellow-400 mt-2">⚠️ El plan Trial es gratuito por 14 días. Después se requiere seleccionar un plan pago.</p>
            )}
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="mr-3 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-neutral-300 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center"
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
      const condosRef = collection(db, "condos");
      const q = query(condosRef, where("companyId", "==", company.id));
      const snapshot = await getDocs(q);

      const condoList: Condo[] = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id as unknown as number,
      })) as Condo[];

      setCondos(condoList);
    } catch (error) {
      console.error("Error fetching condos:", error);
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
        companyId: company.id,
        companyName: company.name,
        amount: parseFloat(paymentForm.amount),
        paymentDate: today.toISOString().split("T")[0],
        periodStart: today.toISOString().split("T")[0],
        periodEnd: nextMonth.toISOString().split("T")[0],
        method: paymentForm.method,
        reference: paymentForm.reference,
        notes: paymentForm.notes,
        createdAt: today.toISOString(),
      };

      await addDoc(collection(db, "saas_payments"), paymentData);

      // FIX Bug #1: Actualizar status de la compañía a "Activo" para sincronizar Dashboard y Companies
      const companyRef = doc(db, "companies", company.id);
      await updateDoc(companyRef, {
        status: "Activo",
        lastPaymentDate: today.toISOString().split("T")[0]
      });

      addToast(`Pago de RD$${paymentForm.amount} registrado`, "success");
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
            className={`rounded-xl p-4 border ${billing.status === "active"
              ? "bg-green-500/10 border-green-500/30"
              : billing.status === "grace"
                ? "bg-yellow-500/10 border-yellow-500/30"
                : billing.status === "trial"
                  ? "bg-blue-500/10 border-blue-500/30"
                  : "bg-red-500/10 border-red-500/30"
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
                className={`w-5 h-5 ${billing.status === "active"
                  ? "text-green-400"
                  : billing.status === "grace"
                    ? "text-yellow-400"
                    : billing.status === "trial"
                      ? "text-blue-400"
                      : "text-red-400"
                  }`}
              />
              <span className="text-sm text-neutral-400">Estado</span>
            </div>
            <p
              className={`text-lg font-bold ${billing.status === "active"
                ? "text-green-400"
                : billing.status === "grace"
                  ? "text-yellow-400"
                  : billing.status === "trial"
                    ? "text-blue-400"
                    : "text-red-400"
                }`}
            >
              {billing.statusLabel}
            </p>
          </div>

          {/* Próximo Vencimiento */}
          <div className="bg-neutral-800 rounded-xl p-4 border border-neutral-700">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="calendar" className="w-5 h-5 text-neutral-400" />
              <span className="text-sm text-neutral-400">Próximo Vencimiento</span>
            </div>
            <p className="text-lg font-bold text-white">
              {billing.nextDueDate.toLocaleDateString("es-DO", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
            {billing.daysUntilDue > 0 && (
              <p className="text-xs text-neutral-500">
                en {billing.daysUntilDue} días
              </p>
            )}
          </div>

          {/* Total Pagado */}
          <div className="bg-neutral-800 rounded-xl p-4 border border-neutral-700">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="dollar-sign" className="w-5 h-5 text-green-400" />
              <span className="text-sm text-neutral-400">Total Pagado</span>
            </div>
            <p className="text-lg font-bold text-white">
              RD$ {totalPaid.toLocaleString()}
            </p>
            <p className="text-xs text-neutral-500">
              {companyPayments.length} pagos registrados
            </p>
          </div>
        </div>

        {/* Información del Plan */}
        <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700 flex justify-between items-center">
          <div>
            <p className="text-sm text-neutral-400">Plan Actual</p>
            <p className="text-lg font-bold text-white">{company.plan || "Pro"}</p>
            <p className="text-xs text-neutral-500">
              Período de gracia: {company.gracePeriodDays} días
            </p>
          </div>
          <button
            onClick={() => setIsPaymentFormOpen(!isPaymentFormOpen)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium flex items-center gap-2 transition-colors"
          >
            <Icon name="plus" className="w-4 h-4" />
            Registrar Pago
          </button>
        </div>

        {/* Formulario de Pago */}
        {isPaymentFormOpen && (
          <div className="bg-neutral-900 rounded-xl p-4 border border-green-500/30 space-y-4">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <Icon name="credit-card" className="w-4 h-4 text-green-400" />
              Nuevo Pago
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Monto (RD$) *</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white"
                  placeholder="1500"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Método</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white"
                >
                  <option>Transferencia</option>
                  <option>Efectivo</option>
                  <option>Cheque</option>
                  <option>Tarjeta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Referencia</label>
                <input
                  type="text"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white"
                  placeholder="REF-001"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Notas</label>
                <input
                  type="text"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white"
                  placeholder="Pago mensual diciembre"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsPaymentFormOpen(false)}
                className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitPayment}
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium flex items-center gap-2"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Icon name="check" className="w-4 h-4" />
                )}
                Guardar Pago
              </button>
            </div>
          </div>
        )}

        {/* Historial de Pagos */}
        <div>
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Icon name="history" className="w-4 h-4 text-neutral-400" />
            Historial de Pagos
          </h4>
          {companyPayments.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <Icon name="inbox" className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No hay pagos registrados</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {companyPayments.map((payment, index) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg border border-neutral-700/50 hover:border-neutral-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Icon name="check" className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        RD$ {payment.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {payment.method} • {payment.reference || "Sin ref."}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm text-neutral-300">
                        {new Date(payment.paymentDate).toLocaleDateString("es-DO", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-neutral-500">
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
                      className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
                      title="Descargar Recibo"
                    >
                      <Icon name="download" className="w-4 h-4 text-neutral-400 hover:text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2 pt-4 border-t border-neutral-800">
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
      const paymentsRef = collection(db, "saas_payments");
      const snapshot = await getDocs(paymentsRef);
      const paymentList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Ordenar por fecha descendente
      paymentList.sort(
        (a: any, b: any) =>
          new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      );
      setPayments(paymentList);
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

      await addDoc(collection(db, "saas_payments"), paymentData);
      addToast(
        `Pago de $${paymentForm.amount} registrado para ${selectedCompany.name}.`,
        "success"
      );

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recaudado Este Mes - Card destacada */}
        <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/10 border border-emerald-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Icon name="trending-up" className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Este Mes
            </span>
          </div>
          <p className="text-neutral-400 text-sm mb-1">Recaudado</p>
          <p className="text-3xl font-bold text-white">
            ${totalThisMonth.toLocaleString()}
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            {thisMonthPayments.length} pagos recibidos
          </p>
        </div>

        {/* Promedio por Cliente */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 hover:border-neutral-700 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Icon name="calculator" className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <p className="text-neutral-400 text-sm mb-1">Promedio por Pago</p>
          <p className="text-3xl font-bold text-white">
            $
            {thisMonthPayments.length > 0
              ? Math.round(
                totalThisMonth / thisMonthPayments.length
              ).toLocaleString()
              : "0"}
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            Ticket promedio mensual
          </p>
        </div>

        {/* Total Histórico */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 hover:border-neutral-700 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Icon name="wallet" className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <p className="text-neutral-400 text-sm mb-1">Total Histórico</p>
          <p className="text-3xl font-bold text-white">
            ${totalAllTime.toLocaleString()}
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            {payments.length} pagos totales
          </p>
        </div>
      </div>

      {/* Botón Registrar Pago - Mejorado */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Historial de Pagos</h3>
        <button
          onClick={() => setIsPaymentModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20"
        >
          <Icon name="plus" size={18} />
          Registrar Pago
        </button>
      </div>

      {/* Historial de Pagos - Tabla mejorada */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-neutral-800/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Compañía
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Método
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Referencia
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {loading && (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <Spinner className="w-8 h-8 mx-auto" />
                  <p className="text-neutral-500 mt-2">Cargando pagos...</p>
                </td>
              </tr>
            )}
            {!loading && payments.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-3">
                    <Icon
                      name="credit-card"
                      className="w-8 h-8 text-neutral-600"
                    />
                  </div>
                  <p className="text-neutral-400 font-medium">
                    No hay pagos registrados
                  </p>
                  <p className="text-neutral-500 text-sm mt-1">
                    Los pagos aparecerán aquí
                  </p>
                </td>
              </tr>
            )}
            {!loading &&
              payments.length > 0 &&
              payments.map((payment: any) => (
                <tr
                  key={payment.id}
                  className="hover:bg-neutral-800/30 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-neutral-300">
                    {payment.paymentDate}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                        <Icon
                          name="building-2"
                          className="w-4 h-4 text-blue-400"
                        />
                      </div>
                      <span className="text-sm text-white font-medium">
                        {payment.companyName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg">
                      ${payment.amount?.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-300">
                    {payment.method}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500">
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
                      className="p-2 hover:bg-neutral-700 rounded-lg transition-colors inline-flex items-center gap-1 text-neutral-400 hover:text-white"
                      title="Descargar Recibo PDF"
                    >
                      <Icon name="download" className="w-4 h-4" />
                      <span className="text-xs">PDF</span>
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
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Compañía
            </label>
            <select
              value={selectedCompany?.id || ""}
              onChange={(e) =>
                setSelectedCompany(
                  companies.find((c) => c.id === e.target.value) || null
                )
              }
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-white"
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
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Monto ($)
            </label>
            <input
              type="number"
              value={paymentForm.amount}
              onChange={(e) =>
                setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))
              }
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-white"
              placeholder="99.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Método de Pago
            </label>
            <select
              value={paymentForm.method}
              onChange={(e) =>
                setPaymentForm((prev) => ({ ...prev, method: e.target.value }))
              }
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-white"
            >
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
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
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-white"
              placeholder="No. de confirmación"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Notas (opcional)
            </label>
            <textarea
              value={paymentForm.notes}
              onChange={(e) =>
                setPaymentForm((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-white"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white"
            >
              Cancelar
            </button>
            <button
              onClick={handleRegisterPayment}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold"
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
      const announcementsRef = collection(db, "saas_announcements");
      const snapshot = await getDocs(announcementsRef);
      const announcementList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      announcementList.sort(
        (a: any, b: any) =>
          new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
      );
      setAnnouncements(announcementList);
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
      const today = new Date();
      const announcementData = {
        title: announcementForm.title,
        content: announcementForm.content,
        type: announcementForm.type,
        targetAudience: announcementForm.targetAudience,
        publishDate: today.toISOString().split("T")[0],
        isActive: true,
        createdAt: today.toISOString(),
      };

      await addDoc(collection(db, "saas_announcements"), announcementData);
      addToast(`Anuncio "${announcementForm.title}" publicado.`, "success");

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
    try {
      const announcementRef = doc(db, "saas_announcements", announcement.id);
      await updateDoc(announcementRef, { isActive: !announcement.isActive });
      fetchAnnouncements();
      addToast(
        `Anuncio ${!announcement.isActive ? "activado" : "desactivado"}.`,
        "success"
      );
    } catch (error) {
      console.error("Error toggling announcement:", error);
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
      {/* Métricas de Comunicaciones - Estilo moderno */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Anuncios Activos - Card destacada */}
        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-indigo-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Icon name="megaphone" className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
              Activos
            </span>
          </div>
          <p className="text-neutral-400 text-sm mb-1">Anuncios Activos</p>
          <p className="text-3xl font-bold text-white">
            {announcements.filter((a: any) => a.isActive).length}
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            Visibles para clientes
          </p>
        </div>

        {/* Total Anuncios */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 hover:border-neutral-700 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Icon name="file-text" className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <p className="text-neutral-400 text-sm mb-1">Total Anuncios</p>
          <p className="text-3xl font-bold text-white">
            {announcements.length}
          </p>
          <p className="text-xs text-neutral-500 mt-2">Histórico completo</p>
        </div>

        {/* Alcance */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 hover:border-neutral-700 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Icon name="users" className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <p className="text-neutral-400 text-sm mb-1">Clientes Alcanzados</p>
          <p className="text-3xl font-bold text-white">{companies.length}</p>
          <p className="text-xs text-neutral-500 mt-2">Compañías activas</p>
        </div>
      </div>

      {/* Header + Botón Nuevo Anuncio */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">
          Anuncios Publicados
        </h3>
        <button
          onClick={() => setIsAnnouncementModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/20"
        >
          <Icon name="megaphone" size={18} />
          Nuevo Anuncio
        </button>
      </div>

      {/* Lista de Anuncios - Mejorada */}
      <div className="space-y-4">
        {loading && (
          <div className="text-center py-12 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
            <Spinner className="w-8 h-8 mx-auto" />
            <p className="text-neutral-500 mt-2">Cargando anuncios...</p>
          </div>
        )}

        {!loading && announcements.length === 0 && (
          <div className="text-center py-12 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-3">
              <Icon name="megaphone" className="w-8 h-8 text-neutral-600" />
            </div>
            <p className="text-neutral-400 font-medium">
              No hay anuncios publicados
            </p>
            <p className="text-neutral-500 text-sm mt-1">
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
                className={`bg-neutral-900/50 border rounded-2xl p-5 transition-all duration-200 hover:bg-neutral-900/80 ${announcement.isActive
                  ? "border-l-4 border-l-green-500 border-t-neutral-800 border-r-neutral-800 border-b-neutral-800"
                  : "border-neutral-800 opacity-60"
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeConfig.color
                          .replace("text-", "bg-")
                          .replace("-400", "-500/20")}`}
                      >
                        <Icon
                          name={typeConfig.icon as any}
                          className={`w-4 h-4 ${typeConfig.color}`}
                        />
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full bg-neutral-800 ${typeConfig.color} font-medium`}
                      >
                        {typeConfig.label}
                      </span>
                      {announcement.isActive ? (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                          ● Activo
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-700 text-neutral-400">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {announcement.title}
                    </h3>
                    <p className="text-neutral-400 mt-2 line-clamp-2">
                      {announcement.content}
                    </p>
                    <div className="text-xs text-neutral-500 mt-3 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Icon name="calendar" className="w-3 h-3" />
                        {announcement.publishDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="users" className="w-3 h-3" />
                        {announcement.targetAudience === "all"
                          ? "Todos"
                          : announcement.targetAudience}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleAnnouncementStatus(announcement)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${announcement.isActive
                      ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                      : "bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
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
            <label className="block text-sm font-medium text-neutral-400 mb-1">
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
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-white"
              placeholder="Ej: Nueva funcionalidad disponible"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
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
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-white"
              rows={4}
              placeholder="Escriba el contenido del anuncio..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">
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
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-white"
              >
                <option value="info">ℹ️ Información</option>
                <option value="update">✨ Actualización</option>
                <option value="warning">⚠️ Advertencia</option>
                <option value="maintenance">🔧 Mantenimiento</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">
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
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-white"
              >
                <option value="all">Todos los clientes</option>
                <option value="active">Solo activos</option>
                <option value="inactive">Solo inactivos</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={() => setIsAnnouncementModalOpen(false)}
              className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white"
            >
              Cancelar
            </button>
            <button
              onClick={handlePublishAnnouncement}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-bold"
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
      const messagesRef = collection(db, "saas_messages");
      const snapshot = await getDocs(messagesRef);
      const messagesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Ordenar por fecha más reciente
      messagesList.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setMessages(messagesList);
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
        companyId: messageForm.companyId,
        companyName: company.name,
        subject: messageForm.subject,
        content: messageForm.content,
        direction: "to_client",
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "saas_messages"), newMessage);
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
      await updateDoc(doc(db, "saas_messages", messageId), { isRead: true });
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
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Icon name="message-circle" className="w-6 h-6 text-purple-400" />
            Mensajes Directos
          </h2>
          <p className="text-neutral-400">
            Comunicación directa con sus clientes SaaS
          </p>
        </div>
        <button
          onClick={() => setIsComposeModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <Icon name="send" size={18} />
          Nuevo Mensaje
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
          <div className="text-2xl font-bold text-white">{messages.length}</div>
          <div className="text-sm text-neutral-400">Total Mensajes</div>
        </div>
        <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
          <div className="text-2xl font-bold text-red-400">{unreadCount}</div>
          <div className="text-sm text-neutral-400">Sin Leer</div>
        </div>
        <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
          <div className="text-2xl font-bold text-blue-400">{sentCount}</div>
          <div className="text-sm text-neutral-400">Enviados</div>
        </div>
        <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
          <div className="text-2xl font-bold text-green-400">
            {receivedCount}
          </div>
          <div className="text-sm text-neutral-400">Recibidos</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <select
          value={selectedCompany || ""}
          onChange={(e) => setSelectedCompany(e.target.value || null)}
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white"
        >
          <option value="">Todas las compañías</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="flex gap-1 bg-neutral-800 p-1 rounded-lg">
          {(["all", "unread", "sent", "received"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-sm ${filter === f
                ? "bg-purple-600 text-white"
                : "text-neutral-400 hover:text-white"
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
          <div className="text-center py-8">
            <Spinner />
            <p className="text-neutral-400 mt-2">Cargando mensajes...</p>
          </div>
        )}

        {!loading && filteredMessages.length === 0 && (
          <div className="text-center py-8 text-neutral-400 bg-neutral-900 rounded-lg">
            <Icon
              name="message-circle"
              className="w-12 h-12 mx-auto mb-2 opacity-50"
            />
            <p>No hay mensajes.</p>
          </div>
        )}

        {!loading &&
          filteredMessages.length > 0 &&
          filteredMessages.map((msg: any) => (
            <div
              key={msg.id}
              className={`bg-neutral-900 p-4 rounded-lg border-l-4 cursor-pointer hover:bg-neutral-800 transition-colors ${msg.direction === "from_client"
                ? msg.isRead
                  ? "border-neutral-600"
                  : "border-green-500"
                : "border-blue-500"
                }`}
              onClick={() =>
                !msg.isRead &&
                msg.direction === "from_client" &&
                markAsRead(msg.id)
              }
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon
                      name={
                        msg.direction === "to_client"
                          ? "arrow-right"
                          : "arrow-left"
                      }
                      className={`w-4 h-4 ${msg.direction === "to_client" ? "text-blue-400" : "text-green-400"}`}
                    />
                    <span className="text-sm font-medium text-neutral-300">
                      {msg.direction === "to_client"
                        ? "Enviado a:"
                        : "Recibido de:"}
                    </span>
                    <span className="text-white font-bold">
                      {msg.companyName}
                    </span>
                    {!msg.isRead && msg.direction === "from_client" && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        Nuevo
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {msg.subject}
                  </h3>
                  <p className="text-neutral-400 mt-1 line-clamp-2">
                    {msg.content}
                  </p>
                  <div className="text-xs text-neutral-500 mt-2">
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
            <label className="block text-sm font-medium text-neutral-400 mb-1">
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
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-white"
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
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Asunto *
            </label>
            <input
              type="text"
              value={messageForm.subject}
              onChange={(e) =>
                setMessageForm((prev) => ({ ...prev, subject: e.target.value }))
              }
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-white"
              placeholder="Ej: Recordatorio de pago"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Mensaje *
            </label>
            <textarea
              value={messageForm.content}
              onChange={(e) =>
                setMessageForm((prev) => ({ ...prev, content: e.target.value }))
              }
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-white"
              rows={5}
              placeholder="Escriba su mensaje aquí..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={() => setIsComposeModalOpen(false)}
              className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white"
            >
              Cancelar
            </button>
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-bold flex items-center gap-2"
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

  const handleSaveSettings = async () => {
    setIsSaving(true);
    // Simular guardado
    await new Promise((resolve) => setTimeout(resolve, 1000));
    addToast("Configuración guardada correctamente", "success");
    setIsSaving(false);
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
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Icon name="building-2" className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Información General
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">
                Nombre de la Plataforma
              </label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) =>
                  setSettings({ ...settings, companyName: e.target.value })
                }
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">
                Email de Soporte
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) =>
                  setSettings({ ...settings, supportEmail: e.target.value })
                }
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">
                Teléfono de Soporte
              </label>
              <input
                type="tel"
                value={settings.supportPhone}
                onChange={(e) =>
                  setSettings({ ...settings, supportPhone: e.target.value })
                }
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Configuración de Facturación */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Icon name="credit-card" className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Facturación</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">
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
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">
                Moneda por Defecto
              </label>
              <select
                value={settings.defaultCurrency}
                onChange={(e) =>
                  setSettings({ ...settings, defaultCurrency: e.target.value })
                }
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
              >
                <option value="DOP">DOP - Peso Dominicano</option>
                <option value="USD">USD - Dólar Americano</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Icon name="bell" className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Notificaciones</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">
                  Notificaciones por Email
                </p>
                <p className="text-xs text-neutral-500">
                  Enviar alertas y notificaciones por correo
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
                  : "bg-neutral-700"
                  }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${settings.enableEmailNotifications
                    ? "translate-x-5"
                    : "translate-x-0"
                    }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">
                  Notificaciones por SMS
                </p>
                <p className="text-xs text-neutral-500">
                  Enviar alertas críticas por mensaje de texto
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
                  : "bg-neutral-700"
                  }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${settings.enableSmsNotifications
                    ? "translate-x-5"
                    : "translate-x-0"
                    }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Modo Mantenimiento */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Icon name="tool" className="w-5 h-5 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Sistema</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg border border-orange-500/20">
              <div>
                <p className="text-sm font-medium text-white">
                  Modo Mantenimiento
                </p>
                <p className="text-xs text-neutral-500">
                  Activar para deshabilitar acceso de clientes
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    maintenanceMode: !settings.maintenanceMode,
                  })
                }
                className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${settings.maintenanceMode ? "bg-orange-600" : "bg-neutral-700"
                  }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${settings.maintenanceMode
                    ? "translate-x-5"
                    : "translate-x-0"
                    }`}
                />
              </button>
            </div>
            <div className="p-4 bg-neutral-800/30 rounded-lg border border-neutral-700/50">
              <div className="flex items-start gap-3">
                <Icon name="info" className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm text-neutral-300">
                    Versión del Sistema
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    MI CONDO SaaS v1.0.0-dev
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Ambiente: {window.location.hostname === "localhost" ? "Desarrollo" : "Producción"}
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
          <h2 className="text-2xl font-bold text-white">Planes y Precios</h2>
          <p className="text-neutral-400 text-sm mt-1">
            Gestión de planes de suscripción y pricing
          </p>
        </div>
        <button
          onClick={() => setShowCalculator(!showCalculator)}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl flex items-center gap-2 transition-colors"
        >
          <Icon name="calculator" className="w-4 h-4" />
          Calculadora
        </button>
      </div>

      {/* Métricas de Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Icon name="dollar-sign" className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                RD$ {planStats.monthlyRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-green-400">Ingreso Mensual</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Icon name="building-2" className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{planStats.totalCondos}</p>
              <p className="text-xs text-neutral-400">Condos Activos</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Icon name="users" className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{planStats.active}</p>
              <p className="text-xs text-neutral-400">Clientes Pagando</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Icon name="clock" className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{planStats.trial}</p>
              <p className="text-xs text-neutral-400">En Trial</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calculadora de Precios */}
      {showCalculator && (
        <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Icon name="calculator" className="w-5 h-5 text-purple-400" />
            Calculadora de Precios
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-3">
                ¿Cuántos condominios administras?
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={condoSlider}
                onChange={(e) => setCondoSlider(parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
                <span>15</span>
                <span>20+</span>
              </div>
              <div className="text-center mt-4">
                <span className="text-4xl font-bold text-white">{condoSlider}</span>
                <span className="text-neutral-400 ml-2">condominios</span>
              </div>
            </div>
            <div className="bg-neutral-900/50 rounded-xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Precio por condo:</span>
                <span className="text-white font-bold">
                  RD$ {pricing.perCondo.toLocaleString()}/mes
                </span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-neutral-300">Total Mensual:</span>
                <span className="text-green-400 font-bold">
                  RD$ {pricing.total.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-neutral-700 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Total Anual:</span>
                  <span className="text-white">RD$ {annualTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-400">Con 10% descuento:</span>
                  <span className="text-green-400 font-bold">
                    RD$ {(annualTotal - annualDiscount).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="pt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${pricing.tier.minCondos >= 10
                  ? "bg-green-500/20 text-green-400"
                  : pricing.tier.minCondos >= 5
                    ? "bg-blue-500/20 text-blue-400"
                    : pricing.tier.minCondos >= 2
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-neutral-700 text-neutral-300"
                  }`}>
                  Tier: {pricing.tier.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Precios */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-neutral-800">
          <h3 className="text-lg font-bold text-white">Estructura de Precios</h3>
          <p className="text-sm text-neutral-400 mt-1">
            Precio por condo con descuentos por volumen
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Precio/Condo (RD$)
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Precio/Condo (USD)
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Descuento
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              <tr className="bg-yellow-500/5 border-l-4 border-l-yellow-500">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Icon name="gift" className="w-5 h-5 text-yellow-400" />
                    <span className="font-medium text-yellow-400">Trial</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-white">Ilimitado</td>
                <td className="px-6 py-4">
                  <span className="text-green-400 font-bold">GRATIS</span>
                </td>
                <td className="px-6 py-4 text-neutral-400">$0</td>
                <td className="px-6 py-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
                    {TRIAL_DAYS} días
                  </span>
                </td>
              </tr>
              {PRICING_TIERS.map((tier, index) => (
                <tr key={index} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Icon
                        name={index === 0 ? "building" : index === 3 ? "crown" : "building-2"}
                        className={`w-5 h-5 ${index === 3 ? "text-green-400" :
                          index === 2 ? "text-blue-400" :
                            index === 1 ? "text-purple-400" : "text-neutral-400"
                          }`}
                      />
                      <span className="font-medium text-white capitalize">
                        {index === 0 ? "Starter" : index === 1 ? "Growth" : index === 2 ? "Pro" : "Enterprise"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">{tier.label}</td>
                  <td className="px-6 py-4">
                    <span className="text-white font-bold">
                      RD$ {tier.pricePerCondo.toLocaleString()}
                    </span>
                    <span className="text-neutral-500 text-sm">/mes</span>
                  </td>
                  <td className="px-6 py-4 text-neutral-400">${tier.priceUSD}/mes</td>
                  <td className="px-6 py-4">
                    {index === 0 ? (
                      <span className="text-neutral-500">—</span>
                    ) : (
                      <span className={`text-xs px-2 py-1 rounded-full ${index === 3 ? "bg-green-500/20 text-green-400" :
                        index === 2 ? "bg-blue-500/20 text-blue-400" :
                          "bg-purple-500/20 text-purple-400"
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
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Icon name="check-circle" className="w-5 h-5 text-green-400" />
            Incluido en Todos los Planes
          </h3>
          <ul className="space-y-3">
            {[
              "Unidades ilimitadas por condominio",
              "Portal de residentes",
              "Gestión de pagos y cuotas",
              "Reportes financieros",
              "Control de acceso",
              "Comunicaciones y anuncios",
              "Gestión de incidentes",
              "Reserva de amenidades",
              "Soporte por email",
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-neutral-300">
                <Icon name="check" className="w-4 h-4 text-green-400 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Icon name="sparkles" className="w-5 h-5 text-purple-400" />
            Próximamente (Add-ons)
          </h3>
          <ul className="space-y-3">
            {[
              { name: "Notificaciones WhatsApp", price: "RD$ 500/mes" },
              { name: "Reportes Premium", price: "RD$ 300/mes" },
              { name: "Usuarios adicionales", price: "RD$ 200/usuario" },
              { name: "Almacenamiento extra", price: "RD$ 100/10GB" },
              { name: "API Access", price: "RD$ 1,000/mes" },
              { name: "White Label", price: "Cotizar" },
            ].map((addon, i) => (
              <li key={i} className="flex items-center justify-between p-2 rounded-lg bg-neutral-800/50">
                <span className="text-neutral-300 flex items-center gap-2">
                  <Icon name="plus-circle" className="w-4 h-4 text-purple-400" />
                  {addon.name}
                </span>
                <span className="text-xs text-purple-400">{addon.price}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Comparativa con Competencia */}
      <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Icon name="trending-up" className="w-5 h-5 text-blue-400" />
          ¿Por qué MI CONDO?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-neutral-900/50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">-60%</div>
            <p className="text-sm text-neutral-400">vs Buildium</p>
            <p className="text-xs text-neutral-500">($62+ USD/mes)</p>
          </div>
          <div className="bg-neutral-900/50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-1">∞</div>
            <p className="text-sm text-neutral-400">Unidades</p>
            <p className="text-xs text-neutral-500">Sin límite por condo</p>
          </div>
          <div className="bg-neutral-900/50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-1">RD$</div>
            <p className="text-sm text-neutral-400">Pago Local</p>
            <p className="text-xs text-neutral-500">Sin tarjeta internacional</p>
          </div>
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
  >("dashboard");
  const [showRoadmap, setShowRoadmap] = useState(false);

  // Estado para filtro de compañías
  const [companyFilter, setCompanyFilter] = useState<
    "all" | "active" | "grace" | "inactive"
  >("all");

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
    // En modo desarrollo, usar datos mock
    if (isDevMode && isDevAuthenticated) {
      console.log("🔧 DEV MODE: Usando compañías mock");
      setCompanies([
        {
          id: "dev-company-1",
          name: "Empresa Demo 1",
          rnc: "123456789",
          address: "Calle Principal #1",
          phone: "809-555-0001",
          email: "demo1@example.com",
          logoUrl: undefined,
          status: "Activo",
          adminUserEmail: "admin@demo1.com",
          billingStartDate: "2025-01-01",
          gracePeriodDays: 7,
          plan: "Pro",
        },
        {
          id: "dev-company-2",
          name: "Empresa Demo 2",
          rnc: "987654321",
          address: "Avenida Central #2",
          phone: "809-555-0002",
          email: "demo2@example.com",
          logoUrl: undefined,
          status: "Activo",
          adminUserEmail: "admin@demo2.com",
          billingStartDate: "2025-01-15",
          gracePeriodDays: 14,
          plan: "Enterprise",
        },
      ]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const companiesCollection = collection(db, "companies");
      const companySnapshot = await getDocs(companiesCollection);
      const companyList: Company[] = companySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "Sin Nombre",
          rnc: data.rnc || "N/A",
          address: data.address || "Sin Dirección",
          phone: data.phone || "N/A",
          email: data.email || "N/A",
          logoUrl: data.logoUrl || null,
          status: data.status || "Inactivo",
          adminUserEmail: data.adminUserEmail || "N/A",
          billingStartDate: data.billingStartDate || "N/A",
          gracePeriodDays: data.gracePeriodDays || 0,
          plan: data.plan || "Pro", // --- CORRECCIÓN: MAPEO DEL PLAN ---
        };
      });
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
      const paymentsRef = collection(db, "saas_payments");
      const snapshot = await getDocs(paymentsRef);
      const paymentList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PaymentRecord[];
      setAllPayments(paymentList);
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
    const companyRef = doc(db, "companies", company.id);

    try {
      await updateDoc(companyRef, { status: newStatus });
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
      const eventsRef = collection(db, "activity_events");
      const snapshot = await getDocs(eventsRef);
      const eventList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ActivityEvent[];
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

  // Filtrar compañías según el filtro seleccionado
  const filteredCompanies = React.useMemo(() => {
    switch (companyFilter) {
      case "active":
        return companies.filter((c) => c.status === "Activo");
      case "grace":
        return companies.filter((c) => c.status === "Gracia");
      case "inactive":
        return companies.filter((c) => c.status === "Inactivo");
      default:
        return companies;
    }
  }, [companies, companyFilter]);

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
    <div className="min-h-screen bg-neutral-950 text-neutral-300">
      {/* Sidebar */}
      <SuperAdminSidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
        onShowRoadmap={() => setActiveTab("roadmap")}
        onLogout={logout}
        metrics={sidebarMetrics}
      />

      {/* Main Content Area */}
      <main className="ml-64 p-8 min-h-screen">
        {/* Page Header */}
        <header className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                {activeTab === "dashboard" && "📊 Dashboard"}
                {activeTab === "companies" && "🏢 Compañías"}
                {activeTab === "billing" && "💳 Facturación"}
                {activeTab === "communications" && "📢 Comunicaciones"}
                {activeTab === "messages" && "💬 Mensajes"}
                {activeTab === "roadmap" && "🗺️ Development Roadmap"}
              </h1>
              <p className="text-neutral-500">
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
            {activeTab === "companies" && (
              <button
                onClick={handleOpenCreate}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                <Icon name="plus" size={18} />
                Nueva Compañía
              </button>
            )}
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
              <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/10 border border-emerald-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Icon
                      name="dollar-sign"
                      className="w-6 h-6 text-emerald-400"
                    />
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    +12% vs mes anterior
                  </span>
                </div>
                <p className="text-neutral-400 text-sm mb-1">
                  Ingresos Recurrentes (MRR)
                </p>
                <p className="text-4xl font-bold text-white">
                  ${metrics.mrr.toLocaleString()}
                </p>
                <div className="mt-4 h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    style={{ width: "75%" }}
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  75% del objetivo mensual ($5,000)
                </p>
              </div>

              {/* Clientes Activos Card - Grande */}
              <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Icon name="building-2" className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {metrics.total} totales
                  </span>
                </div>
                <p className="text-neutral-400 text-sm mb-1">
                  Clientes Activos
                </p>
                <p className="text-4xl font-bold text-white">
                  {metrics.active}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-neutral-800/50 rounded-lg">
                    <p className="text-lg font-bold text-green-400">
                      {metrics.active}
                    </p>
                    <p className="text-xs text-neutral-500">Activos</p>
                  </div>
                  <div className="text-center p-2 bg-neutral-800/50 rounded-lg">
                    <p className="text-lg font-bold text-yellow-400">
                      {metrics.inGrace}
                    </p>
                    <p className="text-xs text-neutral-500">En Gracia</p>
                  </div>
                  <div className="text-center p-2 bg-neutral-800/50 rounded-lg">
                    <p className="text-lg font-bold text-red-400">
                      {metrics.inactive}
                    </p>
                    <p className="text-xs text-neutral-500">Inactivos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Métricas secundarias */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Icon name="calendar" className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {metrics.upcomingRenewals}
                    </p>
                    <p className="text-xs text-neutral-500">Vencen Pronto</p>
                  </div>
                </div>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Icon
                      name="message-circle"
                      className="w-5 h-5 text-purple-400"
                    />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">0</p>
                    <p className="text-xs text-neutral-500">Mensajes Nuevos</p>
                  </div>
                </div>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                    <Icon name="megaphone" className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">0</p>
                    <p className="text-xs text-neutral-500">Anuncios Activos</p>
                  </div>
                </div>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Icon
                      name="credit-card"
                      className="w-5 h-5 text-cyan-400"
                    />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">0</p>
                    <p className="text-xs text-neutral-500">Pagos Este Mes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* MRR Trend Chart - Últimos 6 meses */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Icon name="trending-up" className="w-5 h-5 text-emerald-400" />
                  Tendencia MRR (Últimos 6 Meses)
                </h3>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ${metrics.mrr.toLocaleString()}/mes actual
                </span>
              </div>
              <div className="h-64">
                <MRRChart payments={allPayments} />
              </div>
            </div>
            {/* Panel de Alertas - Grace Period */}
            {companiesNeedingAttention.length > 0 && (
              <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Icon name="alert-triangle" className="w-5 h-5 text-red-400" />
                    Requieren Atención ({companiesNeedingAttention.length})
                  </h3>
                  <button
                    onClick={() => setActiveTab("billing")}
                    className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
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
                        className={`flex items-center justify-between p-3 rounded-lg border ${item.billing.urgency === "critical"
                          ? "bg-red-500/10 border-red-500/30"
                          : item.billing.urgency === "high"
                            ? "bg-orange-500/10 border-orange-500/30"
                            : "bg-yellow-500/10 border-yellow-500/30"
                          }`}
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
                            <p className="text-sm font-medium text-white">
                              {company.name}
                            </p>
                            <p className="text-xs text-neutral-400">
                              {item.billing.statusLabel}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedCompanyBilling(company);
                            setIsBillingDetailOpen(true);
                          }}
                          className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
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
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Acciones Rápidas
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => setActiveTab("companies")}
                  className="flex items-center gap-3 p-3 bg-neutral-800/50 hover:bg-neutral-800 rounded-lg transition-colors group"
                >
                  <Icon name="building-2" className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-neutral-300 group-hover:text-white">
                    Ver Compañías
                  </span>
                </button>
                <button
                  onClick={handleOpenCreate}
                  className="flex items-center gap-3 p-3 bg-neutral-800/50 hover:bg-neutral-800 rounded-lg transition-colors group"
                >
                  <Icon name="plus" className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-neutral-300 group-hover:text-white">
                    Nueva Compañía
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("billing")}
                  className="flex items-center gap-3 p-3 bg-neutral-800/50 hover:bg-neutral-800 rounded-lg transition-colors group"
                >
                  <Icon
                    name="credit-card"
                    className="w-5 h-5 text-emerald-400"
                  />
                  <span className="text-sm text-neutral-300 group-hover:text-white">
                    Registrar Pago
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("communications")}
                  className="flex items-center gap-3 p-3 bg-neutral-800/50 hover:bg-neutral-800 rounded-lg transition-colors group"
                >
                  <Icon name="megaphone" className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-neutral-300 group-hover:text-white">
                    Nuevo Anuncio
                  </span>
                </button>
              </div>
            </div>

            {/* Panel de Actividad Reciente */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Icon name="activity" className="w-5 h-5 text-indigo-400" />
                  Actividad Reciente
                </h3>
                <button
                  onClick={fetchActivityEvents}
                  className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Icon name="refresh-cw" className="w-4 h-4" />
                  Actualizar
                </button>
              </div>

              {activityEvents.length === 0 ? (
                <p className="text-neutral-500 text-sm text-center py-4">
                  No hay actividad reciente
                </p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {activityEvents.map((event) => {
                    // Calcular tiempo relativo
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

                    // Icono y color según tipo
                    const eventConfig: Record<string, { icon: string; color: string; bg: string }> = {
                      company_created: { icon: "building-2", color: "text-green-400", bg: "bg-green-500/20" },
                      company_updated: { icon: "edit", color: "text-blue-400", bg: "bg-blue-500/20" },
                      plan_changed: { icon: "arrow-up-circle", color: "text-purple-400", bg: "bg-purple-500/20" },
                      addon_added: { icon: "plus-circle", color: "text-emerald-400", bg: "bg-emerald-500/20" },
                      addon_removed: { icon: "minus-circle", color: "text-orange-400", bg: "bg-orange-500/20" },
                      payment_received: { icon: "dollar-sign", color: "text-green-400", bg: "bg-green-500/20" },
                      status_changed: { icon: "toggle-right", color: "text-yellow-400", bg: "bg-yellow-500/20" },
                    };
                    const config = eventConfig[event.type] || { icon: "activity", color: "text-neutral-400", bg: "bg-neutral-500/20" };

                    return (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 p-3 bg-neutral-800/30 rounded-lg hover:bg-neutral-800/50 transition-colors"
                      >
                        <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon name={config.icon} className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">
                            {event.companyName}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {event.description}
                          </p>
                        </div>
                        <span className="text-xs text-neutral-500 whitespace-nowrap">
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
        {activeTab === "settings" && <SettingsTab />}
        {activeTab === "plans" && <PlansTab companies={companies} />}
        {activeTab === "companies" && (
          <div className="space-y-6">
            {/* Filtros y búsqueda */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setCompanyFilter("all")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${companyFilter === "all"
                    ? "bg-white text-neutral-900"
                    : "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
                    }`}
                >
                  Todos ({companies.length})
                </button>
                <button
                  onClick={() => setCompanyFilter("active")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${companyFilter === "active"
                    ? "bg-green-500 text-white"
                    : "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
                    }`}
                >
                  Activos (
                  {companies.filter((c) => c.status === "Activo").length})
                </button>
                <button
                  onClick={() => setCompanyFilter("grace")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${companyFilter === "grace"
                    ? "bg-yellow-500 text-white"
                    : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30"
                    }`}
                >
                  En Gracia (
                  {companies.filter((c) => c.status === "Gracia").length})
                </button>
                <button
                  onClick={() => setCompanyFilter("inactive")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${companyFilter === "inactive"
                    ? "bg-red-500 text-white"
                    : "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                    }`}
                >
                  Inactivos (
                  {companies.filter((c) => c.status === "Inactivo").length})
                </button>
              </div>
            </div>

            {/* Empty State */}
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-16 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
                <div className="w-20 h-20 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                  <Icon
                    name="building-2"
                    className="w-10 h-10 text-neutral-600"
                  />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {companies.length === 0
                    ? "No hay compañías registradas"
                    : "No hay compañías con este filtro"}
                </h3>
                <p className="text-neutral-500 mb-6">
                  {companies.length === 0
                    ? "Comienza agregando tu primera compañía administradora"
                    : "Prueba cambiando el filtro o añade más compañías"}
                </p>
                {companies.length === 0 && (
                  <button
                    onClick={handleOpenCreate}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/20"
                  >
                    <Icon name="plus" className="w-5 h-5 inline mr-2" />
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
                    className={`bg-neutral-900/50 border rounded-2xl p-5 transition-all duration-200 hover:bg-neutral-900/80 hover:shadow-lg group ${company.status === "Activo"
                      ? "border-neutral-800 hover:border-green-500/30"
                      : company.status === "Gracia"
                        ? "border-yellow-500/30"
                        : "border-red-500/30 opacity-75"
                      }`}
                  >
                    {/* Header de la Card */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        {/* Logo */}
                        {company.logoUrl ? (
                          <img
                            src={company.logoUrl}
                            alt={`${company.name} Logo`}
                            className="w-14 h-14 object-contain rounded-xl bg-white p-2"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
                            <Icon
                              name="building-2"
                              className="w-7 h-7 text-indigo-400"
                            />
                          </div>
                        )}
                        {/* Nombre y RNC */}
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                            {company.name}
                          </h3>
                          <p className="text-sm text-neutral-500">
                            RNC: {company.rnc}
                          </p>
                        </div>
                      </div>
                      {/* Badge de Estado */}
                      <span
                        className={`px-3 py-1.5 text-xs font-bold rounded-full ${company.status === "Activo"
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : company.status === "Gracia"
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                      >
                        {company.status === "Activo" && "● "}
                        {company.status}
                      </span>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-neutral-800/50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon
                            name="mail"
                            className="w-4 h-4 text-neutral-500"
                          />
                          <span className="text-xs text-neutral-500">
                            Admin
                          </span>
                        </div>
                        <p className="text-sm text-white truncate">
                          {company.adminUserEmail}
                        </p>
                      </div>
                      <div className="bg-neutral-800/50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon
                            name="phone"
                            className="w-4 h-4 text-neutral-500"
                          />
                          <span className="text-xs text-neutral-500">
                            Teléfono
                          </span>
                        </div>
                        <p className="text-sm text-white">{company.phone}</p>
                      </div>
                      <div className="bg-neutral-800/50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon
                            name="calendar"
                            className="w-4 h-4 text-neutral-500"
                          />
                          <span className="text-xs text-neutral-500">
                            Facturación
                          </span>
                        </div>
                        <p className="text-sm text-white">
                          {company.billingStartDate}
                        </p>
                      </div>
                      <div className="bg-neutral-800/50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon
                            name="clock"
                            className="w-4 h-4 text-neutral-500"
                          />
                          <span className="text-xs text-neutral-500">
                            Gracia
                          </span>
                        </div>
                        <p className="text-sm text-white">
                          {company.gracePeriodDays} días
                        </p>
                      </div>
                    </div>

                    {/* Plan Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-lg ${company.plan === "Enterprise"
                          ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                          : company.plan === "Pro"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-neutral-700 text-neutral-300"
                          }`}
                      >
                        Plan {company.plan || "Pro"}
                      </span>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 pt-3 border-t border-neutral-800">
                      <button
                        onClick={() => handleOpenEdit(company)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium transition-colors"
                      >
                        <Icon name="edit" className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => setViewingCompany(company)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm font-medium transition-colors border border-blue-500/30"
                      >
                        <Icon name="building-2" className="w-4 h-4" />
                        Condos
                      </button>
                      <button
                        onClick={() => toggleCompanyStatus(company)}
                        disabled={isUpdating}
                        className={`py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${company.status === "Activo"
                          ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                          : "bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
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
