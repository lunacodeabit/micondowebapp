import React from 'react';
import * as LucideIcons from 'lucide-react';

type IconProps = {
    name: string;
    className?: string;
    size?: number;
};

export const Icon = ({ name, className = "w-6 h-6", size = 24 }: IconProps) => {
    // Convert kebab-case to PascalCase (e.g. check-circle-2 -> CheckCircle2)
    const pascalName = name
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');

    const IconComponent = (LucideIcons as any)[pascalName];

    if (!IconComponent) {
        console.warn(`Icon "${name}" not found in lucide-react`);
        // Fallback to HelpCircle or just null
        const Fallback = (LucideIcons as any)['HelpCircle'];
        return Fallback ? <Fallback className={className} size={size} /> : null;
    }

    return <IconComponent className={className} size={size} />;
};
