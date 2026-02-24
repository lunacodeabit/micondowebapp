import React from 'react';
import { Icon } from '../components/ui/Icon';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/**
 * High-End Landing Page
 * Style: Aura-Shadow Fusion (V5)
 * Purpose: First touchpoint for MiCondo Ecosystem.
 */
export const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#070709] text-[#eef0f3] font-['Geist Sans', 'Inter'] overflow-x-hidden antialiased selection:bg-purple-600/40">
            {/* Background Structural Lighting */}
            <div className="fixed top-[-10%] right-[-5%] w-[50%] h-[50%] bg-purple-600/10 blur-[130px] rounded-full animate-pulse pointer-events-none"></div>
            <div className="fixed bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-blue-600/10 blur-[130px] rounded-full opacity-60 pointer-events-none"></div>

            <div className="max-w-[1700px] mx-auto p-10 lg:p-14 relative z-10">
                {/* Header */}
                <header className="flex justify-between items-center mb-16 px-4">
                    <div className="flex items-center gap-12">
                        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-10 h-10 bg-white rounded-[12px] flex items-center justify-center font-black text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-all">M</div>
                            <div>
                                <h1 className="text-xl font-black tracking-tighter uppercase leading-none text-white">MiCondo <span className="text-neutral-600 font-medium">OS</span></h1>
                                <p className="text-[10px] font-black tracking-[0.4em] text-purple-500 mt-1">CORE PROTOCOL v4.2</p>
                            </div>
                        </div>
                        <nav className="hidden xl:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-neutral-500">
                            <span className="text-white cursor-pointer hover:opacity-80 transition-opacity border-b-2 border-purple-500 pb-1">Platform</span>
                            <span className="cursor-pointer hover:text-white transition-colors">Ecosystem</span>
                            <span className="cursor-pointer hover:text-white transition-colors">Intelligence</span>
                            <span className="cursor-pointer hover:text-white transition-colors">Security</span>
                        </nav>
                    </div>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/login')}
                            className="hidden md:block text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
                        >
                            Investor Portal
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-white/10 border border-white/10 px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest text-white hover:bg-white/20 transition-all"
                        >
                            Sign In
                        </button>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="mb-20 px-4">
                    <div className="max-w-4xl">
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[11px] font-black uppercase tracking-[0.5em] text-neutral-500 mb-8"
                        >
                            Next-Gen Property OS
                        </motion.p>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-7xl lg:text-[100px] font-black tracking-tighter leading-[0.85] mb-10 text-white"
                        >
                            ORCHESTRATE YOUR <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-white to-neutral-800">CONDOMINIUM.</span>
                        </motion.h2>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col md:flex-row md:items-center gap-8"
                        >
                            <p className="text-lg text-neutral-400 font-medium tracking-tight max-w-xl leading-relaxed">
                                Autonomous management for high-end residential real estate. Unified control, financial precision, and resident satisfaction at scale.
                            </p>
                            <div className="hidden md:block h-10 w-px bg-white/10"></div>
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-white text-black px-10 py-5 rounded-[20px] font-black text-xs uppercase tracking-widest shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all text-center"
                            >
                                Launch Ecosystem Dashboard
                            </button>
                        </motion.div>
                    </div>
                </section>

                {/* Visual Showcase (Glassmorphism Cards) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-1">
                    <div className="lg:col-span-8 bg-[#121216]/50 backdrop-blur-xl border border-white/5 rounded-[40px] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-5 animate-pulse">
                            <Icon name="activity" size={80} />
                        </div>
                        <div className="flex justify-between items-center mb-16 relative z-10">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">Management Intelligence</h3>
                                <p className="text-[11px] font-bold text-neutral-500">Real-time sync across all residential units</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="px-6 py-3 bg-black/40 border border-white/5 rounded-2xl flex items-baseline gap-3">
                                    <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Efficiency</span>
                                    <span className="text-sm font-black text-green-500">+100%</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16 relative z-10">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-4">Inventory Integrity</p>
                                <h4 className="text-5xl font-black tracking-tighter text-white select-none">Units Cap: 4k</h4>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-4">Financial Flow</p>
                                <h4 className="text-5xl font-black tracking-tighter text-neutral-300">99.2% Pay</h4>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-4">Elisa AI Logic</p>
                                <h4 className="text-5xl font-black tracking-tighter text-purple-500">Autonomous</h4>
                            </div>
                        </div>

                        {/* Visual graph placeholder */}
                        <div className="h-48 flex items-end justify-between gap-1 border-t border-white/[0.03] pt-12 relative z-10">
                            {Array.from({ length: 48 }).map((_, i) => (
                                <div key={i} className="flex-1 bg-white/[0.02] rounded-full relative group cursor-crosshair h-full">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.sin(i * 0.2) * 30 + 50}%` }}
                                        className="absolute bottom-0 w-full bg-gradient-to-t from-purple-600/40 to-white/10 rounded-full group-hover:from-purple-500 transition-all"
                                    ></motion.div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-[#121216]/50 backdrop-blur-xl border border-white/5 rounded-[40px] p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"></div>
                            <div className="relative z-10">
                                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-8">System Pulse</h3>
                                <div className="space-y-6">
                                    {[
                                        { label: 'Blockchain Security', p: 100, color: 'bg-white' },
                                        { label: 'AI Resolution Cap', p: 84, color: 'bg-purple-500' },
                                        { label: 'Network Uptime', p: 99, color: 'bg-blue-500' }
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
                            <div className="mt-12 bg-black/40 border border-white/5 rounded-[24px] p-6 relative z-10 flex items-center justify-between group-hover:border-white/20 transition-all cursor-pointer" onClick={() => navigate('/login')}>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Autonomous Node</p>
                                    <p className="text-xs font-bold text-white mt-1">Ready for connection</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-tr from-purple-700 to-[#121216] border border-white/5 rounded-[40px] p-10 shadow-lg relative overflow-hidden group cursor-pointer" onClick={() => navigate('/login')}>
                            <div className="absolute top-[-40px] right-[-40px] w-48 h-48 bg-white/5 blur-3xl rounded-full group-hover:bg-white/10 transition-all"></div>
                            <div className="relative z-10">
                                <h4 className="text-3xl font-black tracking-tighter text-white mb-4 line-clamp-2">Autonomous <br /> Elite Care.</h4>
                                <p className="text-xs font-medium text-white/50 leading-relaxed mb-10">Our AI infrastructure handles 99.8% of daily property events with surgical precision.</p>
                                <button className="w-full bg-white text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-neutral-100 transition-colors">
                                    Enter Portal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-neutral-700">
                    <div className="flex gap-12">
                        <span className="hover:text-neutral-300 cursor-pointer transition-colors text-neutral-500">Institutional</span>
                        <span className="hover:text-neutral-300 cursor-pointer transition-colors text-neutral-500">Privacy Policy</span>
                        <span className="hover:text-neutral-300 cursor-pointer transition-colors text-neutral-500">Infrastructure Security</span>
                    </div>
                    <span className="text-neutral-800">MiCondo Ecosystem OS — 2026</span>
                </footer>
            </div>
        </div>
    );
};
