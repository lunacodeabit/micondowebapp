import React, { useEffect } from 'react';
import { Icon } from './Icon';

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
    subtitle?: string;
    icon?: string;
};

export const Modal = ({ isOpen, onClose, title, children, size = '2xl', subtitle, icon }: ModalProps) => {
    // Prevenir scroll del body cuando el modal está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
    };

    const widthClass = sizeClasses[size];

    return (
        <div 
            className="fixed inset-0 z-50 flex justify-center items-center p-4"
            onClick={onClose}
        >
            {/* Backdrop con blur */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            
            {/* Modal Container con animación */}
            <div 
                className={`
                    relative w-full ${widthClass} max-h-[90vh] flex flex-col
                    bg-gradient-to-b from-neutral-900/95 to-neutral-950/95
                    backdrop-blur-xl
                    border border-neutral-700/50
                    rounded-2xl
                    shadow-2xl shadow-black/50
                    animate-in fade-in zoom-in-95 duration-200
                `}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header con gradiente sutil */}
                <header className="relative px-6 pt-6 pb-4">
                    {/* Línea de acento superior */}
                    <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                    
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            {icon && (
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                                    <Icon name={icon} className="w-5 h-5 text-indigo-400" />
                                </div>
                            )}
                            <div>
                                <h2 className="text-xl font-semibold text-white">{title}</h2>
                                {subtitle && (
                                    <p className="text-sm text-neutral-400 mt-0.5">{subtitle}</p>
                                )}
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-8 h-8 rounded-lg bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700/50 flex items-center justify-center text-neutral-400 hover:text-white transition-all duration-200 hover:border-neutral-600"
                        >
                            <Icon name="x" className="w-4 h-4" />
                        </button>
                    </div>
                    
                    {/* Separador con gradiente */}
                    <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent" />
                </header>
                
                {/* Content Area */}
                <main className="px-6 py-4 overflow-y-auto flex-1 custom-scrollbar">
                    {children}
                </main>
                
                {/* Efecto de brillo en esquinas */}
                <div className="absolute -top-px -left-px w-20 h-20 bg-indigo-500/10 rounded-tl-2xl blur-xl pointer-events-none" />
                <div className="absolute -top-px -right-px w-20 h-20 bg-purple-500/10 rounded-tr-2xl blur-xl pointer-events-none" />
            </div>
        </div>
    );
};