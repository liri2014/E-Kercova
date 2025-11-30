import React from 'react';
import { Card } from './ui';

interface LanguageSelectionScreenProps {
    onSelectLanguage: (lang: 'en' | 'mk' | 'sq') => void;
}

export const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({ onSelectLanguage }) => {
    const languages = [
        { 
            code: 'sq' as const, 
            name: 'Shqip', 
            nativeName: 'Albanian',
            flag: '🇦🇱',
            greeting: 'Mirësevini'
        },
        { 
            code: 'mk' as const, 
            name: 'Македонски', 
            nativeName: 'Macedonian',
            flag: '🇲🇰',
            greeting: 'Добредојдовте'
        },
        { 
            code: 'en' as const, 
            name: 'English', 
            nativeName: 'English',
            flag: '🇬🇧',
            greeting: 'Welcome'
        }
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800">
            <Card className="w-full max-w-sm p-8 text-center bg-white/95 backdrop-blur-sm">
                {/* Logo */}
                <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-600/30">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                
                <h1 className="text-2xl font-bold text-slate-900 mb-2">E-Kicevo</h1>
                <p className="text-slate-500 mb-8">Select your language / Изберете јазик / Zgjidhni gjuhën</p>

                {/* Language Options */}
                <div className="space-y-3">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => onSelectLanguage(lang.code)}
                            className="w-full flex items-center gap-4 p-4 bg-slate-50 hover:bg-indigo-50 border-2 border-transparent hover:border-indigo-500 rounded-2xl transition-all group"
                        >
                            <span className="text-3xl">{lang.flag}</span>
                            <div className="text-left flex-1">
                                <p className="font-bold text-slate-900 group-hover:text-indigo-700">{lang.name}</p>
                                <p className="text-sm text-slate-500">{lang.greeting}</p>
                            </div>
                            <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <p className="mt-8 text-xs text-slate-400">
                    You can change this later in settings
                </p>
            </Card>
        </div>
    );
};

