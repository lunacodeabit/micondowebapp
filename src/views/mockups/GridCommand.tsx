import React from 'react';
import { Icon } from '../../components/ui/Icon';

/**
 * CONCEPT 9: Grid Command
 * Technical structuralism. Vercel style.
 * Focus on visible modular blocks and monolithic precision.
 */
export const GridCommand = () => {
    return (
        <div className="min-h-screen bg-[#000000] text-[#888888] font-['Geist Sans', 'Inter'] selection:bg-white/20 selection:text-white">
            {/* Background Structural Grid */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{
                backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }}></div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <header className="border-b border-white/10 h-16 flex items-center px-10 justify-between bg-black/50 backdrop-blur-xl sticky top-0">
                    <div className="flex items-center gap-10">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-white rounded-sm"></div>
                            <span className="text-white font-extrabold tracking-tighter text-lg uppercase">MiCondo <span className="text-neutral-600 font-medium">OS</span></span>
                        </div>
                        <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium uppercase tracking-[0.1em]">
                            <span className="text-white cursor-pointer hover:opacity-80 transition-opacity">Cloud</span>
                            <span className="cursor-pointer hover:text-white transition-colors">Nodes</span>
                            <span className="cursor-pointer hover:text-white transition-colors">Security</span>
                            <span className="cursor-pointer hover:text-white transition-colors">Docs</span>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-[#111] border border-white/10 rounded-md p-2 hover:border-white/20 cursor-pointer">
                            <Icon name="search" size={16} />
                        </div>
                        <button className="bg-white text-black px-6 py-2 rounded-md font-black text-xs uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all">Command Center</button>
                    </div>
                </header>

                <main className="flex-1 p-10 max-w-7xl mx-auto w-full">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                        <div>
                            <h1 className="text-5xl font-black tracking-tighter text-white mb-2 underline decoration-white/20 underline-offset-8">Ecosystem Metrics</h1>
                            <p className="text-neutral-500 font-medium tracking-tight">Monolithic infrastructure monitoring for MiCondo Global properties.</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded text-[11px] font-bold text-white uppercase tracking-widest">v4.2.1-stable</div>
                            <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded text-[11px] font-bold text-green-500 uppercase tracking-widest">Active</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {[
                            { label: 'Total Revenue', val: '$84.2K', trend: '+12%', color: 'text-white' },
                            { label: 'Active Tenants', val: '1.24k', trend: 'Stable', color: 'text-white' },
                            { label: 'API Uptime', val: '99.99%', trend: 'Optimal', color: 'text-green-500' },
                            { label: 'Threat Level', val: 'Low', trend: 'Secure', color: 'text-white' }
                        ].map((card, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/[0.08] transition-all group">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-6 group-hover:text-neutral-300 transition-colors">{card.label}</p>
                                <h3 className={`text-3xl font-black tracking-tight ${card.color} mb-1`}>{card.val}</h3>
                                <p className="text-[11px] font-bold text-neutral-600">{card.trend}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-xl p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8">
                                <Icon name="activity" size={24} className="text-white opacity-20 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-white mb-10">Real-time Deployment Flow</h3>
                            <div className="flex items-end gap-1 h-48 border-b border-white/10 pb-4">
                                {Array.from({ length: 60 }).map((_, i) => (
                                    <div key={i} className={`flex-1 ${i % 3 === 0 ? 'bg-white' : 'bg-white/10'} hover:bg-white transition-all`} style={{ height: `${Math.sin(i * 0.1) * 40 + 60}%` }}></div>
                                ))}
                            </div>
                            <div className="mt-8 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-neutral-600">
                                <span>Alpha_Node_Dominican</span>
                                <span>Last pulse 2s ago</span>
                            </div>
                        </div>

                        <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-xl flex flex-col">
                            <div className="p-6 border-b border-white/10">
                                <h3 className="text-sm font-black uppercase tracking-widest text-white">System Logs</h3>
                            </div>
                            <div className="flex-1 p-6 space-y-6 font-mono">
                                {[
                                    { type: 'INF', msg: 'Sync completed for Client_042' },
                                    { type: 'WRN', msg: 'Latency threshold reached' },
                                    { type: 'SEC', msg: 'RLS verification success' },
                                    { type: 'BOT', msg: 'Elisa scheduled maintenance' }
                                ].map((log, i) => (
                                    <div key={i} className="text-[11px] leading-tight">
                                        <span className={`mr-3 ${log.type === 'WRN' ? 'text-red-500' : log.type === 'SEC' ? 'text-green-500' : 'text-blue-500'}`}>[{log.type}]</span>
                                        <span className="text-neutral-400">{log.msg}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 border-t border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-all font-bold text-center text-[11px] uppercase tracking-[0.2em] text-white">
                                View system log entry
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="border-t border-white/10 p-10 mt-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-10 opacity-50">
                            <span className="text-[11px] font-bold uppercase tracking-widest">Built to last</span>
                            <span className="text-[11px] font-bold uppercase tracking-widest">mi'condo os v4</span>
                        </div>
                        <div className="flex gap-6 text-[11px] font-bold uppercase tracking-widest text-neutral-600">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">Security</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};
