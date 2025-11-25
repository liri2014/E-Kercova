import React from 'react';

export const Button: React.FC<{ children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; className?: string; disabled?: boolean; fullWidth?: boolean }> = ({ children, onClick, variant = 'primary', className = '', disabled = false, fullWidth = false }) => {
    const baseStyle = "relative h-12 px-6 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 active:translate-y-0.5",
        secondary: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700",
        ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
    };
    return (
        <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}>
            {children}
        </button>
    );
};
