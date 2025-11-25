import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n';
import { Icon, Icons, Button } from '../ui';

export const TutorialOverlay: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isExiting, setIsExiting] = useState(false);

    const steps = [
        {
            target: 'home-service-report',
            title: t('onboarding_report_title'),
            description: t('onboarding_report_text')
        },
        {
            target: 'home-service-parking',
            title: t('onboarding_parking_title'),
            description: t('onboarding_parking_text')
        },
        {
            target: 'home-service-wallet',
            title: t('current_balance'),
            description: 'Manage your balance and view transaction history here.'
        },
        {
            target: 'home-service-news',
            title: t('news'),
            description: 'Stay updated with the latest news and announcements from your municipality.'
        }
    ];

    useEffect(() => {
        const updateTargetRect = () => {
            const targetId = steps[currentStep].target;
            const element = document.getElementById(targetId);
            if (element) {
                setTargetRect(element.getBoundingClientRect());
            }
        };

        updateTargetRect();
        window.addEventListener('resize', updateTargetRect);
        return () => window.removeEventListener('resize', updateTargetRect);
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

    const getTooltipPosition = () => {
        if (!targetRect) return { top: '50%', left: '50%' };

        const spaceAbove = targetRect.top;
        const spaceBelow = window.innerHeight - targetRect.bottom;
        const isAbove = spaceAbove > spaceBelow;

        return {
            top: isAbove ? `${targetRect.top - 20}px` : `${targetRect.bottom + 20}px`,
            left: `${targetRect.left + targetRect.width / 2}px`,
            transform: isAbove ? 'translate(-50%, -100%)' : 'translate(-50%, 0)'
        };
    };

    const tooltipPosition = getTooltipPosition();

    return (
        <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
            {/* Dark Overlay with Spotlight */}
            <div
                className="absolute inset-0 bg-black/80 transition-all duration-500"
                style={{
                    clipPath: targetRect
                        ? `polygon(
                            0% 0%, 0% 100%, 
                            ${targetRect.left - 8}px 100%, 
                            ${targetRect.left - 8}px ${targetRect.top - 8}px, 
                            ${targetRect.right + 8}px ${targetRect.top - 8}px, 
                            ${targetRect.right + 8}px ${targetRect.bottom + 8}px, 
                            ${targetRect.left - 8}px ${targetRect.bottom + 8}px, 
                            ${targetRect.left - 8}px 100%, 
                            100% 100%, 100% 0%
                        )`
                        : undefined
                }}
            />

            {/* Spotlight Border */}
            {targetRect && (
                <div
                    className="absolute border-4 border-indigo-500 rounded-3xl pointer-events-none transition-all duration-500 shadow-2xl"
                    style={{
                        top: `${targetRect.top - 8}px`,
                        left: `${targetRect.left - 8}px`,
                        width: `${targetRect.width + 16}px`,
                        height: `${targetRect.height + 16}px`,
                        boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.3), 0 0 60px 20px rgba(99, 102, 241, 0.2)'
                    }}
                />
            )}

            {/* Tooltip */}
            <div
                className="absolute bg-slate-800 dark:bg-slate-900 rounded-2xl p-6 shadow-2xl max-w-sm transition-all duration-500"
                style={tooltipPosition}
            >
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {currentStep + 1}
                    </div>
                    <h3 className="text-xl font-bold text-white">
                        {steps[currentStep].title}
                    </h3>
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">
                    {steps[currentStep].description}
                </p>

                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        {steps.map((_, index) => (
                            <div
                                key={index}
                                className={`h-2 rounded-full transition-all duration-300 ${index === currentStep ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-600'
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="flex gap-2">
                        {currentStep < steps.length - 1 && (
                            <button
                                onClick={handleComplete}
                                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                            >
                                {t('skip')}
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg"
                        >
                            {currentStep === steps.length - 1 ? t('get_started') : t('next')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
