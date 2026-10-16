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
                    bg-white dark:bg-[#161b26]
                    border border-neutral-200/80 dark:border-neutral-800
                    rounded-2xl
                    shadow-2xl
                    animate-in fade-in zoom-in-95 duration-200
                    transition-colors
                `}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <header className="relative px-6 pt-6 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            {icon && (
                                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/50 flex items-center justify-center">
                                    <Icon name={icon} className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                            )}
                            <div>
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">{title}</h2>
                                {subtitle && (
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{subtitle}</p>
                                )}
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all duration-200"
                        >
                            <Icon name="x" className="w-4 h-4" />
                        </button>
                    </div>
                </header>
                
                {/* Content Area */}
                <main className="px-6 py-4 overflow-y-auto flex-1 custom-scrollbar text-neutral-800 dark:text-neutral-200">
                    {children}
                </main>
            </div>
        </div>
    );
};