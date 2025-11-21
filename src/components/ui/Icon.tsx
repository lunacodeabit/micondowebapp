import React, { useEffect } from 'react';

type IconProps = {
    name: string;
    className?: string;
    size?: number;
};

export const Icon = ({ name, className = "w-6 h-6", size = 24 }: IconProps) => {
    useEffect(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, []);

    return <i data-lucide={name} className={className} style={{ width: size, height: size }} />;
};
