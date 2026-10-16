import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Icon } from "../../components/ui/Icon";
import { FormCommon } from "../../components/forms/FormCommon";

type AuthState = "login" | "signup" | "forgot-password";

export const AuthView = () => {
    const [state, setState] = useState<AuthState>("login");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login, signUp, forgotPassword, googleLogin, isDevMode, devLogin } = useAuth();
    const { addToast } = useToast();

    const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
        defaultValues: {
            email: "",
            password: "",
            name: "",
            confirmPassword: ""
        }
    });

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            if (state === "login") {
                await login(data.email, data.password);
            } else if (state === "signup") {
                await signUp(data.email, data.password, data.name);
                addToast("Cuenta creada. Por favor verifica tu correo.", "info");
                setState("login");
            } else if (state === "forgot-password") {
                await forgotPassword(data.email);
                addToast("Email de recuperación enviado.", "success");
                setState("login");
            }
        } catch (error: any) {
            console.error("Auth error:", error);
            addToast(error.message || "Ocurrió un error inesperado", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await googleLogin();
        } catch (error: any) {
            addToast("El backend de Supabase está temporalmente en pausa. Utiliza el acceso con credenciales o los botones directos abajo.", "error");
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
                    <div className="text-center mb-8">
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            className="inline-block p-3 bg-blue-600/20 rounded-2xl mb-4 border border-blue-500/30 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                        >
                            <Icon name="shield-check" className="text-blue-400" size={40} />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                            {state === "login" ? "Bienvenido de nuevo" :
                                state === "signup" ? "Crea tu cuenta" :
                                    "Recuperar acceso"}
                        </h1>
                        <p className="text-neutral-400 text-sm">
                            {state === "login" ? "Gestiona tu condominio con inteligencia" :
                                state === "signup" ? "Únete a la nueva era de administración" :
                                    "Te enviaremos las instrucciones de reset"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={state}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                {state === "signup" && (
                                    <FormCommon.Group label="Nombre Completo" htmlFor="name" error={errors.name?.message}>
                                        <div className="relative">
                                            <Icon name="user" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                                            <input
                                                id="name"
                                                {...register("name", { required: state === "signup" ? "El nombre es requerido" : false })}
                                                className="w-full bg-neutral-800/50 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-neutral-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none"
                                                placeholder="Ej: Juan Pérez"
                                            />
                                        </div>
                                    </FormCommon.Group>
                                )}

                                <FormCommon.Group label="Correo Electrónico" htmlFor="email" error={errors.email?.message}>
                                    <div className="relative">
                                        <Icon name="mail" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                                        <input
                                            type="email"
                                            id="email"
                                            {...register("email", {
                                                required: "El correo es requerido",
                                                pattern: { value: /^\S+@\S+$/i, message: "Email inválido" }
                                            })}
                                            className="w-full bg-neutral-800/50 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-neutral-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none"
                                            placeholder="tu@email.com"
                                        />
                                    </div>
                                </FormCommon.Group>

                                {state !== "forgot-password" && (
                                    <>
                                        <FormCommon.Group label="Contraseña" htmlFor="password" error={errors.password?.message}>
                                            <div className="relative">
                                                <Icon name="lock" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    id="password"
                                                    {...register("password", {
                                                        required: "La contraseña es requerida",
                                                        minLength: { value: 6, message: "Mínimo 6 caracteres" }
                                                    })}
                                                    className="w-full bg-neutral-800/50 border border-white/5 rounded-xl pl-10 pr-12 py-3 text-white placeholder:text-neutral-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                                                >
                                                    <Icon name={showPassword ? "eye-off" : "eye"} size={20} />
                                                </button>
                                            </div>
                                        </FormCommon.Group>

                                        {state === "signup" && (
                                            <FormCommon.Group label="Confirmar Contraseña" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
                                                <div className="relative">
                                                    <Icon name="shield-check" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        id="confirmPassword"
                                                        {...register("confirmPassword", {
                                                            required: state === "signup" ? "Confirmación requerida" : false,
                                                            validate: (val: string) => {
                                                                if (watch('password') !== val) {
                                                                    return "Las contraseñas no coinciden";
                                                                }
                                                            }
                                                        })}
                                                        className="w-full bg-neutral-800/50 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-neutral-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none"
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                            </FormCommon.Group>
                                        )}
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {state === "login" && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setState("forgot-password")}
                                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_20px_-5px_rgba(37,99,235,0.5)] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading && <Icon name="loader" className="animate-spin" size={18} />}
                            {state === "login" ? "Iniciar Sesión" :
                                state === "signup" ? "Registrarse" :
                                    "Enviar Instrucciones"}
                        </button>
                    </form>

                    <div className="mt-8 space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-neutral-900/40 px-2 text-neutral-500">O continúa con</span></div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 rounded-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>

                        <p className="text-center text-sm text-neutral-500">
                            {state === "login" ? (
                                <>¿No tienes cuenta? <button onClick={() => { setState("signup"); reset(); }} className="text-blue-400 hover:underline">Regístrate</button></>
                            ) : (
                                <>¿Ya tienes cuenta? <button onClick={() => { setState("login"); reset(); }} className="text-blue-400 hover:underline">Inicia sesión</button></>
                            )}
                        </p>
                    </div>

                    {/* ACCESO DEMO RÁPIDO Y CREDENCIALES */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <p className="text-center text-[10px] text-neutral-400 mb-3 tracking-widest uppercase font-semibold">
                            Acceso Directo Demo • MiCondo OS
                        </p>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <button
                                type="button"
                                onClick={() => devLogin("superadmin")}
                                className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-[10px] font-bold py-2.5 px-2 rounded-xl border border-purple-500/30 transition-all flex flex-col items-center gap-1 shadow-sm"
                                title="SuperAdmin SaaS: admin@micondo.com / password"
                            >
                                <Icon name="shield" size={14} />
                                <span>SuperAdmin</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => devLogin("admin")}
                                className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-[10px] font-bold py-2.5 px-2 rounded-xl border border-blue-500/30 transition-all flex flex-col items-center gap-1 shadow-sm"
                                title="Admin Condominio: admin@torre.com / password"
                            >
                                <Icon name="building-2" size={14} />
                                <span>Admin</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => devLogin("resident")}
                                className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-[10px] font-bold py-2.5 px-2 rounded-xl border border-emerald-500/30 transition-all flex flex-col items-center gap-1 shadow-sm"
                                title="Portal Residente: residente@torre.com / password"
                            >
                                <Icon name="user" size={14} />
                                <span>Residente</span>
                            </button>
                        </div>
                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-[11px] text-neutral-400 space-y-1">
                            <p className="font-semibold text-neutral-300 flex items-center gap-1.5">
                                <Icon name="key" size={12} className="text-amber-400" />
                                Credenciales manuales:
                            </p>
                            <p className="font-mono text-[10px] text-neutral-400">
                                • S-Admin: <span className="text-white">admin@micondo.com</span> / <span className="text-white">password</span>
                            </p>
                            <p className="font-mono text-[10px] text-neutral-400">
                                • Admin: <span className="text-white">admin@torre.com</span> / <span className="text-white">password</span>
                            </p>
                            <p className="font-mono text-[10px] text-neutral-400">
                                • Residente: <span className="text-white">residente@torre.com</span> / <span className="text-white">password</span>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
