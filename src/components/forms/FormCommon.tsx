import React from 'react';
import { Icon } from '../ui/Icon';

type FormFieldProps = {
    label: string;
    htmlFor: string;
    children?: React.ReactNode;
    error?: string;
    required?: boolean;
};

const RequiredIndicator = () => <span className="text-red-500">♦</span>;

const FormField = ({ label, htmlFor, children, error, required }: FormFieldProps) => (
    <div>
        <label htmlFor={htmlFor} className="flex justify-between items-center text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 uppercase tracking-wide">
            <span>{label}</span>
            {required && <RequiredIndicator />}
        </label>
        {children}
        {error && <p className="mt-1 text-xs text-rose-500 font-semibold">{error}</p>}
    </div>
);

type FormInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>((props, ref) => (
    <input
        {...props}
        ref={ref}
        className="w-full bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all shadow-2xs"
    />
));

type FormSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    children: React.ReactNode;
};

const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(({ children, ...props }, ref) => (
     <select
        {...props}
        ref={ref}
        className="w-full bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-neutral-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all shadow-2xs"
    >
        {children}
    </select>
));

type FormTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>((props, ref) => (
    <textarea
        {...props}
        ref={ref}
        rows={4}
        className="w-full bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all shadow-2xs"
    />
));

type FormButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    isLoading?: boolean;
};

const FormButton = ({ children, variant = 'primary', isLoading = false, ...props }: FormButtonProps) => {
    const baseClasses = "w-full flex justify-center items-center py-2.5 px-5 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm disabled:opacity-50";
    const variantClasses = variant === 'primary' 
        ? "text-white bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-sm"
        : "text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700";

    return (
        <button {...props} className={`${baseClasses} ${variantClasses}`} disabled={isLoading || props.disabled}>
            {isLoading ? (
                <Icon name="loader-2" className="animate-spin w-4 h-4" />
            ) : (
                children
            )}
        </button>
    );
};

// 1. COMPONENTE FALTANTE AÑADIDO
type FormHelpTextProps = {
    children: React.ReactNode;
};

const FormHelpText = ({ children }: FormHelpTextProps) => (
    <p className="mt-1 text-sm text-neutral-500">{children}</p>
);

// 2. EXPORTACIÓN ÚNICA AÑADIDA AL FINAL
// Esto agrupa todos los componentes en un solo objeto 'FormCommon'
export const FormCommon = {
    Group: FormField, // Renombramos FormField a Group para que coincida
    Input: FormInput,
    Select: FormSelect,
    Textarea: FormTextarea,
    Button: FormButton,
    HelpText: FormHelpText, // Añadimos el nuevo componente
};