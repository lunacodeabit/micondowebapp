// =================================================================
// SERVICE BARREL EXPORT
// Import all services from a single entry point
// =================================================================

// Auth
export {
    loginWithEmail,
    logout,
    getSession,
    getCurrentUser,
    onAuthStateChange,
    getUserProfile,
    updateUserProfile,
    checkIsSuperAdmin,
} from './authService';
export type { UserRole, UserProfile } from './authService';

// Condos & Units
export {
    fetchCondos,
    fetchCondoById,
    createCondo,
    updateCondo,
    deleteCondo,
    fetchUnits,
    updateUnit,
    createUnit,
} from './condoService';

// Finance
export {
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    fetchAccountHistory,
    createAccountHistoryEntry,
    fetchAccountsPayable,
    createAccountPayable,
    updateAccountPayable,
    fetchPaymentNotifications,
    createPaymentNotification,
} from './financeService';

// Operations
export {
    fetchCommunications,
    createCommunication,
    updateCommunication,
    fetchIncidents,
    createIncident,
    updateIncident,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    fetchAmenities,
    fetchReservations,
    createReservation,
    updateReservation,
} from './operationsService';
// AI / Bot
export {
    elisaService
} from './elisaService';
export type { BotConversation, ConversationMessage } from './elisaService';
