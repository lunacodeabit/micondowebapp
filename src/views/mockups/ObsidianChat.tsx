import React from 'react';
import { Icon } from '../../components/ui/Icon';

/**
 * CONCEPT 3: Obsidian Elisa Chat
 * Luxury Concierge aesthetics. Deep dark mode with gold accents.
 * Philosophy: Nano Banana Pro (Sensorial Chat)
 */
export const ObsidianChat = () => {
    return (
        <div className="min-h-screen bg-[#010101] text-neutral-300 flex font-['Outfit']">
            {/* Dark Sleek Sidebar */}
            <div className="w-80 border-r border-white/5 bg-black/40 backdrop-blur-3xl p-6 hidden md:flex flex-col">
                <div className="mb-12">
                    <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-2">
                        <span className="w-2 h-8 bg-gradient-to-t from-[#D4AF37] to-[#F7E08B] rounded-full"></span>
                        OBSIDIAN <span className="text-[#D4AF37]">X</span>
                    </h1>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-600 font-bold mt-2">Concierge Ecosystem</p>
                </div>

                <div className="flex-1 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-700 mb-4 px-2">Recent VIP Requests</p>
                    {[
                        { name: 'Dr. Santiago', status: 'Priority', active: true },
                        { name: 'Lic. Mella', status: 'Awaiting', active: false },
                        { name: 'Ing. Torres', status: 'Completed', active: false }
                    ].map((user, i) => (
                        <div key={i} className={`p-4 rounded-2xl flex items-center gap-4 transition-all cursor-pointer ${user.active ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/20 shadow-[0_0_20px_rgba(212,175,55,0.05)]' : 'hover:bg-white/5 border border-transparent'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${user.active ? 'bg-[#D4AF37] text-black' : 'bg-neutral-800 text-neutral-400'}`}>
                                {user.name.slice(0, 2)}
                            </div>
                            <div>
                                <p className={`text-sm font-bold ${user.active ? 'text-white' : 'text-neutral-400'}`}>{user.name}</p>
                                <p className="text-[10px] text-neutral-600">{user.status}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-20">
                    <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] bg-[#D4AF37]/10 blur-[150px] rounded-full"></div>
                </div>

                {/* Header */}
                <header className="p-8 border-b border-white/5 flex justify-between items-center backdrop-blur-md relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#F7E08B] flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                            <Icon name="bot" size={28} className="text-black" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white leading-tight">Elisa Concierge</h2>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Autonomous Luxury Engine</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button className="p-3 bg-white/5 rounded-xl text-neutral-500 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                            <Icon name="phone" size={20} />
                        </button>
                        <button className="px-6 py-3 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all shadow-xl">Take Control</button>
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-12 space-y-8 relative z-10 custom-scrollbar">
                    <div className="flex justify-start">
                        <div className="max-w-[70%] p-6 rounded-[2rem] rounded-tl-none bg-neutral-900/50 backdrop-blur-xl border border-white/5 shadow-2xl">
                            <p className="text-neutral-200 leading-relaxed italic">"Bienvenida a Obsidian Concierge, Residente Howard. Mi nombre es Elisa. ¿Desea que programe el mantenimiento de su unidad o requiere asistencia con una reserva VIP?"</p>
                            <span className="text-[10px] text-neutral-600 block mt-4 font-bold tracking-widest">ELISA • 06:42 PM</span>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <div className="max-w-[70%] p-6 rounded-[2rem] rounded-tr-none bg-gradient-to-tr from-white/10 to-transparent backdrop-blur-2xl border border-white/10">
                            <p className="text-white font-medium">"Hola Elisa, confirma mi reserva del salón VIP para este sábado a las 8 PM. Seremos 6 personas."</p>
                            <span className="text-[10px] text-neutral-500 block mt-4 font-bold tracking-widest text-right">YOU • 06:43 PM</span>
                        </div>
                    </div>

                    <div className="flex justify-start">
                        <div className="max-w-[70%] p-6 rounded-[2rem] rounded-tl-none bg-[#D4AF37]/5 backdrop-blur-xl border border-[#D4AF37]/10 shadow-[inner_0_0_20px_rgba(212,175,55,0.05)]">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon name="check" size={14} className="text-[#D4AF37]" />
                                <span className="text-xs font-bold text-[#D4AF37]">Reserva Confirmada</span>
                            </div>
                            <p className="text-neutral-200 leading-relaxed">Perfecto. Su reserva del **Salón de Diamantes** ha sido procesada. He notificado al personal de seguridad para que el acceso esté listo a las 07:45 PM.</p>
                            <span className="text-[10px] text-neutral-600 block mt-4 font-bold tracking-widest">ELISA • 06:43 PM</span>
                        </div>
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-8 border-t border-white/5 relative z-10 bg-black/20">
                    <div className="max-w-4xl mx-auto flex items-center gap-4">
                        <div className="flex-1 relative group">
                            <input
                                type="text"
                                placeholder="Escriba su comando..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-neutral-600 focus:outline-none focus:border-[#D4AF37]/30 transition-all focus:bg-white/[0.08]"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                <Icon name="mic" size={18} className="text-neutral-600 cursor-pointer hover:text-white transition-colors" />
                                <Icon name="paperclip" size={18} className="text-neutral-600 cursor-pointer hover:text-white transition-colors" />
                            </div>
                        </div>
                        <button className="w-14 h-14 rounded-2xl bg-[#D4AF37] text-black flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:scale-105 transition-transform">
                            <Icon name="send" size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
