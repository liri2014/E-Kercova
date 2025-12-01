import React, { useState } from 'react';
import { useTranslation } from '../../i18n';
import { Icon, Icons, Card } from '../ui';
import { LegalDocumentsModal } from '../LegalDocuments';

type Theme = 'light' | 'dark' | 'auto';

export const MenuHub: React.FC<{ 
    onViewChange: (v: string) => void, 
    theme: Theme, 
    setTheme: (t: Theme) => void, 
    language: string, 
    setLanguage: (l: any) => void 
}> = ({ onViewChange, theme, setTheme, language, setLanguage }) => {
    const { t } = useTranslation();
    const [showLegalModal, setShowLegalModal] = useState(false);
    const [initialDocument, setInitialDocument] = useState<'privacy' | 'terms'>('privacy');

    const openLegalModal = (doc: 'privacy' | 'terms') => {
        setInitialDocument(doc);
        setShowLegalModal(true);
    };

    const getThemeIcon = () => {
        switch (theme) {
            case 'light': return Icons.sun;
            case 'dark': return Icons.moon;
            case 'auto': return Icons.autoMode;
        }
    };

    const getThemeLabel = () => {
        switch (theme) {
            case 'light': return t('light') || 'Light';
            case 'dark': return t('dark') || 'Dark';
            case 'auto': return t('auto') || 'Auto';
        }
    };

    const cycleTheme = () => {
        const themes: Theme[] = ['light', 'dark', 'auto'];
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('settings')}</h2>

            {/* More Links */}
            <Card className="divide-y divide-slate-100 dark:divide-slate-800 p-0 overflow-hidden">
                <button
                    onClick={() => onViewChange('history')}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Icon path={Icons.history} size={16} className="text-slate-600 dark:text-slate-400" />
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{t('my_reports') || 'My Reports'}</span>
                    </div>
                    <Icon path={Icons.chevronRight} size={16} className="text-slate-400" />
                </button>
                <button
                    onClick={() => onViewChange('events')}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Icon path={Icons.calendar} size={16} className="text-slate-600 dark:text-slate-400" />
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{t('events') || 'Events'}</span>
                    </div>
                    <Icon path={Icons.chevronRight} size={16} className="text-slate-400" />
                </button>
                <button
                    onClick={() => onViewChange('map')}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Icon path={Icons.map} size={16} className="text-slate-600 dark:text-slate-400" />
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{t('city_map') || 'City Map'}</span>
                    </div>
                    <Icon path={Icons.chevronRight} size={16} className="text-slate-400" />
                </button>
            </Card>

            {/* App Settings */}
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('app_settings') || 'App Settings'}</h3>
            <Card className="divide-y divide-slate-100 dark:divide-slate-800 p-0 overflow-hidden">
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Icon path={getThemeIcon()} size={16} />
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{t('appearance')}</span>
                    </div>
                    <div className="flex gap-1">
                        {(['light', 'dark', 'auto'] as Theme[]).map(t => (
                            <button
                                key={t}
                                onClick={() => setTheme(t)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    theme === t 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                }`}
                            >
                                {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '🔄'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <span className="text-xs font-bold">AZ</span>
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{t('language')}</span>
                    </div>
                    <div className="flex gap-1">
                        {['en', 'mk', 'sq'].map(l => (
                            <button
                                key={l}
                                onClick={() => setLanguage(l)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold uppercase ${language === l ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Legal Section */}
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('legal')}</h3>
            <Card className="divide-y divide-slate-100 dark:divide-slate-800 p-0 overflow-hidden">
                <button 
                    onClick={() => openLegalModal('privacy')}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Icon path={Icons.shield} size={16} className="text-slate-600 dark:text-slate-400" />
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{t('privacy_policy')}</span>
                    </div>
                    <Icon path={Icons.chevronRight} size={16} className="text-slate-400" />
                </button>

                <button 
                    onClick={() => openLegalModal('terms')}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Icon path={Icons.file} size={16} className="text-slate-600 dark:text-slate-400" />
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{t('terms_of_service')}</span>
                    </div>
                    <Icon path={Icons.chevronRight} size={16} className="text-slate-400" />
                </button>
            </Card>

            <div className="text-center pt-10">
                <p className="text-xs text-slate-400">E-Kicevo v1.0.0</p>
                <p className="text-xs text-slate-400 mt-1">{t('theme')}: {getThemeLabel()}</p>
            </div>

            {/* Legal Documents Modal */}
            <LegalDocumentsModal
                isOpen={showLegalModal}
                onClose={() => setShowLegalModal(false)}
                initialDocument={initialDocument}
            />
        </div>
    );
};
