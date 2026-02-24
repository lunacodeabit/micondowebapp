import React from 'react';
import { Icon } from '../../components/ui/Icon';
import { motion } from 'framer-motion';

/**
 * CONCEPT 6: Neon Graphite
 * High-Tech Stealth Dashboard. Industrial, precise, pro-tech.
 * Philosophy: Railway.app / Supabase / Hyper-minimal Pro.
 */
export const NeonGraphite = () => {
    return (
        <div className="min-h-screen bg-[#0c0c0d] text-[#e1e2e6] font-['Space Mono'] selection:bg-[#4dffc5]/30">
            {/* Focal Point Glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-[#4dffc5]/5 to-transparent pointer-events-none"></div>

            <div className="flex h-screen overflow-hidden">
                {/* Thin Vertical Navigation */}
                <aside className="w-20 border-r border-[#1a1a1c] bg-[#0c0c0d] flex flex-col items-center py-8 gap-10">
                    <div className="w-10 h-10 bg-[#e1e2e6] rounded-lg flex items-center justify-center text-black font-black text-xs">
                        MC
                    </div>
                    <div className="flex-1 flex flex-col gap-8 text-[#4e4e52]">
                        <Icon name="layout" size={24} className="hover:text-[#4dffc5] cursor-pointer transition-colors" />
                        <Icon name="users" size={24} className="hover:text-[#4dffc5] cursor-pointer transition-colors" />
                        <Icon name="calendar" size={24} className="hover:text-[#4dffc5] cursor-pointer transition-colors" />
                        <Icon name="settings" size={24} className="hover:text-[#4dffc5] cursor-pointer transition-colors" />
                    </div>
                    <div className="w-10 h-10 rounded-full border border-[#1a1a1c] p-0.5">
                        <img src="https://ui-avatars.com/api/?name=Admin&background=0c0c0d&color=4dffc5" className="rounded-full" alt="P" />
                    </div>
                </aside>

                <main className="flex-1 overflow-y-auto custom-scrollbar p-12">
                    <header className="flex justify-between items-end mb-16 px-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-[#1a1a1c] text-[#4dffc5] text-[10px] px-2 py-0.5 border border-[#4dffc5]/20 uppercase font-black tracking-widest">v4.0.2_stable</span>
                                <span className="text-[#4e4e52] text-[10px] font-bold uppercase tracking-widest">/ terminal / main</span>
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tighter text-[#fafafa] uppercase">Operational <span className="text-[#4dffc5]">Intelligence</span></h1>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-[#4e4e52] uppercase tracking-widest mb-1">Latency</p>
                            <p className="text-xl font-black text-[#4dffc5]">1.04<span className="text-[10px] text-[#4e4e52] ml-1">MS</span></p>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {[
                            { id: 'SYS-01', label: 'Nodes Active', val: '42', neon: '#4dffc5' },
                            { id: 'SYS-02', label: 'Ecosystem Load', val: '18%', neon: '#ff4d4d' },
                            { id: 'SYS-03', label: 'Elisa Queue', val: '0', neon: '#4dccff' }
                        ].map((c, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={i}
                                className="bg-[#111112] border border-[#1a1a1c] p-8 relative overflow-hidden group hover:border-[#1a1a1c]/40 transition-colors"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] translate-x-12 -translate-y-12 rotate-45"></div>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_var(--neon)]" style={{ backgroundColor: c.neon, '--neon': c.neon } as any}></div>
                                    <span className="text-[9px] font-black uppercase text-[#4e4e52] tracking-widest">{c.id} // {c.label}</span>
                                </div>
                                <h2 className="text-5xl font-black text-[#fafafa] tracking-tighter">{c.val}</h2>
                                <div className="mt-4 flex gap-1 h-1">
                                    {Array.from({ length: 12 }).map((_, j) => (
                                        <div key={j} className={`flex-1 ${j < 4 ? 'bg-[#4dffc5]' : 'bg-[#1a1a1c]'}`}></div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-3 bg-[#111112] border border-[#1a1a1c] p-8 h-96 flex flex-col">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#fafafa]">Real-time Transaction Matrix</h3>
                                <div className="flex gap-4 lowercase text-[10px] font-bold text-[#4e4e52]">
                                    <span className="text-[#4dffc5]">● verified</span>
                                    <span>○ pending</span>
                                </div>
                            </div>
                            <div className="flex-1 grid grid-cols-12 gap-2 content-end">
                                {Array.from({ length: 96 }).map((_, i) => (
                                    <div key={i} className={`h-4 rounded-[2px] ${Math.random() > 0.8 ? 'bg-[#4dffc5] shadow-[0_0_10px_rgba(77,255,197,0.3)]' : 'bg-[#1a1a1c]'}`}></div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-[#111112] border border-[#1a1a1c] p-8 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#fafafa] mb-8 italic italic-bold underline-offset-4 decoration-[#4dffc5] underline">Protocol Elisa</h3>
                                <div className="space-y-6">
                                    <div className="border-l-2 border-[#4dffc5] pl-4">
                                        <p className="text-[10px] text-[#4e4e52] mb-1">REQ_9042</p>
                                        <p className="text-[12px] font-bold text-[#e1e2e6]">Limpieza Sala VIP.</p>
                                    </div>
                                    <div className="border-l-2 border-[#4e4e52] pl-4">
                                        <p className="text-[10px] text-[#4e4e52] mb-1">REQ_9043</p>
                                        <p className="text-[12px] font-bold text-[#4e4e52]">Pago verificado.</p>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full py-4 bg-transparent border border-[#1a1a1c] text-[#fafafa] text-[10px] font-black uppercase tracking-[0.3em] hover:border-[#4dffc5] hover:text-[#4dffc5] transition-all">Execute Core</button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
