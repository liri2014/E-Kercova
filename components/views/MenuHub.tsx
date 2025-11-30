import React, { useState } from 'react';
import { useTranslation } from '../../i18n';
import { Icon, Icons, Card } from '../ui';
import { LegalDocumentsModal } from '../LegalDocuments';

export const MenuHub: React.FC<{ onViewChange: (v: string) => void, theme: 'light' | 'dark', setTheme: (t: 'light' | 'dark') => void, language: string, setLanguage: (l: any) => void }> = ({ onViewChange, theme, setTheme, language, setLanguage }) => {
    const { t } = useTranslation();
    const [showLegalModal, setShowLegalModal] = useState(false);
    const [initialDocument, setInitialDocument] = useState<'privacy' | 'terms'>('privacy');

    const openLegalModal = (doc: 'privacy' | 'terms') => {
        setInitialDocument(doc);
        setShowLegalModal(true);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('settings')}</h2>

            <Card className="divide-y divide-slate-100 dark:divide-slate-800 p-0 overflow-hidden">
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Icon path={theme === 'light' ? Icons.sun : Icons.moon} size={16} />
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{t('appearance')}</span>
                    </div>
                    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium">
                        {theme === 'light' ? 'Light' : 'Dark'}
                    </button>
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
                <p className="text-xs text-slate-400">E-Kicevo App v2.1.0</p>
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
