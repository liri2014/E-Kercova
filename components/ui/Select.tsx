import React from 'react';
import { Icon, Icons } from './Icon';

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className, children, ...props }) => (
    <div className="relative">
        <select className={`w-full h-12 px-4 pr-10 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none text-slate-900 dark:text-white ${className}`} {...props}>
            {children}
        </select>
        <Icon path={Icons.chevronRight} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" size={20} />
    </div>
);
