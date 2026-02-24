import React from 'react';
import { Icon } from '../../components/ui/Icon';
import { motion } from 'framer-motion';

/**
 * CONCEPT 4: Prism Logic
 * Neo-Corporate precision. Stealth wealth design.
 * Philosophy: Linear / Stripe style.
 */
export const PrismLogic = () => {
    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-['Inter'] selection:bg-blue-500/30">
            {/* Subtle Top Gradient */}
            <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>

            <nav className="border-b border-white/5 backdrop-blur-md sticky top-0 z-50 bg-[#09090b]/80">
                <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2 font-bold text-sm tracking-tight">
                            <div className="w-5 h-5 bg-blue-600 rounded-sm flex items-center justify-center text-[10px] shadow-[0_0_15px_rgba(37,99,235,0.3)]">M</div>
                            PRISM <span className="text-neutral-500 font-medium tracking-normal">LOGIC</span>
                        </div>
                        <div className="hidden md:flex items-center gap-6 text-[13px] font-medium text-neutral-500">
                            <span className="text-neutral-200 cursor-pointer">Dashboard</span>
                            <span className="hover:text-neutral-200 cursor-pointer transition-colors">Ecosystem</span>
                            <span className="hover:text-neutral-200 cursor-pointer transition-colors">Tenants</span>
                            <span className="hover:text-neutral-200 cursor-pointer transition-colors">Logs</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[12px] text-neutral-400">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            System Operational
                        </div>
                        <div className="w-8 h-8 rounded-full bg-neutral-800 border border-white/10"></div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
                <header className="mb-12">
                    <div className="flex items-center gap-2 text-[12px] font-semibold text-blue-500 uppercase tracking-widest mb-3">
                        <Icon name="activity" size={14} /> Global Overview
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight mb-4">Ecosystem <span className="text-neutral-500">Health</span></h1>
                    <p className="text-neutral-400 max-w-xl leading-relaxed">High-precision monitoring for MiCondo networks. Real-time data sync with edge computing across all connected properties.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Active Sessions', val: '1,204', trend: '+12.5%', color: 'blue' },
                        { label: 'API Latency', val: '42ms', trend: '-2ms', color: 'green' },
                        { label: 'Transactions', val: '$14.2k', trend: 'Stable', color: 'neutral' },
                        { label: 'Incidents', val: '0', trend: 'Clean', color: 'blue' }
                    ].map((s, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={i}
                            className="bg-neutral-900/50 border border-white/5 p-6 rounded-xl hover:border-white/10 transition-all cursor-default group"
                        >
                            <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-4 group-hover:text-neutral-300 transition-colors">{s.label}</p>
                            <div className="flex items-end justify-between">
                                <h2 className="text-2xl font-bold font-mono tracking-tight">{s.val}</h2>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.color === 'blue' ? 'bg-blue-500/10 text-blue-400' :
                                        s.color === 'green' ? 'bg-green-500/10 text-green-400' : 'bg-neutral-800 text-neutral-500'
                                    }`}>{s.trend}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-8 bg-neutral-900/30 border border-white/5 rounded-2xl p-8 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <h3 className="text-lg font-bold mb-1 group-hover:text-blue-400 transition-colors">Engagement Flow</h3>
                                <p className="text-sm text-neutral-500">Verified resident interactions over 24h</p>
                            </div>
                            <select className="bg-transparent border border-white/10 rounded-md text-[10px] font-bold px-2 py-1 outline-none text-neutral-400 uppercase tracking-widest">
                                <option>Last 24 Hours</option>
                                <option>Last 7 Days</option>
                            </select>
                        </div>
                        {/* High Precision Mock Chart */}
                        <div className="h-64 flex items-end gap-1">
                            {Array.from({ length: 40 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-blue-600/20 group-hover:bg-blue-600/40 transition-all rounded-t-[1px]"
                                    style={{ height: `${Math.sin(i * 0.2) * 30 + 60}%` }}
                                ></div>
                            ))}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5"></div>
                    </div>

                    <div className="md:col-span-4 bg-[#09090b] border border-blue-500/20 rounded-2xl p-6 shadow-[0_0_40px_rgba(37,99,235,0.05)] relative overflow-hidden">
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-600/10 blur-[50px] rounded-full"></div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#fafafa] mb-6 flex items-center gap-2">
                            <div className="w-1 h-3 bg-blue-500"></div> System Elisa
                        </h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/[0.08] transition-all group">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-bold text-neutral-500">EVENT_ID_00{i}</span>
                                        <span className="text-[9px] text-blue-400 font-mono">02:1{i}:42</span>
                                    </div>
                                    <p className="text-[12px] text-neutral-200 leading-tight">Procesando solicitud de mantenimiento para Torre A.</p>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-3 bg-white text-black rounded-lg font-bold text-[12px] uppercase tracking-widest hover:bg-neutral-200 transition-all active:scale-[0.98]">
                            Deep Analysis
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};
