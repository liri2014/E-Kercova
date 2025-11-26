import React, { useEffect } from 'react';
import { Icon, Icons } from './Icon';

export interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', duration = 3000, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColor = {
        success: 'bg-emerald-500',
        error: 'bg-rose-500',
        info: 'bg-indigo-500'
    }[type];

    const icon = {
        success: Icons.check,
        error: Icons.alertCircle,
        info: Icons.info
    }[type];

    return (
        <div
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-in-right max-w-md w-full mx-4"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
            <div className={`${bgColor} text-white rounded-2xl shadow-2xl p-4 flex items-center gap-3 backdrop-blur-sm`}>
                <div className="flex-shrink-0">
                    <Icon path={icon} size={24} />
                </div>
                <p className="flex-1 font-medium text-sm leading-snug">{message}</p>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                    <Icon path={Icons.close} size={20} />
                </button>
            </div>
        </div>
    );
};
