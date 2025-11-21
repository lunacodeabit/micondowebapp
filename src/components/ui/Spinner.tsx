import React from 'react';
import { Icon } from './Icon';

interface SpinnerProps {
    className?: string;
}

export const Spinner = ({ className = 'w-5 h-5' }: SpinnerProps) => {
    // Retorna un ícono que se auto-anima. 
    return (
        <Icon name="loader-2" className={`${className} animate-spin`} />
    );
};