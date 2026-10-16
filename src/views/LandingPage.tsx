import React, { useState } from 'react';
import { Icon } from '../components/ui/Icon';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useNavigate } from 'react-router-dom';

/**
 * Landing Page Oficial B2B: MiCondo SaaS
 * Propósito: Captación y venta de la plataforma a Administradoras de Condominios (PMCs)
 * Contexto: República Dominicana (RD$, Ley 5038, Banco Popular/BHD, DGII)
 */
export const LandingPage = () => {
    const navigate = useNavigate();

    // Estado de la calculadora interactiva
    const [condoCount, setCondoCount] = useState<number>(3);
    const pricePerCondo = condoCount >= 8 ? 1200 : condoCount >= 3 ? 1500 : 1800;
    const monthlyTotal = condoCount * pricePerCondo;

    // Estado del formulario de captación de leads SaaS
    const [leadForm, setLeadForm] = useState({
        companyName: '',
        contactName: '',
        phone: '',
        email: '',
        currentCondos: '3-5',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleSubmitLead = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Guardar prospecto en almacenamiento local y sincronizar
            const existing = JSON.parse(localStorage.getItem('micondo_saas_demo_leads') || '[]');
            const newLead = {
                id: 'lead-' + Date.now(),
                ...leadForm,
                createdAt: new Date().toISOString()
            };
            existing.unshift(newLead);
            localStorage.setItem('micondo_saas_demo_leads', JSON.stringify(existing));

            // Simulación de envío exitoso
            setTimeout(() => {
                setIsSubmitting(false);
                setSubmitSuccess(true);
            }, 600);
        } catch {
            setIsSubmitting(false);
            setSubmitSuccess(true);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fb] dark:bg-[#0b0f17] text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-200 antialiased selection:bg-blue-600/20 selection:text-blue-700 dark:selection:text-blue-300">
            {/* Top Announcement Bar */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-xs font-semibold py-2 px-4 text-center tracking-wide flex items-center justify-center gap-2">
                <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider">
                    🇩🇴 PropTech RD
                </span>
                <span>Software diseñado bajo la Ley 5038 y normas contables de República Dominicana</span>
                <a href="#demo-form" className="underline font-bold hover:text-white/80 transition-colors ml-1 hidden sm:inline">
                    Comenzar prueba gratis →
                </a>
            </div>

            {/* Navigation Header */}
            <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                            <Icon name="building-2" className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
                                    MICONDO
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">
                                    SaaS
                                </span>
                            </div>
                            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium tracking-tight">Software de Gestión para Administradoras</p>
                        </div>
                    </div>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                        <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Funcionalidades</a>
                        <a href="#calculator" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Calculadora</a>
                        <a href="#pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Planes</a>
                        <a href="#faq" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Preguntas</a>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <button
                            onClick={() => navigate('/login')}
                            className="text-xs font-bold px-4 py-2.5 rounded-xl text-neutral-700 dark:text-neutral-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                        >
                            Acceso Portal
                        </button>
                        <a
                            href="#demo-form"
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer hidden sm:inline-block"
                        >
                            Solicitar Demo
                        </a>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-16 pb-20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                            <span>Plataforma Cloud para Administradoras de Condominios</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-neutral-900 dark:text-white leading-[1.1] mb-6">
                            Multiplica la rentabilidad de tu <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                                Administradora de Condominios
                            </span>
                        </h1>

                        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal mb-8">
                            Automatiza la cobranza de cuotas en <strong className="text-neutral-900 dark:text-white font-semibold">pesos dominicanos (RD$)</strong>, estados de cuenta bancarios en tiempo real, actas de asamblea digitales con IA y un portal móvil que a tus residentes les encantará.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <a
                                href="#demo-form"
                                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>Probar Gratis por 14 Días</span>
                                <Icon name="arrow-right" className="w-4 h-4" />
                            </a>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Icon name="login" className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span>Ingresar al Portal Demostración</span>
                            </button>
                        </div>

                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-4 font-medium">
                            ✓ Sin tarjeta de crédito requerida • ✓ Soporte e inducción personalizada en RD • ✓ Cumplimiento DGII
                        </p>
                    </div>

                    {/* Hero Feature Badges */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-neutral-200/80 dark:border-neutral-800">
                        {[
                            { label: 'Conciliación Bancaria', desc: 'Popular, BHD, Reservas', icon: 'credit-card' },
                            { label: 'Efectividad Cobro', desc: '98.4% Cobranza a tiempo', icon: 'trending-up' },
                            { label: 'Ley 5038 y DGII', desc: 'Asambleas y 606/607', icon: 'file-text' },
                            { label: 'Elisa AI Copilot', desc: 'Respuestas automáticas 24/7', icon: 'sparkles' },
                        ].map((b, i) => (
                            <div key={i} className="p-4 rounded-xl bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs text-left">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 font-bold">
                                    <Icon name={b.icon} className="w-4 h-4" />
                                </div>
                                <h4 className="text-xs font-bold text-neutral-900 dark:text-white leading-tight">{b.label}</h4>
                                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Interactive Calculator Section */}
            <section id="calculator" className="py-16 bg-white dark:bg-[#111827] border-y border-neutral-200/80 dark:border-neutral-800 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-10">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 block">
                            Calculadora de Inversión
                        </span>
                        <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                            ¿Cuánto cuesta MiCondo para tu empresa?
                        </h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                            Precios claros en pesos dominicanos. Sin costos ocultos. Paga solo por condominio que administres.
                        </p>
                    </div>

                    <div className="max-w-2xl mx-auto bg-neutral-50 dark:bg-[#161b26] p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                    Número de Condominios que Administras:
                                </label>
                                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-4 py-1 rounded-xl border border-blue-200/60 dark:border-blue-900">
                                    {condoCount} {condoCount === 1 ? 'Edificio' : 'Edificios'}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                value={condoCount}
                                onChange={(e) => setCondoCount(parseInt(e.target.value))}
                                className="w-full h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-[10px] text-neutral-400 dark:text-neutral-500 font-bold mt-2">
                                <span>1 Edificio</span>
                                <span>5 Edificios</span>
                                <span>10 Edificios</span>
                                <span>20+ Edificios</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-white dark:bg-[#111827] border border-neutral-200/80 dark:border-neutral-800 mb-6">
                            <div>
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Costo por Condominio</span>
                                <p className="text-xl font-black text-neutral-900 dark:text-white mt-0.5">
                                    RD$ {pricePerCondo.toLocaleString()} <span className="text-xs font-normal text-neutral-400">/mes</span>
                                </p>
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Incluye soporte local</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Total Mensual Estimado</span>
                                <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
                                    RD$ {monthlyTotal.toLocaleString()} <span className="text-xs font-normal text-neutral-400">/mes</span>
                                </p>
                                <span className="text-[10px] text-neutral-500 font-medium">Factura con NCF disponible</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-200/60 dark:border-neutral-800">
                            <span>Ahorro estimado en horas de gestión:</span>
                            <span className="font-bold text-neutral-900 dark:text-white">~{condoCount * 12} horas / mes</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Showcase */}
            <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 block">
                        Todo lo que Necesita una Administradora
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
                        Construido para el día a día real de tu equipo
                    </h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-3">
                        Olvídate de las hojas de Excel dispersas y los recibos perdidos por WhatsApp. Centraliza toda tu operación en un solo lugar.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            title: 'Cobranza Automatizada & Recibos',
                            desc: 'Envía avisos de cobro por correo y WhatsApp. Los residentes adjuntan comprobantes bancarios y el sistema calcula balances y recargos por mora en RD$.',
                            icon: 'credit-card',
                            badge: 'Cobro Puntual'
                        },
                        {
                            title: 'Portal de Residente (Sin Descarga)',
                            desc: 'Una WebApp elegante donde cada propietario consulta su balance, reporta incidencias, reserva áreas sociales y descarga recibos oficiales.',
                            icon: 'home',
                            badge: 'Cero Fricción'
                        },
                        {
                            title: 'Cuentas por Pagar & Proveedores',
                            desc: 'Control de pagos a EDESUR, CAASD, empresas de seguridad, limpieza y mantenimiento con programación de vencimientos.',
                            icon: 'calculator',
                            badge: 'Control Total'
                        },
                        {
                            title: 'Asambleas Digitales & Votación',
                            desc: 'Calcula el quórum ponderado según las cuotas de participación de la Ley 5038, votaciones transparentes y actas formales en PDF.',
                            icon: 'file-text',
                            badge: 'Ley 5038'
                        },
                        {
                            title: 'Elisa AI: Asistente Virtual 24/7',
                            desc: 'Inteligencia artificial que responde preguntas frecuentes de los residentes sobre reglamentos del condominio y estados de cuenta.',
                            icon: 'bot',
                            badge: 'Inteligencia Artificial'
                        },
                        {
                            title: 'Reportería Fiscal para DGII',
                            desc: 'Reportes de gastos clasificados para formularios 606 y 607 listos para tu contador o auditoría de junta directiva.',
                            icon: 'shield-check',
                            badge: 'Cumplimiento Fiscal'
                        },
                    ].map((feat, idx) => (
                        <div
                            key={idx}
                            className="bg-white dark:bg-[#161b26] p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs hover:border-blue-500/50 transition-all flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                                        <Icon name={feat.icon} className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                                        {feat.badge}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">{feat.title}</h3>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{feat.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 bg-neutral-100/60 dark:bg-[#111827] border-y border-neutral-200/80 dark:border-neutral-800 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 block">
                            Planes Flexibles
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
                            Tarifas diseñadas para escalar con tu cartera
                        </h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                            Comienza con 1 condominio y expande a medida que tu empresa capta nuevos clientes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Plan Básico */}
                        <div className="bg-white dark:bg-[#161b26] p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex flex-col justify-between">
                            <div>
                                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Para Emprendedores</span>
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mt-1">Plan Básico</h3>
                                <div className="mt-4 mb-6">
                                    <span className="text-4xl font-black text-neutral-900 dark:text-white">RD$ 1,800</span>
                                    <span className="text-xs text-neutral-400"> /mes /condominio</span>
                                </div>
                                <ul className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
                                    <li className="flex items-center gap-2">✓ Hasta 2 condominios</li>
                                    <li className="flex items-center gap-2">✓ Cobranza y recibos digitales</li>
                                    <li className="flex items-center gap-2">✓ Portal de residentes</li>
                                    <li className="flex items-center gap-2">✓ Cuentas por pagar básicas</li>
                                </ul>
                            </div>
                            <a
                                href="#demo-form"
                                className="mt-8 w-full py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-xs text-center hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors block cursor-pointer"
                            >
                                Seleccionar Básico
                            </a>
                        </div>

                        {/* Plan Pro (Destacado) */}
                        <div className="bg-white dark:bg-[#161b26] p-8 rounded-3xl border-2 border-blue-600 dark:border-blue-500 shadow-xl relative flex flex-col justify-between">
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] uppercase font-black tracking-widest px-3.5 py-1 rounded-full shadow-sm">
                                Más Popular
                            </div>
                            <div>
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Para Empresas PMCs</span>
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mt-1">Plan Profesional</h3>
                                <div className="mt-4 mb-6">
                                    <span className="text-4xl font-black text-neutral-900 dark:text-white">RD$ 1,500</span>
                                    <span className="text-xs text-neutral-400"> /mes /condominio</span>
                                </div>
                                <ul className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
                                    <li className="flex items-center gap-2 font-semibold">✓ De 3 a 10 condominios</li>
                                    <li className="flex items-center gap-2 font-semibold">✓ Notificaciones por WhatsApp</li>
                                    <li className="flex items-center gap-2 font-semibold">✓ Asambleas Digitales Ley 5038</li>
                                    <li className="flex items-center gap-2 font-semibold">✓ Asistente Elisa AI para residentes</li>
                                    <li className="flex items-center gap-2 font-semibold">✓ Soporte prioritario por WhatsApp</li>
                                </ul>
                            </div>
                            <a
                                href="#demo-form"
                                className="mt-8 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center shadow-md shadow-blue-600/20 transition-all block cursor-pointer"
                            >
                                Probar Plan Profesional
                            </a>
                        </div>

                        {/* Plan Enterprise */}
                        <div className="bg-white dark:bg-[#161b26] p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex flex-col justify-between">
                            <div>
                                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Gran Escala</span>
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mt-1">Enterprise</h3>
                                <div className="mt-4 mb-6">
                                    <span className="text-4xl font-black text-neutral-900 dark:text-white">RD$ 1,200</span>
                                    <span className="text-xs text-neutral-400"> /mes /condominio</span>
                                </div>
                                <ul className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
                                    <li className="flex items-center gap-2">✓ Más de 10 condominios o torres grandes</li>
                                    <li className="flex items-center gap-2">✓ Marca Blanca (Tu Logo & Dominio)</li>
                                    <li className="flex items-center gap-2">✓ Migración asistida desde Excel</li>
                                    <li className="flex items-center gap-2">✓ Capacitación a tu equipo</li>
                                    <li className="flex items-center gap-2">✓ Acuerdos de nivel de servicio (SLA)</li>
                                </ul>
                            </div>
                            <a
                                href="#demo-form"
                                className="mt-8 w-full py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-xs text-center hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors block cursor-pointer"
                            >
                                Contactar Ventas Enterprise
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Lead Capture Form Section */}
            <section id="demo-form" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-[#161b26] p-8 sm:p-12 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xl">
                    <div className="text-center max-w-2xl mx-auto mb-8">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 block">
                            Empieza Hoy
                        </span>
                        <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                            Solicita tu Demostración y 14 Días Gratis
                        </h2>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                            Te mostraremos cómo configurar tu primera torre en 15 minutos y digitalizar tus cobros de inmediato.
                        </p>
                    </div>

                    {submitSuccess ? (
                        <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto font-bold text-xl">
                                ✓
                            </div>
                            <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
                                ¡Solicitud Recibida con Éxito!
                            </h3>
                            <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-md mx-auto leading-relaxed">
                                Gracias por tu interés en MiCondo. Un especialista en gestión condominal te contactará por WhatsApp para habilitar tu acceso de demostración.
                            </p>
                            <div className="pt-2">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
                                >
                                    Ingresar al Portal Demostración
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmitLead} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                                        Nombre de tu Administradora *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej. Wise Services SRL o Tu Nombre"
                                        value={leadForm.companyName}
                                        onChange={(e) => setLeadForm({ ...leadForm, companyName: e.target.value })}
                                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl p-3 text-neutral-900 dark:text-white text-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                                        Persona de Contacto *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Tu nombre completo"
                                        value={leadForm.contactName}
                                        onChange={(e) => setLeadForm({ ...leadForm, contactName: e.target.value })}
                                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl p-3 text-neutral-900 dark:text-white text-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                                        WhatsApp / Teléfono Móvil *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="829-000-0000"
                                        value={leadForm.phone}
                                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl p-3 text-neutral-900 dark:text-white text-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                                        Correo Electrónico *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="admin@tuempresa.com"
                                        value={leadForm.email}
                                        onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl p-3 text-neutral-900 dark:text-white text-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                                    ¿Cuántos condominios o torres administras actualmente?
                                </label>
                                <select
                                    value={leadForm.currentCondos}
                                    onChange={(e) => setLeadForm({ ...leadForm, currentCondos: e.target.value })}
                                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl p-3 text-neutral-900 dark:text-white text-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                                >
                                    <option value="1-2">1 a 2 Condominios</option>
                                    <option value="3-5">3 a 5 Condominios</option>
                                    <option value="6-10">6 a 10 Condominios</option>
                                    <option value="11+">Más de 10 Condominios</option>
                                    <option value="iniciando">Estoy iniciando mi empresa administradora</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Icon name="loader" className="w-4 h-4 animate-spin" />
                                        <span>Procesando Solicitud...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Solicitar Demostración y Prueba Gratis</span>
                                        <Icon name="arrow-right" className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-16 bg-white dark:bg-[#111827] border-t border-neutral-200/80 dark:border-neutral-800 transition-colors">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-black text-center text-neutral-900 dark:text-white mb-10">
                        Preguntas Frecuentes de Administradoras
                    </h2>

                    <div className="space-y-4">
                        {[
                            {
                                q: '¿Puedo migrar los datos que ya tengo en Excel?',
                                a: 'Sí. Disponemos de plantillas de importación rápida para apartamentos, propietarios y saldos iniciales. Además, nuestro equipo de soporte en República Dominicana te asiste en la carga inicial de tus torres.'
                            },
                            {
                                q: '¿Cómo pagan las cuotas los residentes?',
                                a: 'Los residentes transfieren a la cuenta bancaria de cada condominio (Banco Popular, BHD, Banreservas, etc.) y suben el comprobante o número de confirmación en el portal web desde su celular. El administrador valida el pago con 1 clic.'
                            },
                            {
                                q: '¿Cómo funciona la facturación del software a mi empresa?',
                                a: 'Facturamos mensualmente en pesos dominicanos (RD$) según la cantidad de condominios activos en tu panel. Emitimos comprobante fiscal válido para crédito fiscal (DGII).'
                            },
                            {
                                q: '¿Cumple con la Ley 5038 de Condominios en RD?',
                                a: 'Totalmente. El módulo de asambleas pondera los votos según las cuotas de participación oficiales y genera el acta legal en PDF lista para firma de la junta de vecinos.'
                            }
                        ].map((item, i) => (
                            <div key={i} className="p-5 rounded-2xl bg-neutral-50 dark:bg-[#161b26] border border-neutral-200/70 dark:border-neutral-800">
                                <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-1.5">{item.q}</h4>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-neutral-900 text-neutral-400 py-12 border-t border-neutral-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                            M
                        </div>
                        <div>
                            <p className="font-bold text-white text-sm">MICONDO OS</p>
                            <p className="text-[10px] text-neutral-500">Plataforma SaaS para Administradoras de Condominios</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 text-neutral-400 font-medium">
                        <a href="#features" className="hover:text-white transition-colors">Funcionalidades</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Planes</a>
                        <button onClick={() => navigate('/login')} className="hover:text-white transition-colors cursor-pointer">
                            Acceso Portal
                        </button>
                    </div>

                    <p className="text-neutral-500 text-[11px]">
                        © {new Date().getFullYear()} MiCondo Ecosistema OS. Todos los derechos reservados. Santo Domingo, República Dominicana.
                    </p>
                </div>
            </footer>
        </div>
    );
};
