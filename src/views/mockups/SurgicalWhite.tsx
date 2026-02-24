import React from 'react';
import { Icon } from '../../components/ui/Icon';

/**
 * CONCEPT 8: Surgical White
 * The absolute peak of "White-Space Professionalism".
 * No shadows, no gradients. Only precision lines and perfect alignment.
 */
export const SurgicalWhite = () => {
    return (
        <div className="min-h-screen bg-[#ffffff] text-[#000000] font-['Inter'] flex antialiased">
            {/* Minimalist Vertical Nav */}
            <aside className="w-20 border-r border-[#f1f1f2] flex flex-col items-center py-8 bg-[#ffffff]">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-black text-sm mb-12">
                    M
                </div>
                <div className="flex-1 flex flex-col gap-8 text-[#a1a1a5]">
                    <Icon name="layout" size={24} className="text-black cursor-pointer" />
                    <Icon name="users" size={24} className="hover:text-black cursor-pointer transition-colors" />
                    <Icon name="calendar" size={24} className="hover:text-black cursor-pointer transition-colors" />
                    <Icon name="activity" size={24} className="hover:text-black cursor-pointer transition-colors" />
                    <Icon name="settings" size={24} className="hover:text-black cursor-pointer transition-colors" />
                </div>
                <div className="w-8 h-8 rounded-full bg-[#f1f1f2] border border-[#f1f1f2]"></div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col">
                <header className="h-16 border-b border-[#f1f1f2] px-10 flex items-center justify-between">
                    <h2 className="text-sm font-bold tracking-tight">Vivienda El Jaguar <span className="text-neutral-300 font-medium ml-2">/ Control Center</span></h2>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-[12px] font-semibold text-neutral-400">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Live Status
                        </div>
                        <button className="bg-black text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-neutral-800 transition-all">
                            Sync Data
                        </button>
                    </div>
                </header>

                <div className="flex-1 p-16 max-w-7xl">
                    <div className="mb-20">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-4">Operations Dashboard</p>
                        <h1 className="text-6xl font-black tracking-tighter leading-none mb-6">MiCondo <br /> Ecosystem.</h1>
                        <p className="text-xl text-neutral-500 font-medium tracking-tight max-w-2xl leading-relaxed">High-precision infrastructure for professional condominium management. Optimized for speed and visual clarity.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-x-12 gap-y-12 mb-24">
                        {[
                            { label: 'Active Tenants', val: '412', detail: 'Properties Synced' },
                            { label: 'API Health', val: '100%', detail: 'Uptime Protocol' },
                            { label: 'Latency', val: '12ms', detail: 'Edge Response' },
                            { label: 'Security', val: 'Verified', detail: 'RLS Active' }
                        ].map((s, i) => (
                            <div key={i}>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-4">{s.label}</p>
                                <h3 className="text-4xl font-black tracking-tight mb-2">{s.val}</h3>
                                <p className="text-[11px] font-bold text-neutral-400">{s.detail}</p>
                                <div className="mt-6 h-px bg-[#f1f1f2] w-full"></div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                        <div className="lg:col-span-8">
                            <div className="flex justify-between items-end mb-8">
                                <h3 className="text-lg font-black tracking-tight">Property Maintenance Flow</h3>
                                <div className="flex gap-4 text-[11px] font-bold uppercase tracking-widest text-neutral-300">
                                    <span className="text-black">Traffic</span>
                                    <span>Requests</span>
                                </div>
                            </div>
                            <div className="h-64 border border-[#f1f1f2] rounded-2xl flex items-end p-8 gap-2">
                                {Array.from({ length: 30 }).map((_, i) => (
                                    <div key={i} className="flex-1 bg-[#f1f1f2] hover:bg-black transition-colors" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-10">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest mb-6">Autonomous Eliza</h3>
                                <div className="space-y-4">
                                    {[
                                        { id: '402A', msg: 'Reserva piscina confirmada.' },
                                        { id: '101B', msg: 'Solicitud de asamblea enviada.' },
                                        { id: '305C', msg: 'Pago verificado exitosamente.' }
                                    ].map((row, i) => (
                                        <div key={i} className="p-4 border border-[#f1f1f2] rounded-xl flex items-center justify-between group cursor-pointer hover:border-black transition-colors">
                                            <span className="text-xs font-bold text-neutral-400 group-hover:text-black">UNIT_{row.id}</span>
                                            <Icon name="arrow-right" size={14} className="text-neutral-200 group-hover:text-black transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-8 bg-neutral-950 text-white rounded-[2rem]">
                                <h4 className="text-xl font-bold mb-4">Pro Plan Active</h4>
                                <p className="text-sm text-neutral-400 leading-relaxed mb-6">Acceso a reportes financieros avanzados y personalización total.</p>
                                <button className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Upgrade</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
