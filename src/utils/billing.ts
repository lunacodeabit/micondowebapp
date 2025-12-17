/**
 * Utilidades para manejo de facturación y períodos de gracia
 * MI CONDO SaaS - Billing Utilities
 */

export type BillingStatus = "active" | "grace" | "inactive" | "trial";

export type BillingInfo = {
  status: BillingStatus;
  daysUntilDue: number;
  daysOverdue: number;
  isInGrace: boolean;
  graceRemaining: number;
  nextDueDate: Date;
  lastPaymentDate: Date | null;
  statusLabel: string;
  statusColor: string;
  urgency: "none" | "low" | "medium" | "high" | "critical";
};

export type PaymentRecord = {
  id: string;
  companyId: string;
  companyName: string;
  amount: number;
  paymentDate: string;
  periodStart: string;
  periodEnd: string;
  method: string;
  reference?: string;
  notes?: string;
  createdAt: string;
};

/**
 * Calcula el estado de facturación de una compañía
 */
export const calculateBillingStatus = (
  billingStartDate: string,
  gracePeriodDays: number,
  lastPayment: PaymentRecord | null,
  isTrial: boolean = false
): BillingInfo => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Si está en trial
  if (isTrial) {
    const trialStart = new Date(billingStartDate);
    const trialEnd = new Date(trialStart);
    trialEnd.setDate(trialEnd.getDate() + 14); // 14 días de trial
    
    const daysRemaining = Math.ceil(
      (trialEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      status: daysRemaining > 0 ? "trial" : "inactive",
      daysUntilDue: daysRemaining,
      daysOverdue: daysRemaining < 0 ? Math.abs(daysRemaining) : 0,
      isInGrace: false,
      graceRemaining: 0,
      nextDueDate: trialEnd,
      lastPaymentDate: null,
      statusLabel: daysRemaining > 0 ? `Trial (${daysRemaining} días)` : "Trial Expirado",
      statusColor: daysRemaining > 0 ? "yellow" : "red",
      urgency: daysRemaining <= 3 ? "high" : daysRemaining <= 7 ? "medium" : "low",
    };
  }

  // Calcular fecha de vencimiento basada en último pago o inicio de facturación
  let nextDueDate: Date;
  let lastPaymentDate: Date | null = null;

  if (lastPayment) {
    // Si hay pago, el siguiente vencimiento es 1 mes después del período cubierto
    lastPaymentDate = new Date(lastPayment.paymentDate);
    nextDueDate = new Date(lastPayment.periodEnd);
  } else {
    // Si no hay pagos, vence desde la fecha de inicio + 1 mes
    const startDate = new Date(billingStartDate);
    nextDueDate = new Date(startDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);
  }

  // Calcular días hasta/después del vencimiento
  const timeDiff = nextDueDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  // Determinar estado
  let status: BillingStatus;
  let isInGrace = false;
  let graceRemaining = 0;
  let statusLabel: string;
  let statusColor: string;
  let urgency: BillingInfo["urgency"];

  if (daysDiff > 0) {
    // Aún no vence
    status = "active";
    statusLabel = `Activo (vence en ${daysDiff} días)`;
    statusColor = "green";
    urgency = daysDiff <= 5 ? "medium" : daysDiff <= 10 ? "low" : "none";
  } else if (daysDiff <= 0 && Math.abs(daysDiff) <= gracePeriodDays) {
    // En período de gracia
    status = "grace";
    isInGrace = true;
    graceRemaining = gracePeriodDays - Math.abs(daysDiff);
    statusLabel = `En Gracia (${graceRemaining} días)`;
    statusColor = "yellow";
    urgency = graceRemaining <= 2 ? "critical" : graceRemaining <= 5 ? "high" : "medium";
  } else {
    // Pasó el período de gracia
    status = "inactive";
    statusLabel = `Inactivo (${Math.abs(daysDiff) - gracePeriodDays} días vencido)`;
    statusColor = "red";
    urgency = "critical";
  }

  return {
    status,
    daysUntilDue: daysDiff > 0 ? daysDiff : 0,
    daysOverdue: daysDiff < 0 ? Math.abs(daysDiff) : 0,
    isInGrace,
    graceRemaining,
    nextDueDate,
    lastPaymentDate,
    statusLabel,
    statusColor,
    urgency,
  };
};

/**
 * Obtiene el último pago de una compañía
 */
export const getLastPayment = (
  payments: PaymentRecord[],
  companyId: string
): PaymentRecord | null => {
  const companyPayments = payments
    .filter((p) => p.companyId === companyId)
    .sort(
      (a, b) =>
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );

  return companyPayments.length > 0 ? companyPayments[0] : null;
};

/**
 * Calcula el monto mensual basado en cantidad de condos
 */
export const calculateMonthlyAmount = (condoCount: number): number => {
  if (condoCount >= 10) return condoCount * 800;
  if (condoCount >= 5) return condoCount * 1000;
  if (condoCount >= 2) return condoCount * 1200;
  return 1500; // 1 condo
};

/**
 * Formatea la fecha de vencimiento
 */
export const formatDueDate = (date: Date): string => {
  return date.toLocaleDateString("es-DO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Obtiene compañías que requieren atención (próximas a vencer o vencidas)
 */
export const getCompaniesNeedingAttention = (
  companies: Array<{
    id: string;
    billingStartDate: string;
    gracePeriodDays: number;
    plan?: string;
  }>,
  payments: PaymentRecord[]
): Array<{ companyId: string; billing: BillingInfo }> => {
  return companies
    .map((company) => {
      const lastPayment = getLastPayment(payments, company.id);
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
        item.billing.urgency !== "none" && item.billing.status !== "active"
    )
    .sort((a, b) => {
      const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3, none: 4 };
      return urgencyOrder[a.billing.urgency] - urgencyOrder[b.billing.urgency];
    });
};
