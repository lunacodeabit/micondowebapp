import React, { useState, useEffect } from 'react';
import { Icon } from '../components/ui/Icon';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ui/ThemeToggle';

/**
 * MiCondo OS — Landing Page Oficial de Próxima Generación
 * Arte: Dark Luxury PropTech / Aura-Shadow Fusion
 * Todo el contenido, métricas y terminología provienen del concepto original de MiCondo.
 */
export const LandingPage = () => {
    const navigate = useNavigate();

    // Mouse Spotlight reactivo
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, clientY } = e;
        mouseX.set(clientX);
        mouseY.set(clientY);
    };

    // Tilt 3D para la Consola Central
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg']);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg']);

    const handleCardTilt = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXPos = e.clientX - rect.left;
        const mouseYPos = e.clientY - rect.top;
        const xPct = mouseXPos / width - 0.5;
        const yPct = mouseYPos / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleCardLeave = () => {
        x.set(0);
        y.set(0);
    };

    // Simulación de telemetría de red activa
    const [activePings, setActivePings] = useState(48);
    useEffect(() => {
        const interval = setInterval(() => {
            setActivePings(prev => (prev === 48 ? 49 : 48));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div
            onMouseMove={handleMouseMove}
            className="min-h-screen bg-[#070709] text-[#eef0f3] font-sans selection:bg-purple-600/40 selection:text-white relative overflow-x-hidden antialiased"
        >
            {/* 1. AMBIENT MESH GRADIENT LIGHTING */}
            <div className="fixed top-[-15%] right-[-10%] w-[65vw] h-[65vw] bg-radial from-purple-600/15 via-indigo-600/5 to-transparent blur-[140px] pointer-events-none rounded-full animate-pulse duration-1000" />
            <div className="fixed bottom-[-15%] left-[-10%] w-[60vw] h-[60vw] bg-radial from-blue-600/15 via-cyan-600/5 to-transparent blur-[140px] pointer-events-none rounded-full" />
            <div className="fixed top-[40%] left-[25%] w-[40vw] h-[40vw] bg-radial from-purple-900/10 to-transparent blur-[160px] pointer-events-none rounded-full" />

            {/* Subtle Grid Texture Overlay */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.035]"
                style={{
                    backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                    backgroundSize: '48px 48px'
                }}
            />

            <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10 py-8">
                {/* 2. NAVIGATION BAR */}
                <header className="flex justify-between items-center mb-16 lg:mb-24 py-4 px-6 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-10">
                        {/* Brand Logo */}
                        <div
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="flex items-center gap-3.5 cursor-pointer group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white via-neutral-200 to-neutral-400 flex items-center justify-center font-black text-black shadow-[0_0_25px_rgba(255,255,255,0.3)] group-hover:scale-105 group-hover:shadow-[0_0_35px_rgba(168,85,247,0.5)] transition-all duration-300">
                                M
                            </div>
                            <div>
                                <h1 className="text-lg font-black tracking-tighter uppercase leading-none text-white flex items-center gap-1.5">
                                    MiCondo <span className="text-purple-400 font-medium text-xs tracking-widest px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">OS</span>
                                </h1>
                                <p className="text-[9px] font-black tracking-[0.35em] text-neutral-400 uppercase mt-0.5">
                                    Core Protocol v4.2
                                </p>
                            </div>
                        </div>

                        {/* Navigation Items */}
                        <nav className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400">
                            <a href="#plataforma" className="text-white hover:text-purple-400 transition-colors cursor-pointer border-b border-purple-500/60 pb-0.5">
                                Plataforma
                            </a>
                            <a href="#ecosistema" className="hover:text-white transition-colors cursor-pointer">
                                Ecosistema
                            </a>
                            <a href="#inteligencia" className="hover:text-white transition-colors cursor-pointer">
                                Inteligencia
                            </a>
                            <a href="#seguridad" className="hover:text-white transition-colors cursor-pointer">
                                Seguridad
                            </a>
                        </nav>
                    </div>

                    {/* Actions & Buttons */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span>Red Operativa</span>
                        </div>

                        <ThemeToggle />

                        <button
                            onClick={() => navigate('/login')}
                            className="hidden sm:block text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-colors cursor-pointer px-3 py-2"
                        >
                            Acceso Clientes
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="relative group overflow-hidden px-6 py-2.5 rounded-xl bg-white text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <span>Iniciar Sesión</span>
                                <Icon name="arrow-right" className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                    </div>
                </header>

                {/* 3. HERO SECTION */}
                <section className="mb-20 lg:mb-28 px-2 sm:px-4">
                    <div className="max-w-5xl">
                        {/* Protocol Pill */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl mb-8 shadow-inner"
                        >
                            <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7] animate-pulse" />
                            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] text-neutral-300">
                                Sistema Operativo de Próxima Generación
                            </span>
                        </motion.div>

                        {/* Kinetic Headline */}
                        <motion.h2
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="text-6xl sm:text-8xl lg:text-[108px] font-black tracking-tighter leading-[0.88] mb-10 text-white select-none"
                        >
                            ORQUESTA TU <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-white to-neutral-400">
                                CONDOMINIO.
                            </span>
                        </motion.h2>

                        {/* Subtitle & Hero CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="flex flex-col md:flex-row md:items-center gap-8 lg:gap-12"
                        >
                            <p className="text-base sm:text-xl text-neutral-400 font-normal tracking-tight max-w-xl leading-relaxed">
                                Gestión autónoma para activos inmobiliarios de alta gama. Control unificado, precisión financiera y satisfacción del residente a escala.
                            </p>
                            <div className="hidden md:block h-14 w-px bg-white/15" />
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-8 py-4.5 rounded-2xl bg-gradient-to-r from-white via-neutral-100 to-neutral-200 text-black font-black text-xs uppercase tracking-widest shadow-[0_20px_50px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 hover:shadow-[0_25px_60px_rgba(255,255,255,0.25)] transition-all duration-300 text-center cursor-pointer flex items-center justify-center gap-2 group"
                                >
                                    <span>Acceder al Dashboard</span>
                                    <Icon name="arrow-right" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* 4. TILT 3D SHOWCASE CONSOLE (Aura-Shadow Fusion) */}
                <section id="plataforma" className="mb-24">
                    <motion.div
                        style={{
                            rotateX: rotateX,
                            rotateY: rotateY,
                            transformStyle: 'preserve-3d',
                        }}
                        onMouseMove={handleCardTilt}
                        onMouseLeave={handleCardLeave}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8 transition-transform duration-200 ease-out"
                    >
                        {/* Main Telemetry & Intelligence Console */}
                        <div className="lg:col-span-8 bg-[#101015]/80 backdrop-blur-2xl border border-white/10 rounded-[36px] sm:rounded-[44px] p-8 sm:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.7)] relative overflow-hidden group">
                            {/* Ambient card spotlight */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/20 transition-all duration-700" />
                            <div className="absolute top-8 right-8 text-white/[0.04] pointer-events-none group-hover:text-white/[0.08] transition-colors">
                                <Icon name="activity" size={110} />
                            </div>

                            {/* Console Header */}
                            <div className="flex flex-wrap justify-between items-center gap-4 mb-14 relative z-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                        <h3 className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-white">
                                            Inteligencia de Gestión
                                        </h3>
                                    </div>
                                    <p className="text-xs font-semibold text-neutral-400">
                                        Sincronización en tiempo real en todas las unidades residenciales
                                    </p>
                                </div>
                                <div className="px-5 py-2.5 bg-black/60 border border-white/10 rounded-2xl flex items-baseline gap-2.5 shadow-inner">
                                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Eficiencia</span>
                                    <span className="text-base font-black text-emerald-400 font-mono">+100%</span>
                                </div>
                            </div>

                            {/* Live Metrics Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 mb-14 relative z-10 border-y border-white/[0.06] py-10">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500 mb-3">
                                        Integridad de Inventario
                                    </p>
                                    <h4 className="text-4xl sm:text-5xl font-black tracking-tight text-white select-none">
                                        Cap: 4k <span className="text-2xl text-neutral-500 font-light">Unidades</span>
                                    </h4>
                                    <span className="text-[11px] text-emerald-400 font-mono mt-1 inline-block">● 100% Auditado</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500 mb-3">
                                        Flujo Financiero
                                    </p>
                                    <h4 className="text-4xl sm:text-5xl font-black tracking-tight text-neutral-200 select-none">
                                        99.2% <span className="text-2xl text-neutral-500 font-light">Pagos</span>
                                    </h4>
                                    <span className="text-[11px] text-blue-400 font-mono mt-1 inline-block">● Conciliación Inmediata</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500 mb-3">
                                        Lógica Elisa AI
                                    </p>
                                    <h4 className="text-4xl sm:text-5xl font-black tracking-tight text-purple-400 select-none">
                                        Autónoma
                                    </h4>
                                    <span className="text-[11px] text-purple-400 font-mono mt-1 inline-block">● Resuelve 24/7</span>
                                </div>
                            </div>

                            {/* Animated Visual Graph / Telemetry Bars */}
                            <div className="relative z-10">
                                <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-3">
                                    <span>Frecuencia Operativa en Vivo</span>
                                    <span className="text-neutral-400">{activePings} Nodos Conectados</span>
                                </div>
                                <div className="h-36 flex items-end justify-between gap-1.5 pt-6 border-t border-white/[0.04]">
                                    {Array.from({ length: 48 }).map((_, i) => (
                                        <div key={i} className="flex-1 bg-white/[0.02] rounded-full relative group cursor-crosshair h-full overflow-hidden">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{
                                                    height: `${Math.sin(i * 0.25) * 35 + 55}%`,
                                                }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                    repeatType: 'reverse',
                                                    delay: i * 0.02,
                                                }}
                                                className="absolute bottom-0 w-full bg-gradient-to-t from-purple-600/50 via-indigo-500/30 to-white/20 rounded-full group-hover:from-purple-400 transition-all duration-300"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Stack Cards (System Pulse & Elite Care) */}
                        <div className="lg:col-span-4 space-y-8 flex flex-col justify-between">
                            {/* Card: Pulso del Sistema */}
                            <div className="bg-[#101015]/80 backdrop-blur-2xl border border-white/10 rounded-[36px] sm:rounded-[44px] p-8 sm:p-10 shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent pointer-events-none" />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xs font-black uppercase tracking-[0.25em] text-neutral-400">
                                            Pulso del Sistema
                                        </h3>
                                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                                            OPERATIVO
                                        </span>
                                    </div>

                                    <div className="space-y-6">
                                        {[
                                            { label: 'Seguridad de Datos', p: 100, color: 'bg-white', glow: 'shadow-[0_0_12px_rgba(255,255,255,0.4)]' },
                                            { label: 'Resolución por AI', p: 84, color: 'bg-purple-500', glow: 'shadow-[0_0_12px_rgba(168,85,247,0.5)]' },
                                            { label: 'Tiempo en Línea', p: 99.9, color: 'bg-blue-500', glow: 'shadow-[0_0_12px_rgba(59,130,246,0.5)]' }
                                        ].map((row, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-wider mb-2.5">
                                                    <span className="text-neutral-400">{row.label}</span>
                                                    <span className="text-white font-mono">{row.p}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
                                                    <div
                                                        className={`h-full ${row.color} ${row.glow} rounded-full transition-all duration-1000`}
                                                        style={{ width: `${row.p}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Active Node Pill */}
                                <div
                                    onClick={() => navigate('/login')}
                                    className="mt-10 bg-black/50 border border-white/10 rounded-2xl p-5 relative z-10 flex items-center justify-between hover:border-purple-500/40 hover:bg-black/70 transition-all cursor-pointer group/node"
                                >
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 group-hover/node:text-purple-400 transition-colors">
                                            Nodo Autónomo
                                        </p>
                                        <p className="text-xs font-bold text-white mt-0.5">Listo para conexión</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                                        <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-ping" />
                                    </div>
                                </div>
                            </div>

                            {/* Card: Cuidado de Elite Autónomo */}
                            <div
                                onClick={() => navigate('/login')}
                                className="bg-gradient-to-br from-purple-900/60 via-[#121218] to-[#0a0a0e] border border-purple-500/20 hover:border-purple-400/50 rounded-[36px] sm:rounded-[44px] p-8 sm:p-10 shadow-2xl relative overflow-hidden group cursor-pointer transition-all duration-300"
                            >
                                <div className="absolute top-[-30px] right-[-30px] w-48 h-48 bg-purple-500/20 blur-3xl rounded-full group-hover:scale-125 transition-transform duration-500" />
                                <div className="relative z-10">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 text-purple-300">
                                        <Icon name="shield-check" className="w-5 h-5" />
                                    </div>
                                    <h4 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-3 leading-tight">
                                        Cuidado de Elite <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
                                            Autónomo.
                                        </span>
                                    </h4>
                                    <p className="text-xs font-normal text-neutral-400 leading-relaxed mb-8">
                                        Nuestra plataforma inteligente automatiza la gestión diaria de tu propiedad con precisión quirúrgica y eficiencia.
                                    </p>
                                    <button className="w-full py-4 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest shadow-xl group-hover:bg-neutral-100 transition-all flex items-center justify-center gap-2">
                                        <span>Entrar al Portal</span>
                                        <Icon name="arrow-right" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* 5. ECOSYSTEM PILLARS SECTION */}
                <section id="ecosistema" className="mb-24 pt-12 border-t border-white/[0.06]">
                    <div className="max-w-3xl mb-14">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400 mb-2 block">
                            Arquitectura Distribuida
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                            Tres niveles jerárquicos perfectamente sincronizados
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                tag: 'Nivel 01 • Orquestador',
                                title: 'SuperAdmin SaaS',
                                desc: 'Control maestro de empresas administradoras, cobro de licencias, monitoreo de infraestructura y despacho de comunicaciones globales.',
                                icon: 'shield-check',
                                color: 'text-purple-400'
                            },
                            {
                                tag: 'Nivel 02 • Operador',
                                title: 'Panel de Administración',
                                desc: 'Gestión multicondominio, cobranza en tiempo real, conciliación bancaria, cuentas por pagar y asambleas con quórum automático.',
                                icon: 'building-2',
                                color: 'text-blue-400'
                            },
                            {
                                tag: 'Nivel 03 • Ocupante',
                                title: 'Portal del Residente',
                                desc: 'Visualización de estados de cuenta, notificación de cuotas con comprobante bancario, incidentes y reservas de áreas sociales.',
                                icon: 'user-check',
                                color: 'text-emerald-400'
                            }
                        ].map((pillar, idx) => (
                            <div
                                key={idx}
                                className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] hover:border-white/20 transition-all duration-300 relative group"
                            >
                                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-4 block">
                                    {pillar.tag}
                                </span>
                                <div className={`w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-6 ${pillar.color}`}>
                                    <Icon name={pillar.icon} className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{pillar.title}</h3>
                                <p className="text-xs text-neutral-400 leading-relaxed font-normal">{pillar.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 6. CALL TO ACTION FOOTER */}
                <footer className="pt-16 pb-8 border-t border-white/[0.08]">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-black text-sm">
                                M
                            </div>
                            <span className="font-black text-white text-sm tracking-widest uppercase">MiCondo OS</span>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-8 text-[11px] font-black uppercase tracking-[0.25em] text-neutral-400">
                            <span className="hover:text-white cursor-pointer transition-colors">Institucional</span>
                            <span className="hover:text-white cursor-pointer transition-colors">Política de Privacidad</span>
                            <span className="hover:text-white cursor-pointer transition-colors">Seguridad de Infraestructura</span>
                        </div>

                        <button
                            onClick={() => navigate('/login')}
                            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                        >
                            Acceder al Portal →
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-neutral-600 border-t border-white/[0.04] pt-6">
                        <span>MiCondo Ecosystem OS — 2026</span>
                        <span>Protocolo v4.2 • Cifrado de Extremo a Extremo</span>
                    </div>
                </footer>
            </div>
        </div>
    );
};
