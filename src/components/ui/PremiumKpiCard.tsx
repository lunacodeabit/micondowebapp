import React from 'react';
import { Icon } from './Icon';

interface PremiumKpiCardProps {
    title: string;
    value: string | number;
    icon: string;
    gradient: string;
    delay?: string;
}

export const PremiumKpiCard = ({ title, value, icon, gradient, delay = "" }: PremiumKpiCardProps) => (
    <div className={`group relative bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/50 p-8 rounded-[2rem] overflow-hidden transition-all duration-500 hover:border-white/10 hover:shadow-[0_0_50px_rgba(0,0,0,0.5)] anime-fade-in ${delay}`}>
        {/* Decorative Gradient Background */}
        <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-700`} />

        <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8 cursor-default">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg shadow-black/50 group-hover:scale-110 transition-transform duration-500`}>
                    <Icon name={icon} className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">En Vivo</span>
                </div>
            </div>

            <div className="mt-auto">
                <p className="text-[11px] font-black text-neutral-500 uppercase tracking-[3px] mb-2">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-black text-white tracking-tighter group-hover:tracking-tight transition-all duration-500 leading-none">
                        {value}
                    </h3>
                </div>
            </div>
        </div>

        {/* Bottom Progress Bar Decoration */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-neutral-800/50 overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${gradient} w-1/3 group-hover:w-full transition-all duration-1000 ease-out`} />
        </div>
    </div>
);
