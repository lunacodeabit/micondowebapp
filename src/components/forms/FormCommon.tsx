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

// NOTA: 'export' ha sido eliminado de aquí
const FormField = ({ label, htmlFor, children, error, required }: FormFieldProps) => (
    <div>
        <label htmlFor={htmlFor} className="flex justify-between items-center text-sm font-medium text-neutral-400 mb-1">
            <span>{label}</span>
            {required && <RequiredIndicator />}
        </label>
        {children}
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
);

type FormInputProps = React.InputHTMLAttributes<HTMLInputElement>;

// NOTA: 'export' ha sido eliminado de aquí
const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>((props, ref) => (
    <input
        {...props}
        ref={ref}
        className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-white placeholder-neutral-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
));

type FormSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    children: React.ReactNode;
};

// NOTA: 'export' ha sido eliminado de aquí
const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(({ children, ...props }, ref) => (
     <select
        {...props}
        ref={ref}
        className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
    >
        {children}
    </select>
));

type FormTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

// NOTA: 'export' ha sido eliminado de aquí
const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>((props, ref) => (
    <textarea
        {...props}
        ref={ref}
        rows={4}
        className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-white placeholder-neutral-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
));

type FormButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    isLoading?: boolean;
};

// NOTA: 'export' ha sido eliminado de aquí
const FormButton = ({ children, variant = 'primary', isLoading = false, ...props }: FormButtonProps) => {
    const baseClasses = "w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-50";
    const variantClasses = variant === 'primary' 
        ? "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        : "text-neutral-300 bg-neutral-700 hover:bg-neutral-600 focus:ring-neutral-500";

    return (
        <button {...props} className={`${baseClasses} ${variantClasses}`} disabled={isLoading || props.disabled}>
            {isLoading ? (
                <Icon name="loader-2" className="animate-spin" />
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