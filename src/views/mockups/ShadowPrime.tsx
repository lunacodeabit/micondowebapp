import React from 'react';
import { Icon } from '../../components/ui/Icon';
import { motion } from 'framer-motion';

/**
 * CONCEPT 12: Shadow Prime
 * High-End Interactive Dashboard (Sample 3 Style).
 * Focus on large headers, dark surface depth, and premium accents.
 */
export const ShadowPrime = () => {
    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-['Geist Sans', 'Inter'] antialiased">
            {/* Horizontal Top-Bar Nav */}
            <nav className="h-20 border-b border-white/5 px-12 flex items-center justify-between bg-[#09090b]/80 backdrop-blur-2xl sticky top-0 z-50">
                <div className="flex items-center gap-12">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-black text-black">M</div>
                        <span className="text-lg font-black tracking-tighter uppercase italic">MiCondo <span className="text-neutral-600 font-medium">OS</span></span>
                    </div>
                    <div className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-neutral-500">
                        <span className="text-white cursor-pointer transition-colors shadow-[0_2px_0_white]">Dashboard</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Properties</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Financials</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Security</span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-[11px] font-black uppercase tracking-widest text-[#a855f7] bg-purple-500/5 px-3 py-1.5 rounded-lg border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                        Master Brain Active
                    </div>
                    <div className="w-10 h-10 rounded-full border border-white/10 p-0.5">
                        <div className="w-full h-full rounded-full bg-gradient-to-tr from-purple-500 to-blue-500"></div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-12">
                {/* Hero Header */}
                <header className="mb-20 relative">
                    <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/10 blur-[100px] pointer-events-none rounded-full"></div>
                    <div className="flex justify-between items-end relative z-10">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-neutral-500 mb-6">Operations Hub</p>
                            <h1 className="text-7xl font-black tracking-tighter leading-[0.9] mb-8">WELCOME BACK, <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/40">HOWARD.</span></h1>
                            <p className="text-xl text-neutral-400 font-medium tracking-tight max-w-xl">Track your earnings, manage your ecosystem activity and conversion protocol in real-time.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-[#18181b] border border-white/5 px-6 py-3 rounded-2xl flex items-center gap-4 text-xs font-bold text-neutral-400">
                                <Icon name="calendar" size={16} />
                                Jan 1 - Jun 7 2026
                            </div>
                            <button className="bg-[#a855f7] hover:bg-[#c084fc] text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_20px_40px_rgba(168,85,247,0.2)] transition-all active:scale-95">
                                Add Property +
                            </button>
                        </div>
                    </div>
                </header>

                {/* Key Metrics Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        { label: 'Total Revenue', val: '$1.2M', trend: '+12.4%', grow: true },
                        { label: 'Active Tasks', val: '24', trend: 'Optimal', grow: true },
                        { label: 'System Uptime', val: '99.9%', trend: 'Stable', grow: false }
                    ].map((m, i) => (
                        <div key={i} className="bg-[#18181b] border border-white/5 rounded-[32px] p-10 hover:bg-[#1c1c21] transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-6">{m.label}</p>
                            <div className="flex items-baseline gap-4">
                                <h3 className="text-4xl font-black tracking-tight underline decoration-white/10 underline-offset-8 decoration-4">{m.val}</h3>
                                <span className={`text-[11px] font-bold ${m.grow ? 'text-green-500' : 'text-blue-500'}`}>{m.trend}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Panel: Statistics */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-[#18181b] border border-white/5 rounded-[32px] p-10 shadow-2xl">
                            <div className="flex justify-between items-center mb-12">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight text-white mb-2 underline decoration-purple-500/30 underline-offset-4">Statistics Overview</h3>
                                    <p className="text-xs font-bold text-neutral-500">Your average conversion: 95%</p>
                                </div>
                                <div className="flex gap-2">
                                    {['7D', '14D', '1M', '1Y'].map(t => (
                                        <button key={t} className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${t === '14D' ? 'bg-white text-black border-white' : 'border-white/5 text-neutral-500 hover:text-white'
                                            }`}>{t}</button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-64 flex items-end justify-between gap-4 border-b border-white/5 pb-8">
                                {Array.from({ length: 24 }).map((_, i) => (
                                    <div key={i} className="flex-1 space-y-2 flex flex-col items-center group">
                                        <div className="w-full bg-white/5 rounded-full relative overflow-hidden flex-1 max-w-[8px]">
                                            <div className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-full group-hover:from-purple-400 group-hover:to-pink-400 transition-all" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
                                        </div>
                                        <span className="text-[9px] font-bold text-neutral-700 group-hover:text-neutral-400 transition-colors">{i + 1} Jan</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-8 mt-8">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 bg-purple-500 rounded-sm"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Revenue</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Visits</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#18181b] border border-white/5 rounded-[32px] p-10 flex justify-between items-center">
                            <div>
                                <h4 className="text-lg font-black text-white mb-2">Pending Proposals</h4>
                                <p className="text-xs font-medium text-neutral-500 italic">"You need to check 5 project assignments."</p>
                            </div>
                            <button className="text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-colors flex items-center gap-2">
                                View all <Icon name="arrow-right" size={12} />
                            </button>
                        </div>
                    </div>

                    {/* Right Panel: Side Stats */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-[#18181b] border border-white/5 rounded-[32px] p-10">
                            <h3 className="text-sm font-black uppercase tracking-widest text-white mb-8 border-b border-white/5 pb-4">Infrastructure Health</h3>
                            <div className="space-y-8">
                                {[
                                    { label: 'Brazil Node', p: 82.2 },
                                    { label: 'Dominican Node', p: 94.5 },
                                    { label: 'Global Edge', p: 100 },
                                    { label: 'AI Processor', p: 44.2 }
                                ].map((row, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-center text-[11px] font-bold text-neutral-500 mb-3">
                                            <span>{row.label}</span>
                                            <span className="text-white">{row.p}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.3)]" style={{ width: `${row.p}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-[#18181b] to-black border border-white/5 rounded-[32px] p-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#a855f7] mb-6">Security Protocol</p>
                            <h4 className="text-2xl font-black tracking-tight mb-4">RLS ISOLATION <br /> ACTIVE.</h4>
                            <p className="text-xs font-medium text-neutral-500 leading-relaxed mb-10 italic">"Garantizando la integridad multi-tenant en cada consulta."</p>
                            <div className="w-full aspect-square border-2 border-dashed border-white/5 rounded-full flex items-center justify-center p-8 relative">
                                <div className="w-full h-full border border-white/10 rounded-full animate-pulse"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Icon name="shield" size={48} className="text-white opacity-20" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
