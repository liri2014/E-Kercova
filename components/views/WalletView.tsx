import React from 'react';
import { useTranslation } from '../../i18n';
import { Icon, Icons, Card, Button } from '../ui';

export const WalletView: React.FC<{ balance: number, setBalance: (b: number) => void }> = ({ balance, setBalance }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-6">
            <div className="relative h-48 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white shadow-xl shadow-indigo-600/20 overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Icon path={Icons.wallet} size={120} />
                </div>
                <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                        <p className="text-indigo-200 font-medium mb-1">{t('current_balance')}</p>
                        <h1 className="text-4xl font-bold">{balance} <span className="text-2xl font-normal opacity-80">MKD</span></h1>
                    </div>
                    <div className="flex justify-between items-end">
                        <div className="text-indigo-200 text-xs">
                            <p>{t('valid_thru')}</p>
                            <p className="font-mono text-white text-base">12/28</p>
                        </div>
                        <Icon path={Icons.building} className="text-white/50" size={32} />
                    </div>
                </div>
            </div>

            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t('add_funds')}</h3>
            <div className="grid grid-cols-3 gap-3">
                {[200, 500, 1000].map(amt => (
                    <Button key={amt} variant="secondary" onClick={() => setBalance(balance + amt)} className="h-16 flex-col gap-0">
                        <span className="font-bold text-lg">+{amt}</span>
                        <span className="text-[10px] uppercase">MKD</span>
                    </Button>
                ))}
            </div>
        </div>
    );
};
