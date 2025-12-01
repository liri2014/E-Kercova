import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
    size = 'md', 
    message 
}) => {
    const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-10 h-10 border-3',
        lg: 'w-16 h-16 border-4',
    };

    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div 
                className={`${sizeClasses[size]} border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}
            />
            {message && (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                    {message}
                </p>
            )}
        </div>
    );
};

// Suspense fallback component
export const ViewLoadingFallback: React.FC = () => (
    <div className="min-h-[200px] flex items-center justify-center">
        <LoadingSpinner size="md" message="Loading..." />
    </div>
);

export default LoadingSpinner;

