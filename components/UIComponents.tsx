import React from 'react';

// Icon component
export const Icon: React.FC<{ path: string; className?: string; size?: number;[key: string]: any }> = ({ path, className = '', size = 24, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d={path} />
    </svg>
);

// Card component with press animation
export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
    <div onClick={onClick} className={`bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden ${className} ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}`}>
        {children}
    </div>
);

// Button component with press animation
export const Button: React.FC<{ children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; className?: string; disabled?: boolean; fullWidth?: boolean }> = ({ children, onClick, variant = 'primary', className = '', disabled = false, fullWidth = false }) => {
    const baseStyle = "relative h-12 px-6 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 active:scale-95",
        secondary: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95",
        ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 active:scale-95"
    };
    return (
        <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}>
            {children}
        </button>
    );
};

// Input component
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
    <input className={`w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 ${className}`} {...props} />
);

// Select component  
export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }> = ({ className, children, ...props }) => {
    // Import Icons from parent - we'll need to pass the chevron icon
    return (
        <div className="relative">
            <select className={`w-full h-12 px-4 pr-10 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none text-slate-900 dark:text-white ${className}`} {...props}>
                {children}
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
            </svg>
        </div>
    );
};
