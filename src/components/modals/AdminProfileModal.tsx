import React, { useState, useEffect } from 'react';
import { Icon } from '../ui/Icon';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useCondo } from '../../context/CondoContext';
import { supabase } from '../../supabaseClient';

type AdminProfileModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({ isOpen, onClose }) => {
    const { logout, userRole } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { addToast } = useToast();
    const { condos } = useCondo();

    const [activeTab, setActiveTab] = useState<'profile' | 'saas'>('profile');
    const [fullName, setFullName] = useState('Howard Luna');
    const [phone, setPhone] = useState('+1 (809) 555-0199');
    const [company, setCompany] = useState('Wise Services Dominicana SRL');
    const [email] = useState('admin@micondo.com');
    const [isSaving, setIsSaving] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // SaaS Messaging State
    const [messages, setMessages] = useState<any[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [messageSubject, setMessageSubject] = useState('');
    const [messageContent, setMessageContent] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    useEffect(() => {
        if (isOpen && activeTab === 'saas') {
            fetchMessages();
        }
    }, [isOpen, activeTab]);

    const fetchMessages = async () => {
        setLoadingMessages(true);
        try {
            const { data, error } = await supabase
                .from('saas_messages')
                .select('*')
                .eq('company_id', 'dev-company-id')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setMessages(data);
            } else {
                // Fallback mock conversation if offline
                setMessages([
                    {
                        id: 'msg-welcome',
                        company_id: 'dev-company-id',
                        company_name: 'Wise Services Dominicana SRL',
                        subject: 'Bienvenido a MI CONDO SaaS',
                        content: 'Su cuenta de administración Wise Services Dominicana SRL está activa con Plan Profesional. Para asistencia técnica o soporte fiscal, responda a este hilo.',
                        direction: 'to_client',
                        created_at: new Date().toISOString(),
                    }
                ]);
            }
        } catch (err) {
            console.warn('Error fetching SaaS messages:', err);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageSubject || !messageContent) {
            addToast('Complete el asunto y mensaje', 'error');
            return;
        }

        setSendingMessage(true);
        try {
            const newMsg = {
                company_id: 'dev-company-id',
                company_name: 'Wise Services Dominicana SRL',
                subject: messageSubject,
                content: messageContent,
                direction: 'from_client',
                is_read: false,
                created_at: new Date().toISOString(),
            };

            await supabase.from('saas_messages').insert(newMsg);
            addToast('Mensaje enviado a SuperAdmin correctamente', 'success');
            setMessageSubject('');
            setMessageContent('');
            setMessages(prev => [newMsg, ...prev]);
        } catch (err) {
            console.error('Error sending message to superadmin:', err);
            addToast('Error al enviar mensaje', 'error');
        } finally {
            setSendingMessage(false);
        }
    };

    if (!isOpen) return null;

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            addToast('Perfil actualizado correctamente', 'success');
        }, 500);
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || newPassword.length < 6) {
            addToast('La nueva contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            addToast('Las contraseñas no coinciden', 'error');
            return;
        }
        addToast('Contraseña actualizada con éxito', 'success');
        setIsChangingPassword(false);
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 anime-fade-in">
            <div
                className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden transition-all duration-200 max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="p-6 pb-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                            <Icon name="user" className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-neutral-900 dark:text-white leading-tight">Cuenta de Administrador</h2>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Wise Services Dominicana SRL • PMC</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-300 flex items-center justify-center transition-colors"
                        aria-label="Cerrar"
                    >
                        <Icon name="x" className="w-4 h-4" />
                    </button>
                </div>

                {/* Sub-Tab Selector */}
                <div className="px-6 pt-3 flex gap-2 border-b border-neutral-100 dark:border-neutral-800">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`pb-2.5 px-3 text-xs font-bold transition-all relative ${
                            activeTab === 'profile'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                    >
                        Mi Perfil & Seguridad
                        {activeTab === 'profile' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('saas')}
                        className={`pb-2.5 px-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
                            activeTab === 'saas'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                    >
                        <span>Licencia SaaS & Soporte</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        {activeTab === 'saas' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                        )}
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                    {activeTab === 'profile' && (
                        <>
                            {/* User Card Profile Banner */}
                            <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/60 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md flex-shrink-0">
                                    {fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 text-center sm:text-left min-w-0">
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                                        <h3 className="text-base font-bold text-neutral-900 dark:text-white truncate">{fullName}</h3>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            Activo
                                        </span>
                                    </div>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium truncate">{email}</p>
                                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 font-semibold">
                                        {company} • Administrador General PMC
                                    </p>
                                </div>
                            </div>

                            {/* Basic Info Form */}
                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                                            Nombre Completo
                                        </label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-2xs"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                                            Teléfono / WhatsApp
                                        </label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-2xs"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                                            Correo Electrónico (Principal)
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            disabled
                                            className="w-full bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                                            Empresa Administradora
                                        </label>
                                        <input
                                            type="text"
                                            value={company}
                                            onChange={(e) => setCompany(e.target.value)}
                                            className="w-full bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-2xs"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
                                    >
                                        <Icon name="check" className="w-3.5 h-3.5" />
                                        <span>{isSaving ? 'Guardando...' : 'Guardar Información'}</span>
                                    </button>
                                </div>
                            </form>

                            {/* Preferences & Theme Section */}
                            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
                                    Preferencias de Interfaz
                                </h4>
                                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/60 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Icon name={theme === 'dark' ? 'moon' : 'sun'} className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                                        <div>
                                            <p className="text-xs font-bold text-neutral-900 dark:text-white">Modo de Visualización</p>
                                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                                Tema actual: <span className="font-semibold capitalize text-neutral-800 dark:text-neutral-200">{theme === 'dark' ? 'Oscuro' : 'Claro'}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={toggleTheme}
                                        className="px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:text-blue-600 dark:hover:text-blue-400 shadow-2xs transition-colors"
                                    >
                                        Cambiar a {theme === 'dark' ? 'Claro' : 'Oscuro'}
                                    </button>
                                </div>
                            </div>

                            {/* Password Change Section */}
                            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                            Seguridad
                                        </h4>
                                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">Gestión de contraseña de acceso</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsChangingPassword(!isChangingPassword)}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                    >
                                        {isChangingPassword ? 'Cancelar' : 'Cambiar Contraseña'}
                                    </button>
                                </div>

                                {isChangingPassword && (
                                    <form onSubmit={handleChangePassword} className="space-y-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/60 anime-fade-in">
                                        <div>
                                            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                                                Nueva Contraseña
                                            </label>
                                            <input
                                                type="password"
                                                placeholder="Mínimo 6 caracteres"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                                                Confirmar Nueva Contraseña
                                            </label>
                                            <input
                                                type="password"
                                                placeholder="Repetir nueva contraseña"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                required
                                            />
                                        </div>
                                        <div className="flex justify-end pt-1">
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                                            >
                                                Actualizar Contraseña
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === 'saas' && (
                        <div className="space-y-6">
                            {/* SaaS Plan Status Card */}
                            <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/60 shadow-2xs">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Tu Suscripción</span>
                                        <h3 className="text-lg font-black text-neutral-900 dark:text-white">Plan Profesional (Pro)</h3>
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full">
                                        ● Cuenta al Día
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                                    <div className="p-3 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200/60 dark:border-neutral-700">
                                        <p className="text-neutral-400 text-[10px] uppercase font-semibold">Empresa RNC</p>
                                        <p className="font-bold text-neutral-900 dark:text-white mt-0.5">1-33-04982-1</p>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200/60 dark:border-neutral-700">
                                        <p className="text-neutral-400 text-[10px] uppercase font-semibold">Condos Activos</p>
                                        <p className="font-bold text-neutral-900 dark:text-white mt-0.5">{condos.length} de 5 incluidos</p>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200/60 dark:border-neutral-700 col-span-2 sm:col-span-1">
                                        <p className="text-neutral-400 text-[10px] uppercase font-semibold">Tarifa Mensual</p>
                                        <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">RD$ 2,000 / mes</p>
                                    </div>
                                </div>
                            </div>

                            {/* Direct Message / Support to SuperAdmin */}
                            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-800/20 border border-neutral-200/80 dark:border-neutral-700/60 shadow-2xs">
                                <div className="flex items-center gap-2 mb-3">
                                    <Icon name="message-circle" className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                                        Contacto Directo con SuperAdmin
                                    </h4>
                                </div>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                                    ¿Necesitas aumentar el cupo de condominios o asistencia técnica de la plataforma? Escríbele al equipo de soporte:
                                </p>

                                <form onSubmit={handleSendMessage} className="space-y-3">
                                    <div>
                                        <input
                                            type="text"
                                            value={messageSubject}
                                            onChange={(e) => setMessageSubject(e.target.value)}
                                            placeholder="Asunto (Ej: Solicitud de ampliación de plan / Soporte DGII)"
                                            className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <textarea
                                            value={messageContent}
                                            onChange={(e) => setMessageContent(e.target.value)}
                                            placeholder="Escribe tu consulta o requerimiento aquí..."
                                            rows={3}
                                            className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={sendingMessage}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
                                        >
                                            <Icon name="send" className="w-3.5 h-3.5" />
                                            <span>{sendingMessage ? 'Enviando...' : 'Enviar a Soporte'}</span>
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Recent Exchange */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                                    Historial de Comunicaciones SaaS
                                </h4>
                                {loadingMessages ? (
                                    <p className="text-xs text-neutral-400 py-4 text-center">Cargando mensajes...</p>
                                ) : messages.length === 0 ? (
                                    <p className="text-xs text-neutral-400 py-4 text-center">No hay mensajes previos.</p>
                                ) : (
                                    <div className="space-y-2.5 max-h-48 overflow-y-auto">
                                        {messages.map((m, idx) => (
                                            <div
                                                key={m.id || idx}
                                                className={`p-3 rounded-xl border text-xs ${
                                                    m.direction === 'to_client'
                                                        ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-900/50'
                                                        : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200/80 dark:border-neutral-700/60'
                                                }`}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-neutral-900 dark:text-white">
                                                        {m.direction === 'to_client' ? 'Equipo SuperAdmin' : 'Tú (Wise Services)'}
                                                    </span>
                                                    <span className="text-[10px] text-neutral-400">
                                                        {new Date(m.created_at).toLocaleDateString('es-DO', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-[11px] mb-0.5">{m.subject}</p>
                                                <p className="text-neutral-600 dark:text-neutral-300 text-[11px] leading-relaxed">{m.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 px-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between">
                    <button
                        onClick={logout}
                        className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 transition-colors"
                    >
                        <Icon name="log-out" className="w-3.5 h-3.5" />
                        <span>Cerrar Sesión</span>
                    </button>

                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-xs font-bold transition-all"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};
