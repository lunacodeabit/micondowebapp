import type { Condo, Novedad, CondoSettings, Unit } from '../types';

export const novedades: Novedad[] = [
    {
        id: '397',
        title: 'Reserva sociales con días previos',
        date: '22/06/2022 19:42 - Sistema',
        content: `Se ha añadido la funcionalidad de indicar a cada condominio la cantidad de días de anticipación con la que hay que colocar la solicitud de reservación de área social. En cada condominio puede ser distinto.\n\nEsto solventa el problema que tenían algunos administradores en los que ciertos propietarios le colocaban solicitudes justo antes del momento del uso del área.\n\nPara modificar esta facilidad, solo hay que entrar en la opción Datos del cliente, ir al final de la pantalla, presionar el botón Modificar datos del cliente, y buscar casi al final de la pantalla la opción Días Previos Reservación, ajustarlo al valor deseado y guardar los datos.\n\nNota importante: Si es el administrador quien coloca la solicitud de reservación, el sistema no le obligará a sujetarse a este parámetro, en cambio, a los propietarios sí.\n\nAnte cualquier duda o inquietud al respecto, por favor comuníquese con nosotros.`
    }
];


export const defaultCondoSettings: CondoSettings = {
    general: {
        shortName: '',
        sector: '',
        province: 'Distrito Nacional',
        phone: '',
        rnc: '',
        comment: '',
        electricCompany: { name: '', contractId: '' },
        waterCompany: { name: '', contractId: '' },
        trashCompany: { name: '', contractId: '' },
        gasCompany: { name: '', contractId: '' },
        dieselCompany: { name: '', contractId: '' },
        elevatorCompany: { name: '', contractId: '' },
        hasWaterWell: false,
        lockoutDate: null,
        status: 'Activo',
    },
    fiscal: {
        requiresAdminNcf: false,
        emitsNcfToUnits: false,
    },
    gas: {
        shouldBillGas: false,
    },
    honorariums: {
        type: 'MONTO FIJO',
        fixedAmount: 15000,
        billingDay: 15,
        concept: 'Honorarios de Administración',
    },
    quotas: {
        generationStrategy: 'SAME_MONTH',
        haveDueDate: false,
    },
    lateFees: {
        apply: false,
        type: 'PERCENTAGE_ON_DEBT',
        value: 5,
        gracePeriodDays: 10,
        chargeConcept: 'Cargo por Mora',
    },
    notifications: {
        automaticSending: true,
        useCustomAdminEmail: false,
        senderName: 'Administrador',
        showLateFeesInInvoice: true,
        showPendingBalanceInInvoice: true,
        sendAccountStatusInAutoMail: true,
        copyAdminInMails: true,
        adminCopyEmail: 'info@wiseservicesrd.com, howard@wiseservicesrd.com',
        includeAccountStatusInMaintNotif: false,
    },
    payroll: {
        q1Day: 10,
        q2Day: 25,
    },
    reservations: {
        daysInAdvance: 0, // 0 means 'Sin límite'
    },
    payments: {
        bankName: '',
        accountNumber: '',
        accountType: 'Corriente',
        beneficiaryName: '',
    }
};

const defaultUnitData: Omit<Unit, 'id' | 'apartmentNumber' | 'ownerName' | 'monthlyFee' | 'status' | 'registeredDate' | 'accountHistory' | 'managementHistory' | 'ownerPhones' | 'ownerEmail1'> = {
    unitType: 'Apartamento',
    requiresNcf: false,
    ownerWhatsapp: '',
    ownerEmail2: '',
    comment: '',
    isOccupied: true,
    isAirbnb: false,
    isRented: false,
    isRepresented: false,
    notifyByEmail: true,
    showOwnerNameInDocs: true,
    feeDistribution: {
        maintenance: 'Propietario',
        gas: 'Propietario',
        charges: 'Propietario',
        lateFees: 'Propietario',
        accountStatement: 'Propietario',
    },
    isBoardMember: false,
    boardMemberName: '',
    hasPaymentAgreement: false,
    isUnderLegalAction: false,
};


// --- DATOS INICIALES (Simulación de Base de Datos para Múltiples Condominios) ---
export const initialCondos: Condo[] = [
    {
        companyId: 'dev-company-id',
        id: '1',
        code: '1',
        name: 'Torre Pinos',
        address: 'Av. Siempre Viva 123, Ciudad Capital',
        settings: {
            ...defaultCondoSettings,
            general: {
                ...defaultCondoSettings.general,
                shortName: 'LOS PINOS',
                sector: 'Arroyo Hondo',
                phone: '8095993163',
                rnc: '430314706',
                electricCompany: { name: 'EDESUR', contractId: '5032758' },
                waterCompany: { name: 'CAASD', contractId: '175526 y 452799' },
                trashCompany: { name: 'A. D. N.', contractId: '80726' },
                gasCompany: { name: 'TROPIGAS', contractId: '103768' },
                dieselCompany: { name: 'CRUZ DIESEL', contractId: '' },
                hasWaterWell: true,
                lockoutDate: '2025-05-24',
            },
            lateFees: {
                apply: true,
                type: 'PERCENTAGE_ON_DEBT',
                value: 5,
                gracePeriodDays: 10,
                chargeConcept: 'Cargo por Mora',
            },
            payments: {
                bankName: 'Banco Popular Dominicano',
                accountNumber: '801234567',
                accountType: 'Corriente',
                beneficiaryName: 'Condominio Torre Pinos',
            }
        },
        manualBalance: 14500,
        finances: [
            { id: '1', date: '2025-06-10', type: 'Ingreso', description: 'Pago Mant Jun-2025 - Apto 1A', amount: 16700, balance: 15000, category: null },
            { id: '2', date: '2025-06-10', type: 'Ingreso', description: 'Pago Mant Jun-2025 - Apto 2A', amount: 16700, balance: 31700, category: null },
            { id: '3', date: '2025-06-15', type: 'Egreso', description: 'Pago 1ra Quincena Junio 2025 - WANDER PERDOMO', amount: -8750, balance: 22950, category: 'Nómina' },
            { id: '4', date: '2025-06-15', type: 'Egreso', description: 'Pago 1ra Quincena Junio 2025 - JOSE DE LA CRUZ', amount: -8750, balance: 14200, category: 'Nómina' },
            { id: '5', date: '2025-06-25', type: 'Ingreso', description: 'Pago Mant Jul-2025 - Apto 1C', amount: 16700, balance: 30900, category: null },
        ],
        units: [
            {
                id: '1',
                apartmentNumber: '1A',
                ownerName: 'Luis Martínez',
                email: 'residente@torre.com',
                authUid: 'dev-resident-uid-1',
                ownerEmail1: 'residente@torre.com',
                ownerPhones: '809-555-0101',
                monthlyFee: 16700, status: 'Activo',
                registeredDate: '2022-01-15',
                ...defaultUnitData,
                accountHistory: [
                    { id: '1', date: '2025-05-01', type: 'Cargo', description: 'Cuota Mantenimiento Mayo', amount: 16700 },
                    { id: '2', date: '2025-05-10', type: 'Abono', description: 'Pago cuota Mayo', amount: 16700 },
                    { id: '3', date: '2025-06-01', type: 'Cargo', description: 'Cuota Mantenimiento Junio', amount: 16700 },
                    { id: '4', date: '2025-06-08', type: 'Abono', description: 'Pago cuota Junio', amount: 16700 },
                ],
            },
            {
                id: '2',
                apartmentNumber: '2A',
                ownerName: 'Ana García',
                email: 'ana.garcia@gmail.com',
                authUid: 'dev-resident-uid-2',
                ownerEmail1: 'ana.garcia@gmail.com',
                ownerPhones: '809-555-0202',
                monthlyFee: 16700, status: 'Activo',
                registeredDate: '2022-02-20',
                ...defaultUnitData,
                accountHistory: [
                    { id: '1', date: '2025-05-01', type: 'Cargo', description: 'Cuota Mantenimiento Mayo', amount: 16700 },
                    { id: '2', date: '2025-06-01', type: 'Cargo', description: 'Cuota Mantenimiento Junio', amount: 16700 },
                    { id: '3', date: '2025-06-10', type: 'Abono', description: 'Pago cuota Junio', amount: 16700 },
                    { id: '4', date: '2025-07-01', type: 'Cargo', description: 'Cuota Mantenimiento Julio', amount: 16700 },
                ],
            },
            {
                id: '3',
                apartmentNumber: '3A',
                ownerName: 'Carlos Perez',
                email: 'carlos.perez@hotmail.com',
                authUid: 'dev-resident-uid-3',
                ownerEmail1: 'carlos.perez@hotmail.com',
                ownerPhones: '809-555-0303',
                monthlyFee: 16700, status: 'Activo',
                registeredDate: '2022-05-10',
                ...defaultUnitData,
                accountHistory: [
                    { id: '1', date: '2025-06-01', type: 'Cargo', description: 'Cuota Mantenimiento Junio', amount: 16700 },
                    { id: '2', date: '2025-06-11', type: 'Abono', description: 'Pago cuota Junio', amount: 16700 },
                    { id: '3', date: '2025-07-01', type: 'Cargo', description: 'Cuota Mantenimiento Julio', amount: 16700 },
                ],
            },
            {
                id: '4',
                apartmentNumber: '1B',
                ownerName: 'Sofia Rodriguez',
                email: 'sofia.rodriguez@gmail.com',
                authUid: 'dev-resident-uid-4',
                ownerEmail1: 'sofia.rodriguez@gmail.com',
                ownerPhones: '809-555-0404',
                monthlyFee: 16700, status: 'Activo',
                registeredDate: '2023-01-30',
                ...defaultUnitData,
                accountHistory: [
                    { id: '1', date: '2025-06-01', type: 'Cargo', description: 'Cuota Mantenimiento Junio', amount: 16700 },
                    { id: '2', date: '2025-06-12', type: 'Abono', description: 'Pago cuota Junio', amount: 16700 },
                ],
            },
            {
                id: '5',
                apartmentNumber: '1C',
                ownerName: 'Juan Gomez',
                email: 'juan.gomez@gmail.com',
                authUid: 'dev-resident-uid-5',
                ownerEmail1: 'juan.gomez@gmail.com',
                ownerPhones: '809-555-0505',
                monthlyFee: 16700, status: 'Activo',
                registeredDate: '2023-03-22',
                ...defaultUnitData,
                accountHistory: [
                    { id: '1', date: '2025-06-01', type: 'Cargo', description: 'Cuota Mantenimiento Junio', amount: 16700 },
                    { id: '2', date: '2025-07-01', type: 'Cargo', description: 'Cuota Mantenimiento Julio', amount: 16700 },
                    { id: '3', date: '2025-07-05', type: 'Abono', description: 'Pago cuota Julio', amount: 16700 },
                ],
            }
        ],
        communications: [
            { id: '1', date: '2025-06-20', title: 'Corte de Agua Programado', content: 'Se informa a todos los residentes que habrá un corte de agua el día 25 de Junio de 10am a 2pm por mantenimiento en la cisterna principal.' },
        ],
        incidents: [
            { id: '1', date: '2025-06-18', reportedBy: 'Luis Martínez (1A)', description: 'Luz del pasillo del piso 1 quemada.', status: 'Abierto', resolution: '' },
        ],
        accountsPayable: [
            { id: '1', supplier: 'Compañía Eléctrica del Este', invoiceNumber: 'CE-2025-987', issueDate: '2025-05-10', dueDate: '2025-05-30', amount: 1500, description: 'Factura de luz áreas comunes Mayo', status: 'Pagada', paymentDate: '2025-05-15', relatedExpenseId: null },
            { id: '2', supplier: 'Seguridad Integral 24/7', invoiceNumber: 'SI-2025-06-005', issueDate: '2025-06-01', dueDate: '2025-06-15', amount: 6000, description: 'Servicio de seguridad Junio', status: 'Pendiente', paymentDate: null, relatedExpenseId: null },
        ],
        employees: [
            { id: '1', name: 'WANDER PERDOMO', position: 'CONSERJE', phone: '8293882445', monthlySalary: 17500.00, status: 'Activo' },
            { id: '2', name: 'JOSE DE LA CRUZ', position: 'Conserje', phone: '809-555-1234', monthlySalary: 17500.00, status: 'Activo' },
        ],
        suppliers: [
            { id: '0', name: 'WISE SERVICE SRL', serviceType: 'Adm. Condominios', status: 'Activo', contactName: 'Howard Luna', phone: '829-455-4783', email: 'howard@wiseservicesrd.com', supplierSince: '2022-01-01' },
            { id: '1', name: 'Compañía Eléctrica del Este', serviceType: 'Electricidad', status: 'Activo', supplierSince: '2022-01-01' },
            { id: '2', name: 'Seguridad Integral 24/7', serviceType: 'Seguridad', status: 'Activo', supplierSince: '2022-01-01' },
        ],
        payrolls: [
            {
                id: '1',
                year: 2025, month: 4, // May
                fortnight: 2, // 2da quincena
                periodType: 'Quincenal',
                periodLabel: '2da Quincena Mayo 2025', status: 'Cerrada',
                payments: [
                    { employeeId: '1', employeeName: 'WANDER PERDOMO', netPay: 8750.00, incomeDetails: [{ concept: 'Sueldo Quincena', amount: 8750.00 }], deductionDetails: [] },
                    { employeeId: '2', employeeName: 'JOSE DE LA CRUZ', netPay: 8750.00, incomeDetails: [{ concept: 'Sueldo Quincena', amount: 8750.00 }], deductionDetails: [] }
                ]
            },
            {
                id: '2',
                year: 2025, month: 5, // June
                fortnight: 1, // 1ra quincena
                periodType: 'Quincenal',
                periodLabel: '1ra Quincena Junio 2025', status: 'Cerrada',
                payments: [
                    { employeeId: '1', employeeName: 'WANDER PERDOMO', netPay: 8750.00, incomeDetails: [{ concept: 'Sueldo Quincena', amount: 8750.00 }], deductionDetails: [] },
                    { employeeId: '2', employeeName: 'JOSE DE LA CRUZ', netPay: 8750.00, incomeDetails: [{ concept: 'Sueldo Quincena', amount: 8750.00 }], deductionDetails: [] }
                ]
            },
            {
                id: '3',
                year: 2025, month: 5, // June
                fortnight: 2, // 2da quincena
                periodType: 'Quincenal',
                periodLabel: '2da Quincena Junio 2025', status: 'Cerrada',
                payments: [
                    { employeeId: '1', employeeName: 'WANDER PERDOMO', netPay: 8750.00, incomeDetails: [{ concept: 'Sueldo Quincena', amount: 8750.00 }], deductionDetails: [] },
                    { employeeId: '2', employeeName: 'JOSE DE LA CRUZ', netPay: 8750.00, incomeDetails: [{ concept: 'Sueldo Quincena', amount: 8750.00 }], deductionDetails: [] }
                ]
            }
        ],
        amenities: [
            {
                id: '1',
                name: 'Salón de Eventos',
                description: 'Ideal para reuniones y celebraciones familiares. Equipado con aire acondicionado, mesas y sillas.',
                capacity: 50,
                fee: 2500.00,
                rules: 'No se permite música después de las 12:00 AM. El área debe ser entregada limpia. Cualquier daño será cargado a la unidad.'
            },
            {
                id: '2',
                name: 'Área de Piscina y BBQ',
                description: 'Espacio al aire libre con piscina y área para barbacoas.',
                capacity: 20,
                fee: 1000.00,
                rules: 'Horario de uso de 9:00 AM a 10:00 PM. No se permiten envases de cristal en el área de la piscina.'
            }
        ],
        reservations: [
            { id: '1', unitId: '2', amenityId: '1', date: '2025-07-20', startTime: '15:00', endTime: '20:00', status: 'Aprobada' }, // Ana García
            { id: '2', unitId: '3', amenityId: '1', date: '2025-07-25', startTime: '18:00', endTime: '23:00', status: 'Pendiente' }, // Carlos Perez
            { id: '3', unitId: '1', amenityId: '2', date: '2025-07-18', startTime: '12:00', endTime: '16:00', status: 'Aprobada' }, // Luis Martínez
        ],
        files: [],
        extraordinaryFees: [],
        paymentNotifications: [],
    },
    {
        companyId: 'dev-company-id',
        id: '2',
        code: '2',
        name: 'Residencial Roble',
        address: 'Calle Falsa 456, Colonia Centro',
        settings: defaultCondoSettings,
        manualBalance: 24000,
        finances: [], units: [], communications: [], incidents: [], accountsPayable: [], employees: [], suppliers: [], payrolls: [], amenities: [], reservations: [], files: [], extraordinaryFees: [], paymentNotifications: [],
    }
];

export const expenseCategories = ['Mantenimiento', 'Servicios', 'Limpieza', 'Seguridad', 'Administrativo', 'Nómina', 'Otros'];
export const incidentStatusOptions = ['Abierto', 'En Progreso', 'Cerrado'];
export const fileFolders = ['Documentos', 'Asambleas', 'Estados de Cuenta'];