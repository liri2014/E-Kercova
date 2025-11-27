import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n';

export const TutorialOverlay: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isExiting, setIsExiting] = useState(false);

    const steps = [
        {
            target: 'home-service-report',
            title: t('onboarding_report_title') || 'Report an Issue',
            description: t('onboarding_report_text') || 'Quickly report municipal problems like potholes or broken lights.'
        },
        {
            target: 'home-service-parking',
            title: t('onboarding_parking_title') || 'Pay for Parking',
            description: t('onboarding_parking_text') || 'Pay for parking in any zone directly from the app.'
        },
        {
            target: 'home-service-wallet',
            title: t('current_balance') || 'Digital Wallet',
            description: 'Manage your balance and view transaction history here.'
        }
    ];

    useEffect(() => {
        const updateTargetRect = () => {
            const targetId = steps[currentStep].target;
            const element = document.getElementById(targetId);
            if (element) {
                const rect = element.getBoundingClientRect();
                // Add scroll offset if needed, but getBoundingClientRect is viewport relative which is what we want for fixed overlay
                setTargetRect(rect);

                // Scroll element into view if needed
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        };

        // Small delay to ensure rendering
        const timer = setTimeout(updateTargetRect, 100);
        window.addEventListener('resize', updateTargetRect);
        window.addEventListener('scroll', updateTargetRect);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateTargetRect);
            window.removeEventListener('scroll', updateTargetRect);
        };
    }, [currentStep]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        setIsExiting(true);
        setTimeout(() => onComplete(), 300);
    };

    if (!targetRect) return null;

    // Calculate position for the tooltip
    const isTop = targetRect.top > window.innerHeight / 2;
    const tooltipStyle: React.CSSProperties = {
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        [isTop ? 'bottom' : 'top']: `calc(${isTop ? window.innerHeight - targetRect.top : targetRect.bottom}px + 20px)`,
        width: '90%',
        maxWidth: '320px',
        zIndex: 10001 // Above the spotlight
    };

    return (
        <div className={`fixed inset-0 z-[10000] overflow-hidden transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
            {/* Spotlight Element */}
            <div
                className="absolute rounded-3xl transition-all duration-500 ease-in-out pointer-events-none"
                style={{
                    top: targetRect.top - 4,
                    left: targetRect.left - 4,
                    width: targetRect.width + 8,
                    height: targetRect.height + 8,
                    boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.85)'
                }}
            >
                {/* Pulsing Ring */}
                <div className="absolute inset-0 rounded-3xl border-2 border-indigo-500 animate-ping opacity-75"></div>
                <div className="absolute inset-0 rounded-3xl border-2 border-indigo-500"></div>
            </div>

            {/* Tooltip Card */}
            <div style={tooltipStyle} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl animate-fade-in-up">
                <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                        {currentStep + 1}/{steps.length}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{steps[currentStep].title}</h3>
                </div>

                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                    {steps[currentStep].description}
                </p>

                <div className="flex justify-between items-center">
                    <button
                        onClick={handleComplete}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-medium px-2 py-1"
                    >
                        {t('skip')}
                    </button>
                    <button
                        onClick={handleNext}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                    >
                        {currentStep === steps.length - 1 ? t('finish') : t('next')}
                    </button>
                </div>
            </div>
        </div>
    );
};
