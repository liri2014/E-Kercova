import React from 'react';
import { useTranslation } from '../../i18n';
import { Icon, Icons } from '../ui';

// Dummy transactions data
const RECENT_TRANSACTIONS = [
    { id: 1, title: 'Parking Zone K11', date: 'Today, 10:23 AM', amount: -40, type: 'parking' },
    { id: 2, title: 'Wallet Top Up', date: 'Yesterday', amount: 500, type: 'topup' },
    { id: 3, title: 'Parking Zone K12', date: 'Mon, 14:00', amount: -40, type: 'parking' },
];

export const WalletView: React.FC<{ balance: number, setBalance: (b: number) => void }> = ({ balance, setBalance }) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-8 pb-24">
            {/* Header */}
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Wallet</h1>

            {/* Card */}
            <div className="relative h-56 rounded-[2rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-800 p-8 text-white shadow-2xl shadow-indigo-600/30 overflow-hidden transform transition-transform hover:scale-[1.02]">
                {/* Background decoration */}
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start">
                        <span className="font-medium text-indigo-100 tracking-wide">E-Kicevo Card</span>
                        <Icon path={Icons.creditCard} size={32} className="text-indigo-200 opacity-80" />
                    </div>

                    <div>
                        <h2 className="text-5xl font-bold mb-1 tracking-tight">{balance} <span className="text-2xl font-normal opacity-80">MKD</span></h2>
                        <p className="text-indigo-200 text-sm font-medium">{t('current_balance')}</p>
                    </div>

                    <div className="flex justify-between items-end">
                        <p className="font-mono text-lg tracking-widest opacity-80">**** **** **** 8829</p>
                        <div className="text-right">
                            <p className="text-[10px] text-indigo-200 uppercase tracking-wider font-bold">Valid Thru</p>
                            <p className="font-mono text-sm font-medium">12/28</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => setBalance(balance + 500)}
                    className="flex items-center justify-center gap-3 py-4 px-6 bg-[#1a1f37] dark:bg-slate-800 rounded-2xl text-indigo-400 font-bold shadow-lg shadow-indigo-900/10 active:scale-95 transition-all border border-indigo-500/10 hover:bg-[#232946]"
                >
                    <Icon path={Icons.plus} size={20} strokeWidth={3} />
                    <span>{t('add_funds')}</span>
                </button>
                <button
                    className="flex items-center justify-center gap-3 py-4 px-6 bg-[#1a1f37] dark:bg-slate-800 rounded-2xl text-slate-300 font-bold shadow-lg shadow-slate-900/10 active:scale-95 transition-all border border-slate-700/30 hover:bg-[#232946]"
                >
                    <Icon path={Icons.history} size={20} strokeWidth={2.5} />
                    <span>History</span>
                </button>
            </div>

            {/* Recent Transactions */}
            <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Recent Transactions</h3>
                <div className="space-y-3">
                    {RECENT_TRANSACTIONS.map(tx => (
                        <div key={tx.id} className="flex items-center justify-between p-4 bg-[#1a1f37] dark:bg-slate-900 rounded-3xl border border-slate-800/50 shadow-sm hover:bg-[#232946] transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${tx.type === 'topup' ? 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20' : 'bg-slate-700/30 text-slate-300 group-hover:bg-slate-700/50'}`}>
                                    <Icon path={tx.type === 'topup' ? Icons.plus : Icons.parking} size={24} strokeWidth={2} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-base mb-0.5">{tx.title}</h4>
                                    <p className="text-slate-400 text-xs font-medium">{tx.date}</p>
                                </div>
                            </div>
                            <span className={`font-bold text-base ${tx.amount > 0 ? 'text-emerald-500' : 'text-white'}`}>
                                {tx.amount > 0 ? '+' : ''}{tx.amount} MKD
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
