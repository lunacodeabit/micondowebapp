import React from 'react';
import { Icon } from '../../components/ui/Icon';

/**
 * CONCEPT 2: Zenith Resident Portal
 * Apple-style design language. Clean, white glass, and minimal effort interactions.
 * Philosophy: Nano Banana Pro (Minimalist Luxury)
 */
export const ZenithResident = () => {
    return (
        <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] p-6 md:p-12 font-['Inter']">
            <div className="max-w-5xl mx-auto">
                <header className="flex justify-between items-center mb-16 px-4">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2 block">Premium Living</span>
                        <h1 className="text-4xl font-extrabold tracking-tight">Good Morning, <span className="text-blue-600">Howard</span>.</h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="relative">
                            <Icon name="bell" size={24} className="text-neutral-400" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                        </button>
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-xl">
                            <img src="https://ui-avatars.com/api/?name=Howard&background=2563eb&color=fff" alt="Profile" />
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Main Card */}
                    <div className="md:col-span-8 bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] p-10 flex flex-col justify-between overflow-hidden relative group border border-white">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-100 transition-colors"></div>
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold mb-2">Resumen de Pagos</h2>
                            <p className="text-neutral-400 text-sm mb-8">Cuota de mantenimiento — Febrero 2026</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-6xl font-black">$275</span>
                                <span className="text-neutral-400 font-semibold mb-2">USD</span>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-12 relative z-10">
                            <button className="flex-1 bg-[#1D1D1F] text-white py-4 rounded-2xl font-bold text-lg hover:bg-neutral-800 transition-all active:scale-[0.98]">Pagar Ahora</button>
                            <button className="flex-1 bg-white border border-neutral-200 py-4 rounded-2xl font-bold text-lg hover:border-neutral-400 transition-all active:scale-[0.98]">Ver Detalles</button>
                        </div>
                    </div>

                    {/* Quick Access */}
                    <div className="md:col-span-4 space-y-6">
                        {[
                            { label: 'Elisa AI', icon: 'bot', color: 'bg-blue-600' },
                            { label: 'Amenidades', icon: 'key', color: 'bg-orange-500' },
                            { label: 'Documentos', icon: 'file-text', color: 'bg-neutral-800' }
                        ].map((item, i) => (
                            <div key={i} className="bg-white rounded-[2rem] p-6 shadow-sm border border-neutral-100 flex items-center gap-5 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
                                <div className={`w-14 h-14 rounded-2xl ${item.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                    <Icon name={item.icon as any} size={28} />
                                </div>
                                <span className="text-xl font-bold">{item.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Status Sections */}
                    <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                        <div className="bg-orange-50/50 rounded-[2.5rem] p-8 border border-orange-100">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-orange-950">Avisos del Sistema</h3>
                                <span className="text-xs font-black uppercase text-orange-600 bg-orange-100 px-2 py-1 rounded">2 Nuevos</span>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-white rounded-2xl shadow-sm border border-orange-100">
                                    <p className="text-sm font-bold text-orange-950 mb-1">Corte de Energía Programado</p>
                                    <p className="text-xs text-orange-800/70">Mantenimiento preventivo — Mañana 10:00 AM</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-100 shadow-sm relative overflow-hidden group">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold">Mis Reservaciones</h3>
                                <Icon name="arrow-right" size={20} className="text-neutral-400 group-hover:text-blue-600 transition-colors" />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex flex-col items-center justify-center text-neutral-400">
                                    <span className="text-xs font-bold">FEB</span>
                                    <span className="text-xl font-black text-neutral-800">25</span>
                                </div>
                                <div>
                                    <p className="font-bold">Piscina — Área Social</p>
                                    <p className="text-xs text-neutral-400">02:00 PM - 05:00 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
