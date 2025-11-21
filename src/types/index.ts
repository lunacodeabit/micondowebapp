// Fix: Add type definition for window.lucide and window.jspdf to avoid TypeScript errors.
declare global {
    interface Window {
        lucide?: {
            createIcons: () => void;
        };
        jspdf?: any; // For jsPDF library loaded via CDN
        Chart?: any; // For Chart.js library loaded via CDN
    }
}

// Add specific types for the application data models
export type Transaction = {
    id: number;
    date: string;
    type: 'Ingreso' | 'Egreso';
    description: string;
    amount: number;
    balance: number;
    category: string | null;
};

export type AccountHistoryItem = {
    id: number;
    date: string;
    type: 'Cargo' | 'Abono';
    description: string;
    amount: number;
};

export type UnitType = 'Apartamento' | 'Penthouse' | 'Residencia' | 'Local Comercial' | 'Oficina' | 'Solar';
export type FeeRecipient = 'Propietario' | 'Inquilino' | 'Representante' | 'Propietario y Inquilino' | 'Inquilino y Representante' | 'Propietario, Inquilino y Representante';

export type Unit = {
    id: number;
    apartmentNumber: string;
    unitType: UnitType;
    requiresNcf: boolean;
    ownerName: string;
    ownerPhones?: string;
    ownerWhatsapp?: string;
    ownerEmail1?: string; // Renamed from ownerEmail
    ownerEmail2?: string;
    email?: string; // Email de login del residente
    authUid?: string; // UID de Firebase Auth del residente
    comment?: string;
    isOccupied: boolean;
    isAirbnb: boolean;
    isRented: boolean;
    isRepresented: boolean;
    monthlyFee: number;
    notifyByEmail: boolean;
    showOwnerNameInDocs: boolean;
    feeDistribution: {
        maintenance: FeeRecipient;
        gas: FeeRecipient;
        charges: FeeRecipient;
        lateFees: FeeRecipient;
        accountStatement: FeeRecipient;
    };
    isBoardMember: boolean;
    boardMemberName?: string;
    hasPaymentAgreement: boolean;
    isUnderLegalAction: boolean;
    status: 'Activo' | 'Inactivo';
    registeredDate?: string;
    accountHistory: AccountHistoryItem[]; // ✅ LISTA DE HISTORIAL
    managementHistory?: ManagementHistoryItem[]; // ✅ LISTA DE HISTORIAL
};

export type Communication = {
    id: number;
    date: string;
    title: string;
    content: string;
};

export type Incident = {
    id: number;
    date: string;
    reportedBy: string;
    description: string;
    status: 'Abierto' | 'En Progreso' | 'Cerrado';
    resolution: string;
};

export type AccountPayable = {
    id: number;
    supplier: string;
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    amount: number;
    description: string;
    status: 'Pagada' | 'Pendiente';
    paymentDate: string | null;
    relatedExpenseId: number | null;
};

export type Employee = {
    id: number;
    name: string;
    position: string;
    phone: string;
    monthlySalary: number;
    status: 'Activo' | 'Inactivo';
    hireDate?: string;
    identityNumber?: string;
};

export type Supplier = {
    id: number;
    name: string;
    serviceType: string;
    status: 'Activo' | 'Inactivo';
    contactName?: string;
    phone?: string;
    email?: string;
    rnc?: string;
    supplierSince?: string;
};

export type PayrollPayment = {
    employeeId: number;
    employeeName: string;
    netPay: number;
    incomeDetails: { concept: string, amount: number }[]; // ✅ LISTA DE INGRESOS
    deductionDetails: { concept: string, amount: number }[]; // ✅ LISTA DE DEDUCCIONES
};

export type Payroll = {
    id: number;
    year: number;
    month: number;
    fortnight: 1 | 2;
    periodType: 'Quincenal' | 'Mensual';
    periodLabel: string;
    status: 'Abierta' | 'Cerrada';
    payments: PayrollPayment[]; // ✅ LISTA DE PAGOS
};

export type Amenity = {
    id: number;
    name: string;
    description: string;
    capacity: number;
    fee: number;
    rules: string;
};

export type Reservation = {
    id: number;
    unitId: number;
    amenityId: number;
    date: string;
    startTime: string;
    endTime: string;
    status: 'Aprobada' | 'Pendiente' | 'Rechazada';
};

export type ManagementHistoryItem = {
    id: number;
    date: string;
    type: 'Comentario' | 'Acción';
    content: string;
};

export type Novedad = {
    id: number;
    title: string;
    date: string;
    content: string;
};

export type UtilityCompany = {
    name: string;
    contractId: string;
};

export type CondoFile = {
    id: number;
    code: string;
    fileType: string; // Mime type e.g., 'application/pdf'
    title: string;
    fileName: string; // Original file name
    folder: string;
    uploadDate: string;
    fileUrl: string; // URL to the file (can be a blob URL temporarily)
};

export type ExtraordinaryFee = {
    id: number;
    title: string;
    description: string;
    totalAmount: number;
    issueDate: string;
    dueDate: string;
    distributionType: 'EQUAL'; // Initially only supporting equal distribution
    status: 'Pendiente' | 'Aplicada';
};

export type PaymentNotification = {
    id: number;
    unitId: number;
    dateReported: string;
    paymentDate: string;
    amount: number;
    notes: string;
    proofUrl: string; // URL to the proof (can be a blob URL temporarily)
    proofFileName: string;
    status: 'Pendiente' | 'Verificado' | 'Rechazado';
};

export type CondoSettings = {
    general: {
        shortName: string;
        sector: string;
        province: string;
        phone: string;
        rnc: string;
        comment: string;
        electricCompany: UtilityCompany;
        waterCompany: UtilityCompany;
        trashCompany: UtilityCompany;
        gasCompany: UtilityCompany;
        dieselCompany: UtilityCompany;
        elevatorCompany: UtilityCompany;
        hasWaterWell: boolean;
        lockoutDate: string | null;
        status: 'Activo' | 'Inactivo';
    };
    fiscal: {
        requiresAdminNcf: boolean;
        emitsNcfToUnits: boolean;
    };
    gas: {
        shouldBillGas: boolean;
    };
    honorariums: {
        type: 'MONTO FIJO' | 'PORCENTAJE';
        fixedAmount: number;
        billingDay: number;
        concept: string;
    };
    quotas: {
        generationStrategy: 'SAME_MONTH' | 'PREVIOUS_MONTH';
        haveDueDate: boolean;
    };
    lateFees: {
        apply: boolean;
        type: 'PERCENTAGE_ON_DEBT' | 'FIXED_AMOUNT';
        value: number;
        gracePeriodDays: number;
        chargeConcept: string;
    };
    notifications: {
        automaticSending: boolean;
        useCustomAdminEmail: boolean;
        senderName: 'Administrador' | 'Condominio';
        showLateFeesInInvoice: boolean;
        showPendingBalanceInInvoice: boolean;
        sendAccountStatusInAutoMail: boolean;
        copyAdminInMails: boolean;
        adminCopyEmail: string;
        includeAccountStatusInMaintNotif: boolean;
    };
    payroll: {
        q1Day: number;
        q2Day: number;
    };
    reservations: {
        daysInAdvance: number;
    };
    payments: {
        bankName: string;
        accountNumber: string;
        accountType: string;
        beneficiaryName: string;
    };
};

// Fix: Added CondoFormData type for use in creation forms and context.
export type CondoFormData = {
    code: string;
    name: string;
    address: string;
    settings: CondoSettings;
};

export type Condo = {
    // 1. VÍNCULO A LA COMPAÑÍA ADMINISTRADORA (CLIENTE SAAS)
    companyId: string; // ID del documento en la colección 'companies'
    // ---
    id: number;
    code: string;
    name: string;
    address: string;
    settings: CondoSettings;
    manualBalance: number;
    
    // ✅ CORRECCIÓN MAESTRA: TODOS ESTOS AHORA SON ARRAYS
    finances: Transaction[];
    units: Unit[];
    communications: Communication[];
    incidents: Incident[];
    accountsPayable: AccountPayable[];
    employees: Employee[];
    suppliers: Supplier[];
    payrolls: Payroll[];
    amenities: Amenity[];
    reservations: Reservation[];
    files: CondoFile[];
    extraordinaryFees: ExtraordinaryFee[];
    paymentNotifications: PaymentNotification[];
};

// --- TIPOS DE SUPER ADMIN (Compañías Administradoras) ---
export interface Company {
    id: string; // Firestore document ID
    
    // Información de la Compañía (SaaS Client)
    name: string;
    address: string;
    phone: string;
    email: string; // Email de Contacto/Facturación
    rnc: string;
    logoUrl?: string;

    // Información del Admin (Usuario principal de la compañía)
    adminUserEmail: string; // Email para el login del admin
    // (La contraseña no se guarda aquí, se usa para crear el usuario en Auth)

    // Información de Facturación (SaaS Billing)
    status: 'Activo' | 'Inactivo' | 'Gracia'; // Estado de pago
    billingStartDate: string; // Fecha de inicio de cobro (ISO Date string)
    gracePeriodDays: number; // Días de gracia post-vencimiento
    plan: string; // 'Pro', 'Basic', etc.
}