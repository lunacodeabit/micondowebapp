import React from 'react';
import { Icon } from '../../components/ui/Icon';
import { motion } from 'framer-motion';

/**
 * CONCEPT 11: Soft Orbit
 * Airy, Pastel, and Organic Dashboard (Sample 2 Style).
 * Focus on massive white-space, 32px corners, and bubbly data blocks.
 */
export const SoftOrbit = () => {
    return (
        <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-['Plus Jakarta Sans', 'Inter'] p-10 antialiased selection:bg-blue-100 selection:text-blue-900">
            <div className="max-w-[1600px] mx-auto bg-[#f8f8fa] border border-white rounded-[48px] shadow-[0_40px_100px_rgba(0,0,0,0.05)] overflow-hidden flex min-h-[90vh]">

                {/* Slim Nav Sidebar */}
                <aside className="w-24 border-r border-neutral-100 flex flex-col items-center py-12 gap-12 bg-white/50 backdrop-blur-sm">
                    <div className="w-12 h-12 bg-black rounded-[18px] flex items-center justify-center text-white text-lg font-black shadow-lg shadow-black/10">
                        O
                    </div>
                    <div className="flex flex-col gap-10 text-neutral-300">
                        <Icon name="layout" size={24} className="text-black" />
                        <Icon name="activity" size={24} className="hover:text-black cursor-pointer transition-colors" />
                        <Icon name="users" size={24} className="hover:text-black cursor-pointer transition-colors" />
                        <Icon name="calendar" size={24} className="hover:text-black cursor-pointer transition-colors" />
                        <Icon name="settings" size={24} className="hover:text-black cursor-pointer transition-colors" />
                    </div>
                    <div className="mt-auto w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-200 to-blue-200 border-2 border-white shadow-sm"></div>
                </aside>

                <main className="flex-1 p-16 flex flex-col">
                    {/* Header */}
                    <header className="flex justify-between items-center mb-16">
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Good morning, Alexandra</h1>
                            <p className="text-neutral-400 font-semibold text-sm">You have <span className="text-black">3 pending assemblies</span> for today.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white px-6 py-3 rounded-full border border-neutral-100 shadow-sm flex items-center gap-3 w-80 group">
                                <Icon name="search" size={18} className="text-neutral-300 group-focus-within:text-black transition-colors" />
                                <input type="text" placeholder="Search insights..." className="border-none outline-none text-sm w-full font-medium" />
                            </div>
                            <div className="w-12 h-12 bg-white border border-neutral-100 rounded-full flex items-center justify-center shadow-sm relative cursor-pointer">
                                <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 border-2 border-white rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                                <Icon name="bell" size={20} className="text-neutral-500" />
                            </div>
                        </div>
                    </header>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        {[
                            { label: 'Occupancy Rate', val: '94.2%', trend: '+2.4%', color: 'from-blue-50 to-blue-100/50', accent: 'text-blue-600' },
                            { label: 'Service Requests', val: '124', trend: '-14%', color: 'from-purple-50 to-purple-100/50', accent: 'text-purple-600' },
                            { label: 'Active Leases', val: '86', trend: '+3.0%', color: 'from-pink-50 to-pink-100/50', accent: 'text-pink-600' }
                        ].map((s, i) => (
                            <div key={i} className={`bg-gradient-to-br ${s.color} border border-white rounded-[40px] p-10 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 cursor-pointer`}>
                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <span className="text-xs font-black uppercase tracking-widest text-neutral-400">{s.label}</span>
                                    <div className={`px-3 py-1 bg-white rounded-full text-[10px] font-black ${s.accent} shadow-sm`}>{s.trend}</div>
                                </div>
                                <h3 className="text-6xl font-black tracking-tighter mb-4">{s.val}</h3>
                                <div className="flex items-end gap-1.5 h-16">
                                    {Array.from({ length: 15 }).map((_, j) => (
                                        <div key={j} className="flex-1 bg-white/40 rounded-full" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Content Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
                        <div className="lg:col-span-8 bg-white border border-neutral-50 rounded-[48px] p-12 shadow-[0_20px_60px_rgba(0,0,0,0.02)]">
                            <div className="flex justify-between items-center mb-12">
                                <h2 className="text-2xl font-black tracking-tight">Main Infrastructure Pipeline</h2>
                                <Icon name="more-horizontal" size={20} className="text-neutral-300" />
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-[10px] font-black uppercase tracking-widest text-neutral-300 border-b border-neutral-50">
                                            <th className="text-left pb-6">Asset Location</th>
                                            <th className="text-left pb-6">Status</th>
                                            <th className="text-left pb-6">Priority</th>
                                            <th className="text-left pb-6">Health</th>
                                            <th className="text-right pb-6">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-50">
                                        {[
                                            { loc: 'Block A - 402', status: 'Operational', priority: 'High', health: 98 },
                                            { loc: 'Pool System', status: 'Maintenance', priority: 'Normal', health: 64 },
                                            { loc: 'Main Entrance', status: 'Operational', priority: 'Critical', health: 100 },
                                            { loc: 'Solar Field', status: 'Optimal', priority: 'Normal', health: 92 }
                                        ].map((row, i) => (
                                            <tr key={i} className="group cursor-pointer hover:bg-neutral-50 transition-colors">
                                                <td className="py-6 font-bold text-sm">{row.loc}</td>
                                                <td className="py-6">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${row.status === 'Operational' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                                                        }`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td className="py-6 text-[11px] font-bold text-neutral-400">{row.priority}</td>
                                                <td className="py-6">
                                                    <div className="w-24 h-2 bg-neutral-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-black rounded-full" style={{ width: `${row.health}%` }}></div>
                                                    </div>
                                                </td>
                                                <td className="py-6 text-right">
                                                    <Icon name="external-link" size={16} className="ml-auto text-neutral-200 group-hover:text-black transition-colors" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="lg:col-span-4 bg-[#f1f1f4] rounded-[48px] p-12 relative overflow-hidden">
                            <h3 className="text-xl font-black tracking-tight mb-8">Platform Insights</h3>
                            <div className="space-y-6">
                                {[
                                    { label: 'LinkedIn', p: 82, color: 'bg-blue-600' },
                                    { label: 'Direct Sync', p: 44, color: 'bg-purple-600' },
                                    { label: 'Legacy Import', p: 12, color: 'bg-black' }
                                ].map((row, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                                            <span>{row.label}</span>
                                            <span>{row.p}%</span>
                                        </div>
                                        <div className="h-3 w-full bg-white rounded-full p-0.5 shadow-inner">
                                            <div className={`h-full ${row.color} rounded-full`} style={{ width: `${row.p}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-20 p-8 bg-white rounded-[32px] shadow-xl shadow-black/5">
                                <h4 className="text-sm font-black mb-4 uppercase tracking-widest">Active System Control</h4>
                                <p className="text-xs text-neutral-400 font-bold mb-6 italic leading-relaxed">"Now I can manage all units with a single professional interface."</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-neutral-200"></div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-widest">Howard T.</p>
                                        <p className="text-[9px] font-bold text-neutral-300">Admin_Lead</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
