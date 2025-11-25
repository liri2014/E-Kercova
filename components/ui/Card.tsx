import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void; id?: string }> = ({ children, className = '', onClick, id }) => (
    <div id={id} onClick={onClick} className={`bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden ${className} ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}`}>
        {children}
    </div>
);
