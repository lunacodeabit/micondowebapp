import React from 'react';
import { useToast } from '../../context/ToastContext';
import { Icon } from './Icon';

export const ToastContainer = () => {
    // AHORA SÍ USAMOS 'removeToast'
    const { toasts, removeToast } = useToast();

    const getIconName = (type: string) => {
        switch (type) {
            case 'success': return 'check-circle-2';
            case 'error': return 'alert-circle';
            case 'info': return 'info';
            default: return 'bell';
        }
    };

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                // AÑADIMOS 'flex justify-between' PARA ALINEAR EL BOTÓN
                <div key={toast.id} className={`toast ${toast.type} flex justify-between items-center`}>
                    <div className="flex items-center">
                        <Icon name={getIconName(toast.type)} className="w-6 h-6 mr-3" />
                        <span>{toast.message}</span>
                    </div>
                    
                    {/* ESTE ES EL NUEVO BOTÓN DE CERRAR */}
                    <button 
                        onClick={() => removeToast(toast.id)} 
                        className="ml-4 p-1 text-neutral-400 hover:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label="Cerrar"
                    >
                        <Icon name="x" className="w-5 h-5" />
                    </button>
                </div>
            ))}
        </div>
    );
};