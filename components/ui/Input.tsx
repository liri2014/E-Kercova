import React from 'react';

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
    <input className={`w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 ${className}`} {...props} />
);
