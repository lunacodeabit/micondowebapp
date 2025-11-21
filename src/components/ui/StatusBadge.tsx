import React from 'react';

type StatusBadgeProps = {
    status: string;
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
    const getStatusColor = () => {
        switch (status.toLowerCase()) {
            case 'activo':
            case 'abierto':
            case 'aprobada':
                return 'bg-green-500 text-green-950';
            case 'inactivo':
            case 'cerrado':
            case 'rechazada':
                return 'bg-red-500 text-red-950';
            case 'en progreso':
            case 'pendiente':
                return 'bg-yellow-500 text-yellow-950';
            case 'pagada':
                 return 'bg-blue-500 text-blue-950';
            default:
                return 'bg-neutral-500 text-neutral-950';
        }
    };
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}>
            {status}
        </span>
    );
};
