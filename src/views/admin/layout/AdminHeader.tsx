import React from 'react';
import { Icon } from '../../../components/ui/Icon';

type AdminHeaderProps = {
    condoName: string;
    onToggleMobileSidebar: () => void;
};

export const AdminHeader = ({ condoName, onToggleMobileSidebar }: AdminHeaderProps) => (
    <header className="bg-neutral-900 p-4 shadow-md flex items-center border-b border-neutral-800 relative z-10">
        <button onClick={onToggleMobileSidebar} className="lg:hidden mr-4 text-neutral-400 hover:text-white">
            <Icon name="menu" />
        </button>
        <div className="flex items-center">
            <Icon name="building" className="w-6 h-6 mr-3 text-blue-500" />
            <h1 className="text-xl font-semibold text-white">{condoName}</h1>
        </div>
    </header>
);