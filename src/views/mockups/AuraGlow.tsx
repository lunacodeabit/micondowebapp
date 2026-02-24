import React from 'react';
import { Icon } from '../../components/ui/Icon';
import { motion } from 'framer-motion';

/**
 * CONCEPT 10: Aura Glow
 * Deep Dark with High Depth (Puzzlebot Style).
 * Focus on layered shadows, external glows, and vibrant accents.
 */
export const AuraGlow = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0e] text-[#e0e0e6] font-['Inter'] p-8 selection:bg-purple-500/30">
            {/* Background Decorative Glows */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Area */}
                <header className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#15151e] border border-white/5 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                            <div className="w-5 h-5 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-sm rotate-45"></div>
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-white leading-none">MiCondo Aura</h1>
                            <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mt-1">Property OS v4.0</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-[#15151e] border border-white/5 rounded-xl flex items-center gap-2 text-xs font-bold shadow-inner">
                            <Icon name="search" size={14} className="text-neutral-500" />
                            <span className="text-neutral-400">Search commands...</span>
                        </div>
                        <div className="w-10 h-10 bg-[#15151e] border border-white/5 rounded-xl flex items-center justify-center cursor-pointer hover:border-purple-500/50 transition-colors">
                            <Icon name="bell" size={18} />
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Sidebar/Quick Actions */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="bg-[#15151e] border border-white/5 rounded-[24px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-6">Autonomous Elisa</h3>
                            <div className="space-y-3">
                                {[
                                    { label: 'Automatic assignment', active: true, color: 'bg-green-500' },
                                    { label: 'Help me categorize', active: false, color: 'bg-neutral-700' },
                                    { label: 'AI Presence', active: true, color: 'bg-purple-500' }
                                ].map((row, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/[0.02]">
                                        <span className="text-[12px] font-bold">{row.label}</span>
                                        <div className={`w-8 h-4 ${row.active ? 'bg-purple-500/20' : 'bg-neutral-800'} rounded-full relative p-0.5`}>
                                            <div className={`w-3 h-3 rounded-full ${row.active ? 'bg-purple-500 ml-auto' : 'bg-neutral-600'}`}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-[#15151e]/50 border border-white/5 rounded-[24px] p-6 overflow-hidden relative group cursor-pointer">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[40px] group-hover:bg-purple-500/10 transition-all"></div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-4">Resident Sentiment</p>
                            <div className="flex items-end gap-1 h-12 mb-4">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div key={i} className="flex-1 bg-white/[0.03] rounded-t-sm relative">
                                        <div className="absolute bottom-0 w-full bg-purple-500/30 rounded-t-sm" style={{ height: `${Math.random() * 100}%` }}></div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs font-bold text-white">98.2% Positive</p>
                        </div>
                    </div>

                    {/* Main Dashboard Panel */}
                    <div className="lg:col-span-6 space-y-6">
                        <div className="bg-[#15151e] border border-white/5 rounded-[32px] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10">
                                <Icon name="puzzle" size={32} className="text-purple-500 opacity-20" />
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-neutral-500 mb-6 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]"></div>
                                Financial Highlights
                            </h2>

                            <div className="grid grid-cols-2 gap-12 mb-10">
                                <div>
                                    <p className="text-xs font-bold text-neutral-400 mb-2">Portfolio Value</p>
                                    <h3 className="text-4xl font-black tracking-tight text-white">$1,240,610</h3>
                                    <p className="text-[11px] font-bold text-green-500 mt-2">↑ 12.4% vs last month</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-neutral-400 mb-2">Net Revenue</p>
                                    <h3 className="text-4xl font-black tracking-tight text-white">$42k</h3>
                                    <p className="text-[11px] font-bold text-purple-400 mt-2">Optimal Threshold</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1 p-4 bg-black/40 border border-white/[0.03] rounded-2xl flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Cash In</span>
                                    <span className="text-sm font-black text-white">$31,000</span>
                                </div>
                                <div className="flex-1 p-4 bg-black/40 border border-white/[0.03] rounded-2xl flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Cash Out</span>
                                    <span className="text-sm font-black text-white">$4,200</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-[#15151e] border border-white/5 rounded-[24px] p-8 space-y-6 hover:bg-[#1a1a24] transition-colors cursor-pointer group">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Icon name="users" size={24} className="text-blue-500" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-white mb-2">Manage Community</h4>
                                    <p className="text-xs text-neutral-500 font-medium">Access full resident logs and verification status.</p>
                                </div>
                            </div>
                            <div className="bg-[#15151e] border border-white/5 rounded-[24px] p-8 space-y-6 hover:bg-[#1a1a24] transition-colors cursor-pointer group">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Icon name="calendar" size={24} className="text-purple-500" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-white mb-2">Event Scheduler</h4>
                                    <p className="text-xs text-neutral-500 font-medium">Coordinate assemblies and major maintenance flows.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Info Panel */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-[#15151e] border border-white/5 rounded-[24px] p-8 shadow-xl">
                            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-8">System Health</h3>
                            <div className="space-y-8">
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[11px] font-bold text-neutral-400">Database Uptime</span>
                                        <span className="text-[11px] font-bold text-white">99.9%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                                        <div className="h-full w-[99%] bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[11px] font-bold text-neutral-400">Sync Capacity</span>
                                        <span className="text-[11px] font-bold text-white">12%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                                        <div className="h-full w-[12%] bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-[32px] text-white relative overflow-hidden group">
                            <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/10 blur-[40px] rounded-full"></div>
                            <h4 className="text-2xl font-black tracking-tighter mb-4 leading-tight">Master Brain <br /> Ecosystem.</h4>
                            <p className="text-xs font-bold text-white/80 mb-6 leading-relaxed">Active node syncing with global resolution services.</p>
                            <button className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
                                Sync Now
                            </button>
                        </div>
                    </div>
                </div>

                {/* Horizontal Divider Navigation */}
                <footer className="mt-20 border-t border-white/5 pt-12 flex justify-between items-center text-[11px] font-bold text-neutral-600 uppercase tracking-[0.3em]">
                    <div className="flex gap-12">
                        <span className="text-neutral-400 cursor-pointer hover:text-white transition-colors">Infrastructure</span>
                        <span className="cursor-pointer hover:text-white transition-colors">Accounting</span>
                        <span className="cursor-pointer hover:text-white transition-colors">Legal</span>
                    </div>
                    <span>Security Protocol v1.4</span>
                </footer>
            </div>
        </div>
    );
};
