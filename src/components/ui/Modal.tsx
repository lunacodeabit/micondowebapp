import React from 'react';
import { Icon } from './Icon';

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    // Fix: Made children optional to resolve widespread type errors.
    children?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
};

export const Modal = ({ isOpen, onClose, title, children, size = '2xl' }: ModalProps) => {
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
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className={`bg-neutral-900 rounded-lg shadow-xl w-full ${widthClass} max-h-[90vh] flex flex-col`}>
                <header className="flex justify-between items-center p-4 border-b border-neutral-800">
                    <h2 className="text-lg font-semibold text-white">{title}</h2>
                    <button onClick={onClose} className="text-neutral-400 hover:text-white">
                        <Icon name="x" />
                    </button>
                </header>
                <main className="p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};