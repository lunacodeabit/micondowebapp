import React from 'react';
import { Icon } from '../../components/ui/Icon';
import { motion } from 'framer-motion';

/**
 * CONCEPT 7: Cobalt Precision
 * The peak of "Industrial SaaS" (Linear/Vercel style).
 * Focused on 1px lines, cobalt accents, and ultra-high density.
 */
export const CobaltPrecision = () => {
    return (
        <div className="min-h-screen bg-[#080809] text-[#ced1d5] font-['Inter'] flex antialiased">
            {/* Minimal Sidebar Navigation */}
            <aside className="w-64 border-r border-[#1f1f23] flex flex-col bg-[#0c0c0d]">
                <div className="p-6 h-14 border-b border-[#1f1f23] flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-600 rounded-sm flex items-center justify-center text-[10px] text-white">M</div>
                    <span className="text-sm font-bold tracking-tight text-white">MiCondo <span className="text-neutral-600 font-medium">Pro</span></span>
                </div>
                <div className="flex-1 p-4 space-y-1">
                    {[
                        { icon: 'layout', label: 'Ecosystem', active: true },
                        { icon: 'users', label: 'Tenants', active: false },
                        { icon: 'calendar', label: 'Assemblies', active: false },
                        { icon: 'mail', label: 'Messages', active: false },
                        { icon: 'activity', label: 'Audit Log', active: false },
                    ].map((item, i) => (
                        <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors cursor-pointer ${item.active ? 'bg-[#1f1f23] text-white' : 'text-neutral-500 hover:text-neutral-200 hover:bg-white/5'
                            }`}>
                            <Icon name={item.icon as any} size={16} />
                            {item.label}
                        </div>
                    ))}
                </div>
                <div className="p-6 border-t border-[#1f1f23]">
                    <div className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-600/30 flex items-center justify-center text-[10px] text-blue-400 font-bold">H</div>
                            <span className="text-[12px] font-bold text-neutral-400 group-hover:text-white transition-colors">Howard</span>
                        </div>
                        <Icon name="chevron-up" size={14} className="text-neutral-600" />
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-[#080809]">
                <header className="h-14 border-b border-[#1f1f23] px-8 flex items-center justify-between sticky top-0 bg-[#080809]/80 backdrop-blur-md z-20">
                    <div className="text-[12px] font-medium text-neutral-500 flex items-center gap-2">
                        <span className="hover:text-neutral-200 cursor-pointer transition-colors">Home</span>
                        <span className="text-[#1f1f23]">/</span>
                        <span className="text-neutral-200">Infrastructure Dashboard</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="h-6 w-px bg-[#1f1f23]"></div>
                        <div className="flex items-center gap-2 text-[12px] font-bold text-neutral-500 cursor-pointer hover:text-white transition-colors">
                            <Icon name="search" size={14} />
                            Search <span className="bg-[#1f1f23] px-1.5 py-0.5 rounded text-[10px] text-neutral-600 ml-1">⌘K</span>
                        </div>
                    </div>
                </header>

                <div className="p-12 max-w-6xl">
                    <div className="flex justify-between items-end mb-12">
                        <h1 className="text-3xl font-bold tracking-tight text-white">Infrastructure Overview</h1>
                        <button className="bg-white text-black px-4 py-2 rounded-md text-[13px] font-bold hover:bg-neutral-200 transition-all flex items-center gap-2">
                            <Icon name="plus" size={14} />
                            New Node
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mb-12 border border-[#1f1f23] rounded-lg overflow-hidden">
                        {[
                            { label: 'Uptime', val: '99.99%', trend: '+0.01', color: 'text-green-500' },
                            { label: 'API Health', val: 'Optimal', trend: 'Stable', color: 'text-blue-500' },
                            { label: 'Latency', val: '24ms', trend: '-2ms', color: 'text-green-500' }
                        ].map((s, i) => (
                            <div key={i} className="bg-[#0c0c0d] p-6 hover:bg-[#111112] transition-colors border-r last:border-r-0 border-[#1f1f23]">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-2">{s.label}</p>
                                <h2 className="text-2xl font-bold text-white mb-2">{s.val}</h2>
                                <p className={`text-[11px] font-bold ${s.color}`}>{s.trend}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-[#0c0c0d] border border-[#1f1f23] rounded-lg overflow-hidden mb-8">
                        <div className="p-6 border-b border-[#1f1f23] flex justify-between items-center bg-[#0e0e0f]">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Icon name="activity" size={16} className="text-blue-500" />
                                Recent Ecosystem Activities
                            </h3>
                            <span className="text-[11px] font-bold text-neutral-500 cursor-pointer hover:text-white transition-colors">View all</span>
                        </div>
                        <div className="divide-y divide-[#1f1f23]">
                            {[
                                { title: 'User Verification', user: 'Admin', node: 'Node_Dominican_Rep', status: 'Success' },
                                { title: 'PDF Generation', user: 'Elisa_Bot', node: 'Node_AWS_East', status: 'Processing' },
                                { title: 'RLS Policy Refresh', user: 'System', node: 'Edge_Central', status: 'Success' }
                            ].map((row, i) => (
                                <div key={i} className="p-6 flex items-center justify-between hover:bg-[#0e0e0f] transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-md bg-[#1f1f23] flex items-center justify-center text-white">
                                            <Icon name="cube" size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-white mb-0.5">{row.title}</p>
                                            <p className="text-[11px] text-neutral-500">Initiated by {row.user} on {row.node}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${row.status === 'Success' ? 'border-green-500/20 text-green-500' : 'border-blue-500/20 text-blue-500'
                                            }`}>
                                            {row.status}
                                        </span>
                                        <Icon name="more-horizontal" size={16} className="text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] font-medium text-neutral-600">
                        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> All systems operating normally</span>
                        <span className="text-neutral-800">|</span>
                        <span>Updated 2 minutes ago</span>
                    </div>
                </div>
            </main>
        </div>
    );
};
