import React from 'react';
import { Icon } from '../../components/ui/Icon';

export const LoadingScreen = () => (
    <div className="flex flex-col justify-center items-center h-screen bg-neutral-950 text-white">
        <Icon name="shield-check" className="w-16 h-16 text-blue-500 mb-6" />
        <h1 className="text-2xl font-bold mb-2">MiCondoApp</h1>
        <p className="text-neutral-400">Autenticando, por favor espere</p>
        <div className="loading-dots mt-4">
            <span>.</span><span>.</span><span>.</span>
        </div>
    </div>
);
