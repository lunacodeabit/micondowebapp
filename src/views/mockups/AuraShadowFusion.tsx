import React from 'react';
import { Icon } from '../../components/ui/Icon';
import { motion } from 'framer-motion';

/**
 * CONCEPT 13: Aura-Shadow Fusion
 * The Definitive "WOW" Benchmark. 
 * Combines Depth/Glows of Aura with Authority/Boldness of Shadow.
 */
export const AuraShadowFusion = () => {
    return (
        <div className="min-h-screen bg-[#070709] text-[#eef0f3] font-['Geist Sans', 'Inter'] overflow-x-hidden antialiased selection:bg-purple-600/40">
            {/* Background Structural Lighting (The 'Fusion' Blobs) */}
            <div className="fixed top-[-10%] right-[-5%] w-[50%] h-[50%] bg-purple-600/10 blur-[130px] rounded-full animate-pulse"></div>
            <div className="fixed bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-blue-600/10 blur-[130px] rounded-full opacity-60"></div>

            <div className="max-w-[1700px] mx-auto p-10 lg:p-14 relative z-10">
                {/* Precise Header with Shadow Boldness */}
                <header className="flex justify-between items-center mb-16 px-4">
                    <div className="flex items-center gap-12">
                        <div className="flex items-center gap-4 group cursor-pointer">
                            <div className="w-10 h-10 bg-white rounded-[12px] flex items-center justify-center font-black text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-all">M</div>
                            <div>
                                <h1 className="text-xl font-black tracking-tighter uppercase leading-none text-white">MiCondo <span className="text-neutral-600 font-medium">OS</span></h1>
                                <p className="text-[10px] font-black tracking-[0.4em] text-purple-500 mt-1">CORE PROTOCOL v4.2</p>
                            </div>
                        </div>
                        <nav className="hidden xl:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-neutral-500">
                            <span className="text-white cursor-pointer hover:opacity-80 transition-opacity border-b-2 border-purple-500 pb-1">Insights</span>
                            <span className="cursor-pointer hover:text-white transition-colors">Ecosystem</span>
                            <span className="cursor-pointer hover:text-white transition-colors">Autonomous</span>
                            <span className="cursor-pointer hover:text-white transition-colors">Security</span>
                        </nav>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden lg:flex px-4 py-2 bg-white/5 border border-white/10 rounded-xl items-center gap-3 text-xs font-bold text-neutral-400 group focus-within:border-white/20 transition-all">
                            <Icon name="search" size={14} className="text-neutral-500 group-focus-within:text-purple-400" />
                            <input type="text" placeholder="Search infrastructure..." className="bg-transparent border-none outline-none w-48" />
                            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-neutral-600">⌘K</span>
                        </div>
                        <div className="w-11 h-11 bg-[#121216] border border-white/5 rounded-xl flex items-center justify-center relative cursor-pointer hover:bg-white/5 transition-colors">
                            <div className="absolute top-3 right-3 w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]"></div>
                            <Icon name="bell" size={20} className="text-neutral-400" />
                        </div>
                    </div>
                </header>

                {/* Hero section with Shadow's Giant Typography */}
                <section className="mb-20 px-4">
                    <div className="max-w-4xl">
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[11px] font-black uppercase tracking-[0.5em] text-neutral-500 mb-8"
                        >
                            Global Resolution Node
                        </motion.p>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-7xl lg:text-[100px] font-black tracking-tighter leading-[0.85] mb-10 text-white"
                        >
                            ORCHESTRATE YOUR <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-white to-neutral-800">ECOSYSTEM.</span>
                        </motion.h2>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-8"
                        >
                            <p className="text-lg text-neutral-400 font-medium tracking-tight max-w-xl leading-relaxed">
                                Unified command center for professional condominium management, powered by autonomous intelligence and surgical precision.
                            </p>
                            <div className="h-10 w-px bg-white/10"></div>
                            <button className="bg-white text-black px-10 py-5 rounded-[20px] font-black text-xs uppercase tracking-widest shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all">
                                Launch Center
                            </button>
                        </motion.div>
                    </div>
                </section>

                {/* Dashboard Grid with Aura's Depth */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-1">
                    {/* Left: Financial High-Density Block */}
                    <div className="lg:col-span-8 bg-[#121216] border border-white/5 rounded-[40px] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-5 animate-pulse">
                            <Icon name="activity" size={80} />
                        </div>
                        <div className="flex justify-between items-center mb-16 relative z-10">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">Portfolio Metrics</h3>
                                <p className="text-[11px] font-bold text-neutral-500">Real-time sync across 14 active nodes</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="px-6 py-3 bg-black/40 border border-white/5 rounded-2xl flex items-baseline gap-3">
                                    <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Growth</span>
                                    <span className="text-sm font-black text-green-500">+22.4%</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16 relative z-10">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-4">Total Liquidity</p>
                                <h4 className="text-5xl font-black tracking-tighter text-white select-none">$1,842,610</h4>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-4">Operational Burn</p>
                                <h4 className="text-5xl font-black tracking-tighter text-neutral-300">($8,420)</h4>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-4">Autonomous Yield</p>
                                <h4 className="text-5xl font-black tracking-tighter text-purple-500">$42.3k</h4>
                            </div>
                        </div>

                        {/* Chart Area from Puzzlebot style */}
                        <div className="h-48 flex items-end justify-between gap-1 border-t border-white/[0.03] pt-12 relative z-10">
                            {Array.from({ length: 48 }).map((_, i) => (
                                <div key={i} className="flex-1 bg-white/[0.02] rounded-full relative group cursor-crosshair h-full">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.sin(i * 0.2) * 30 + 50}%` }}
                                        className="absolute bottom-0 w-full bg-gradient-to-t from-purple-600/40 to-white/10 rounded-full group-hover:from-purple-500 transition-all"
                                    ></motion.div>
                                    <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        $ {Math.floor(Math.random() * 100)}k
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Quick Action & Status Blocks */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-[#121216] border border-white/5 rounded-[40px] p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"></div>
                            <div className="relative z-10">
                                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-8">System Health Pulse</h3>
                                <div className="space-y-6">
                                    {[
                                        { label: 'Security Firewall', p: 100, color: 'bg-white' },
                                        { label: 'AI Resolution Speed', p: 84, color: 'bg-purple-500' },
                                        { label: 'Cloud Sync Integrity', p: 92, color: 'bg-blue-500' }
                                    ].map((row, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mb-3">
                                                <span className="text-neutral-500">{row.label}</span>
                                                <span className="text-white">{row.p}%</span>
                                            </div>
                                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div className={`h-full ${row.color} rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]`} style={{ width: `${row.p}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-12 bg-black/40 border border-white/5 rounded-[24px] p-6 relative z-10 flex items-center justify-between group-hover:border-white/20 transition-all cursor-pointer">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Autonomous Admin</p>
                                    <p className="text-xs font-bold text-white mt-1">Status: Optimized</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-tr from-purple-700 to-[#121216] border border-white/5 rounded-[40px] p-10 shadow-lg relative overflow-hidden group">
                            <div className="absolute top-[-40px] right-[-40px] w-48 h-48 bg-white/5 blur-3xl rounded-full group-hover:bg-white/10 transition-all"></div>
                            <div className="relative z-10">
                                <h4 className="text-3xl font-black tracking-tighter text-white mb-4 line-clamp-2">Autonomous <br /> Intelligence.</h4>
                                <p className="text-xs font-medium text-white/50 leading-relaxed mb-10">Elisa is currently processing 1,402 property events with a 99.8% precision score.</p>
                                <button className="w-full bg-white text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-neutral-100 transition-colors">
                                    Enter Flow Mode
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-neutral-700">
                    <div className="flex gap-12">
                        <span className="hover:text-neutral-300 cursor-pointer transition-colors text-neutral-500">Legal</span>
                        <span className="hover:text-neutral-300 cursor-pointer transition-colors text-neutral-500">Privacy</span>
                        <span className="hover:text-neutral-300 cursor-pointer transition-colors text-neutral-500">Security</span>
                    </div>
                    <span className="text-neutral-800">MiCondo Ecosystem OS — 2026</span>
                </footer>
            </div>
        </div>
    );
};
