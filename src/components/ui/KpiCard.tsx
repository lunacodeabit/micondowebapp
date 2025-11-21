import React from 'react';
import { Icon } from './Icon';

type KpiCardProps = {
    title: string;
    value: string | number;
    icon: string;
    color: string;
};

export const KpiCard = ({ title, value, icon, color }: KpiCardProps) => (
    <div className="bg-neutral-900 p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center">
            <div>
                <p className="text-sm text-neutral-400">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
            <div className={`p-3 rounded-full ${color}`}>
                <Icon name={icon} className="w-6 h-6 text-white" />
            </div>
        </div>
    </div>
);