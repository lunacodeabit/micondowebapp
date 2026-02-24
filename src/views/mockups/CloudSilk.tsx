import React from 'react';
import { Icon } from '../../components/ui/Icon';
import { motion } from 'framer-motion';

/**
 * CONCEPT 5: Cloud Silk
 * Organic Modern / Light Luxury. Friendly, accessible, high-end.
 * Philosophy: Airbnb / Modern Fintech.
 */
export const CloudSilk = () => {
    return (
        <div className="min-h-screen bg-[#fcfcfd] text-[#1a1a1e] font-['Outfit'] selection:bg-blue-100 selection:text-blue-900">
            {/* Soft Organic Shapes in Background */}
            <div className="fixed overflow-hidden pointer-events-none inset-0">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-100/40 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/30 blur-[150px] rounded-full"></div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
                <header className="flex justify-between items-start mb-20 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div>
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-neutral-100 flex items-center justify-center mb-6">
                            <Icon name="layout" size={24} className="text-blue-600" />
                        </div>
                        <h1 className="text-6xl font-extrabold tracking-[-0.03em] leading-tight">
                            Harmony <br /><span className="text-blue-600/90 italic font-medium">mi'condo</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-neutral-100">
                        <button className="px-6 py-2.5 bg-neutral-900 text-white rounded-full text-xs font-bold tracking-widest uppercase hover:bg-black transition-all shadow-lg active:scale-95">Explorer</button>
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200">
                            <img src="https://ui-avatars.com/api/?name=Howard&background=f1f5f9&color=1e293b" alt="A" />
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Hero Display */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="lg:col-span-12 bg-white rounded-[3rem] p-4 shadow-[0_30px_100px_rgba(0,0,0,0.04)] border border-neutral-100 group overflow-hidden"
                    >
                        <div className="bg-gradient-to-br from-neutral-50 to-white rounded-[2.5rem] p-12 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/50 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2 group-hover:bg-blue-100/50 transition-colors duration-1000"></div>
                            <div className="max-w-md relative z-10">
                                <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-6 inline-block">Premium Suite</span>
                                <h2 className="text-4xl font-bold mb-4 tracking-tight">Vivienda el Jaguar <br /> Torre Apex Esperilla</h2>
                                <p className="text-neutral-500 leading-relaxed mb-8">Experimenta la gestión condominial del futuro. Inteligencia artificial centrada en el bienestar humano.</p>
                                <div className="flex gap-4">
                                    <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-[0_15px_40px_rgba(37,99,235,0.3)] hover:scale-[1.02] active:scale-95 transition-all">Gestionar Ahora</button>
                                    <button className="px-8 py-4 bg-white border border-neutral-200 text-neutral-900 rounded-2xl font-bold hover:bg-neutral-50 transition-all">Analytics</button>
                                </div>
                            </div>
                            <div className="relative z-10">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 bg-white rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-neutral-50 flex flex-col items-center">
                                        <span className="text-3xl font-black text-blue-600">98%</span>
                                        <span className="text-[10px] uppercase font-bold text-neutral-400 mt-1">Satisfaction</span>
                                    </div>
                                    <div className="p-6 bg-white rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-neutral-50 flex flex-col items-center">
                                        <span className="text-3xl font-black text-neutral-900">420</span>
                                        <span className="text-[10px] uppercase font-bold text-neutral-400 mt-1">Managed units</span>
                                    </div>
                                    <div className="col-span-2 p-6 bg-neutral-900 text-white rounded-3xl flex items-center justify-between">
                                        <Icon name="check-circle" size={24} className="text-green-400" />
                                        <span className="text-sm font-bold">Cloud Synced 100%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Secondary Sections */}
                    <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-neutral-100 hover:-translate-y-1 transition-all duration-500">
                            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-6">
                                <Icon name="mail" size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Comunicaciones</h3>
                            <p className="text-sm text-neutral-500 mb-6 font-medium">Centraliza avisos y feedback de Elisa AI en un solo hilo sedoso.</p>
                            <div className="h-2 w-full bg-neutral-50 rounded-full overflow-hidden">
                                <div className="h-full w-[65%] bg-orange-500 rounded-full"></div>
                            </div>
                        </div>
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-neutral-100 hover:-translate-y-1 transition-all duration-500">
                            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-6">
                                <Icon name="dollar-sign" size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Finanzas Pro</h3>
                            <p className="text-sm text-neutral-500 mb-6 font-medium">Recaudación automática y conciliación bancaria instantánea.</p>
                            <span className="text-sm font-black text-neutral-900">$18,450.00 <span className="text-neutral-300 font-normal">USD Rec.</span></span>
                        </div>
                    </div>

                    <div className="lg:col-span-4 bg-blue-600 rounded-[2.5rem] p-10 text-white shadow-[0_30px_80px_rgba(37,99,235,0.2)] flex flex-col justify-between group overflow-hidden relative">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 blur-[40px] translate-x-12 translate-y-12"></div>
                        <div>
                            <h3 className="text-2xl font-bold mb-4 leading-tight">Configuraciones de <br /> Siguiente Nivel</h3>
                            <p className="text-blue-100/70 text-sm leading-relaxed">Personaliza el ecosistema MiCondo a la medida de tu cliente.</p>
                        </div>
                        <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-neutral-50 transition-all mt-8 active:scale-95">Configurar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
