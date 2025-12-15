import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import type { Company, Condo } from "../../types";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebaseConfig";
import { Modal } from "../../components/ui/Modal";
import { Spinner } from "../../components/ui/Spinner";
import { Icon } from "../../components/ui/Icon";
import { getLocalDateString } from "../../utils/date";
import { DevRoadmap } from "../dev/DevRoadmap";

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
    };
  };

  const [formData, setFormData] = useState(getInitialState());
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState());
      setLogoFile(null);
      setAdminPassword("");
    }
  }, [isOpen, defaultValues]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
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
        // --- CORRECCIÓN: AÑADIMOS EL CAMPO 'PLAN' ---
        plan: defaultValues?.plan || "Pro", // Valor por defecto
      };

      if (defaultValues && defaultValues.id) {
        const companyRef = doc(db, "companies", defaultValues.id);
        await updateDoc(companyRef, companyData);
        addToast(`Compañía "${formData.name}" actualizada.`, "success");
      } else {
        await addDoc(collection(db, "companies"), companyData);
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
    <div>
      {/* Resumen de Facturación */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-neutral-800 p-4 rounded-lg">
          <div className="text-sm text-neutral-400">Recaudado Este Mes</div>
          <div className="text-2xl font-bold text-green-400">
            ${totalThisMonth.toLocaleString()}
          </div>
        </div>
        <div className="bg-neutral-800 p-4 rounded-lg">
          <div className="text-sm text-neutral-400">Pagos Este Mes</div>
          <div className="text-2xl font-bold text-blue-400">
            {thisMonthPayments.length}
          </div>
        </div>
        <div className="bg-neutral-800 p-4 rounded-lg">
          <div className="text-sm text-neutral-400">Total Histórico</div>
          <div className="text-2xl font-bold text-white">
            ${totalAllTime.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Botón Registrar Pago */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsPaymentModalOpen(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          <Icon name="plus" size={18} />
          Registrar Pago
        </button>
      </div>

      {/* Historial de Pagos */}
      <div className="bg-neutral-900 rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-neutral-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">
                Compañía
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">
                Monto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">
                Método
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">
                Referencia
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {loading && (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  <Spinner className="w-6 h-6 mx-auto" />
                </td>
              </tr>
            )}
            {!loading && payments.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-neutral-400">
                  No hay pagos registrados.
                </td>
              </tr>
            )}
            {!loading &&
              payments.length > 0 &&
              payments.map((payment: any) => (
                <tr key={payment.id} className="hover:bg-neutral-800/50">
                  <td className="px-6 py-4 text-sm text-neutral-300">
                    {payment.paymentDate}
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-medium">
                    {payment.companyName}
                  </td>
                  <td className="px-6 py-4 text-sm text-green-400 font-bold">
                    ${payment.amount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-300">
                    {payment.method}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-400">
                    {payment.reference || "-"}
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
    <div>
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-neutral-800 p-4 rounded-lg">
          <div className="text-sm text-neutral-400">Anuncios Activos</div>
          <div className="text-2xl font-bold text-green-400">
            {announcements.filter((a: any) => a.isActive).length}
          </div>
        </div>
        <div className="bg-neutral-800 p-4 rounded-lg">
          <div className="text-sm text-neutral-400">Total Anuncios</div>
          <div className="text-2xl font-bold text-blue-400">
            {announcements.length}
          </div>
        </div>
        <div className="bg-neutral-800 p-4 rounded-lg">
          <div className="text-sm text-neutral-400">Clientes Alcanzados</div>
          <div className="text-2xl font-bold text-purple-400">
            {companies.length}
          </div>
        </div>
      </div>

      {/* Botón Nuevo Anuncio */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsAnnouncementModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          <Icon name="megaphone" size={18} />
          Nuevo Anuncio
        </button>
      </div>

      {/* Lista de Anuncios */}
      <div className="space-y-4">
        {loading && (
          <div className="text-center py-8">
            <Spinner className="w-6 h-6 mx-auto" />
          </div>
        )}

        {!loading && announcements.length === 0 && (
          <div className="text-center py-8 text-neutral-400 bg-neutral-900 rounded-lg">
            <Icon
              name="megaphone"
              className="w-12 h-12 mx-auto mb-2 opacity-50"
            />
            <p>No hay anuncios publicados.</p>
          </div>
        )}

        {!loading &&
          announcements.length > 0 &&
          announcements.map((announcement: any) => {
            const typeConfig = getTypeConfig(announcement.type);
            return (
              <div
                key={announcement.id}
                className={`bg-neutral-900 p-4 rounded-lg border-l-4 ${announcement.isActive ? "border-green-500" : "border-neutral-600"}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon
                        name={typeConfig.icon as any}
                        className={`w-5 h-5 ${typeConfig.color}`}
                      />
                      <span
                        className={`text-xs px-2 py-1 rounded-full bg-neutral-800 ${typeConfig.color}`}
                      >
                        {typeConfig.label}
                      </span>
                      {!announcement.isActive && (
                        <span className="text-xs px-2 py-1 rounded-full bg-neutral-700 text-neutral-400">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {announcement.title}
                    </h3>
                    <p className="text-neutral-400 mt-1">
                      {announcement.content}
                    </p>
                    <div className="text-xs text-neutral-500 mt-2">
                      Publicado: {announcement.publishDate} | Audiencia:{" "}
                      {announcement.targetAudience === "all"
                        ? "Todos"
                        : announcement.targetAudience}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleAnnouncementStatus(announcement)}
                    className={`px-3 py-1 rounded text-xs font-bold ${announcement.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} text-white`}
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
              className={`px-3 py-1 rounded text-sm ${
                filter === f
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
              className={`bg-neutral-900 p-4 rounded-lg border-l-4 cursor-pointer hover:bg-neutral-800 transition-colors ${
                msg.direction === "from_client"
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

export const SuperAdminDashboard = () => {
  const { logout } = useAuth();
  const { addToast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // NUEVO: Tab activo
  const [activeTab, setActiveTab] = useState<
    "companies" | "billing" | "communications" | "messages"
  >("companies");
  const [showRoadmap, setShowRoadmap] = useState(false);

  // NUEVO: Estado para el modal de Ver Clientes
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);

  const fetchCompanies = async () => {
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

  useEffect(() => {
    fetchCompanies();
  }, []);

  if (showRoadmap) {
    return <DevRoadmap onClose={() => setShowRoadmap(false)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        Cargando datos...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">
          🌎 Panel de Gestión de Compañías Administradoras
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowRoadmap(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <Icon name="map" size={18} />
            Roadmap
          </button>
          <button
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            [+] Añadir Compañía
          </button>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            [Cerrar Sesión]
          </button>
        </div>
      </header>

      {/* =============================================
                DASHBOARD DE MÉTRICAS SaaS
            ============================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="building-2" className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-neutral-400">Total</span>
          </div>
          <div className="text-3xl font-bold text-white">{metrics.total}</div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="check-circle" className="w-5 h-5 text-green-400" />
            <span className="text-sm text-neutral-400">Activos</span>
          </div>
          <div className="text-3xl font-bold text-green-400">
            {metrics.active}
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="alert-triangle" className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-neutral-400">En Gracia</span>
          </div>
          <div className="text-3xl font-bold text-yellow-400">
            {metrics.inGrace}
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="x-circle" className="w-5 h-5 text-red-400" />
            <span className="text-sm text-neutral-400">Inactivos</span>
          </div>
          <div className="text-3xl font-bold text-red-400">
            {metrics.inactive}
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="dollar-sign" className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-neutral-400">MRR</span>
          </div>
          <div className="text-3xl font-bold text-emerald-400">
            ${metrics.mrr.toLocaleString()}
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="calendar" className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-neutral-400">Vencen Pronto</span>
          </div>
          <div className="text-3xl font-bold text-orange-400">
            {metrics.upcomingRenewals}
          </div>
        </div>
      </div>

      {/* =============================================
                SISTEMA DE TABS
            ============================================= */}
      <div className="flex space-x-1 bg-neutral-900 p-1 rounded-lg mb-6 w-fit">
        <button
          onClick={() => setActiveTab("companies")}
          className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
            activeTab === "companies"
              ? "bg-blue-600 text-white"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800"
          }`}
        >
          <Icon name="building-2" size={18} />
          Compañías
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
            activeTab === "billing"
              ? "bg-green-600 text-white"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800"
          }`}
        >
          <Icon name="credit-card" size={18} />
          Facturación
        </button>
        <button
          onClick={() => setActiveTab("communications")}
          className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
            activeTab === "communications"
              ? "bg-indigo-600 text-white"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800"
          }`}
        >
          <Icon name="megaphone" size={18} />
          Comunicaciones
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
            activeTab === "messages"
              ? "bg-purple-600 text-white"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800"
          }`}
        >
          <Icon name="message-circle" size={18} />
          Mensajes
        </button>
      </div>

      {/* =============================================
                CONTENIDO SEGÚN TAB ACTIVO
            ============================================= */}
      {activeTab === "billing" && <BillingTab companies={companies} />}
      {activeTab === "communications" && (
        <CommunicationsTab companies={companies} />
      )}
      {activeTab === "messages" && <MessagesTab companies={companies} />}
      {activeTab === "companies" && (
        <>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">
                📋 Gestión de Compañías
              </h2>
              <p className="text-neutral-400">
                Gestión centralizada de sus clientes SaaS (Compañías
                Administradoras).
              </p>
            </div>
          </div>

          {companies.length === 0 ? (
            <div className="text-center py-10 bg-neutral-900 rounded-lg">
              No hay compañías registradas.
              <button
                onClick={handleOpenCreate}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Añadir la primera Compañía
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto bg-neutral-900 rounded-lg shadow-xl">
              <table className="min-w-full divide-y divide-neutral-700">
                <thead className="bg-neutral-800">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider"
                    >
                      Compañía
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider"
                    >
                      Admin Principal
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider"
                    >
                      Facturación
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider"
                    >
                      Estado
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider"
                    >
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {companies.map((company) => (
                    <tr
                      key={company.id}
                      className="hover:bg-neutral-850 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">
                        <div className="flex items-center">
                          {company.logoUrl ? (
                            <img
                              src={company.logoUrl}
                              alt={`${company.name} Logo`}
                              className="w-10 h-10 object-contain rounded-full bg-white p-1 mr-4"
                            />
                          ) : (
                            <div className="w-10 h-10 flex items-center justify-center bg-neutral-700 rounded-full mr-4">
                              [B]
                            </div>
                          )}
                          <div>
                            <div className="text-white font-semibold">
                              {company.name}
                            </div>
                            <div className="text-neutral-500 text-xs">
                              RNC: {company.rnc}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">
                        <div className="text-sm">{company.adminUserEmail}</div>
                        <div className="text-neutral-500 text-xs">
                          {company.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">
                        <div className="text-sm">
                          Inicia: {company.billingStartDate}
                        </div>
                        <div className="text-neutral-500 text-xs">
                          {company.gracePeriodDays} días de gracia
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            company.status === "Activo"
                              ? "bg-green-600/20 text-green-400"
                              : company.status === "Gracia"
                                ? "bg-yellow-600/20 text-yellow-400"
                                : "bg-red-600/20 text-red-400"
                          }`}
                        >
                          {company.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleOpenEdit(company)}
                          className="py-1 px-3 rounded text-white text-xs font-bold transition-colors bg-neutral-600 hover:bg-neutral-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setViewingCompany(company)}
                          className="py-1 px-3 rounded text-white text-xs font-bold transition-colors bg-blue-600 hover:bg-blue-700"
                        >
                          Ver Clientes
                        </button>
                        <button
                          onClick={() => toggleCompanyStatus(company)}
                          disabled={isUpdating}
                          className={`py-1 px-3 rounded text-white text-xs font-bold transition-colors ${
                            company.status === "Activo"
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {isUpdating
                            ? "..."
                            : company.status === "Activo"
                              ? "Desactivar"
                              : "Activar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
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
    </div>
  );
};
