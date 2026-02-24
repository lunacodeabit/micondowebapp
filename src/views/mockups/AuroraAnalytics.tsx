import React from 'react';
import { Icon } from '../../components/ui/Icon';

/**
 * CONCEPT 1: Aurora Intelligence
 * High-end analytics with animated mesh gradients and deep glassmorphism.
 * Philosophy: Nano Banana Pro (Maximum WOW, Minimal Waste)
 */
export const AuroraAnalytics = () => {
    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white p-8 relative overflow-hidden font-['Outfit']">
            {/* Animated Mesh Gradient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse delay-700"></div>
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full animate-pulse delay-1000"></div>
            </div>

            <main className="max-w-7xl mx-auto relative z-10">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight">Aurora <span className="text-blue-400">Intelligence</span></h1>
                        <p className="text-neutral-400 mt-1">Real-time ecosystem command center</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-5 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/10 transition-all text-sm font-medium">Export Report</button>
                        <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] rounded-xl transition-all text-sm font-bold">Deep Audit</button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[
                        { label: 'Active Users', value: '12,482', trend: '+12%', icon: 'users' },
                        { label: 'Total Revenue', value: '$84,200', trend: '+5.4%', icon: 'dollar-sign' },
                        { label: 'Uptime', value: '99.99%', trend: 'Stable', icon: 'activity' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl hover:border-white/20 transition-all group overflow-hidden relative">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-neutral-400 font-medium mb-1">{stat.label}</p>
                                    <h2 className="text-3xl font-bold">{stat.value}</h2>
                                    <p className={`text-xs mt-2 ${stat.trend.includes('+') ? 'text-green-400' : 'text-blue-400'}`}>{stat.trend}</p>
                                </div>
                                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
                                    <Icon name={stat.icon as any} size={24} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 h-96 flex flex-col justify-end relative overflow-hidden">
                        <div className="absolute top-8 left-8">
                            <h3 className="text-xl font-bold mb-1">Growth Trajectory</h3>
                            <p className="text-sm text-neutral-400">Monthly active resident engagement</p>
                        </div>
                        {/* Fake Chart Visualization */}
                        <div className="flex items-end gap-2 h-40">
                            {[40, 60, 45, 80, 55, 90, 100, 85, 95, 110, 105, 120].map((h, i) => (
                                <div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:opacity-80 cursor-pointer" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 overflow-hidden">
                        <h3 className="text-xl font-bold mb-6">Omnichannel Elisa Feedback</h3>
                        <div className="space-y-4">
                            {[
                                { user: 'Apto 402B', msg: 'Solicito limpieza de áreas comunes.', status: 'Processing' },
                                { user: 'Apto 101A', msg: 'Reserva confirmada para Piscina.', status: 'Completed' },
                                { user: 'Apto 305C', msg: 'Duda con el recibo de mantenimiento.', status: 'Escalated' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs">
                                            {item.user.slice(0, 2)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{item.user}</p>
                                            <p className="text-xs text-neutral-400 truncate w-40">{item.msg}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${item.status === 'Escalated' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                                        }`}>
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
