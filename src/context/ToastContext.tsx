import React, { createContext, useState, useContext, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

type Toast = {
    id: number;
    message: string;
    type: ToastType;
};

type ToastContextType = {
    toasts: Toast[];
    addToast: (message: string, type: ToastType) => void;
    removeToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: number) => {
        setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = Date.now();
        setToasts(currentToasts => [...currentToasts, { id, message, type }]);

        // Auto-remove toast after 4 seconds
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, [removeToast]);

    const value = { toasts, addToast, removeToast };

    return (
        <ToastContext.Provider value={value}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
