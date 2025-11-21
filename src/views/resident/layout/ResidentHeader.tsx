import React from 'react';
import { Icon } from '../../../components/ui/Icon';

type ResidentHeaderProps = {
    pageTitle: string;
    onToggleMobileSidebar: () => void;
};

export const ResidentHeader = ({ pageTitle, onToggleMobileSidebar }: ResidentHeaderProps) => {
    return (
        <header className="bg-neutral-900 p-4 shadow-md flex items-center border-b border-neutral-800 relative z-10">
            <button onClick={onToggleMobileSidebar} className="lg:hidden mr-4 text-neutral-400 hover:text-white">
                <Icon name="menu" />
            </button>
            <h1 className="text-xl font-semibold text-white">{pageTitle}</h1>
        </header>
    );
};