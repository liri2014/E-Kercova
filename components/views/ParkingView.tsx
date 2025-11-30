import React, { useState, useEffect } from 'react';
import { ParkingZone } from '../../types';
import { api } from '../../services/api';
import { useTranslation } from '../../i18n';
import { supabase } from '../../supabase';
import { Card, Button } from '../ui';
import { saveTransaction } from './WalletView';

const { getParkingZones, payParking: payForParking } = api;

export const ParkingView: React.FC<{ walletBalance: number, setWalletBalance: (b: number) => void }> = ({ walletBalance, setWalletBalance }) => {
    const { t } = useTranslation();
    const [zones, setZones] = useState<ParkingZone[]>([]);
    const [selectedZone, setSelectedZone] = useState<ParkingZone | null>(null);
    const [hours, setHours] = useState(1);
    const [plate, setPlate] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getParkingZones().then(data => {
            setZones(data);
            setSelectedZone(data[0]);
        });
    }, []);

    const handlePay = async () => {
        if (!selectedZone || !plate) return alert(t('error_enter_plate'));
        const totalCost = selectedZone.rate * hours;
        if (walletBalance < totalCost) return alert(t('error_insufficient_funds'));

        setLoading(true);
        try {
            // Get the authenticated user's ID from Supabase
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Please log in to pay for parking');
                setLoading(false);
                return;
            }

            await payForParking({
                user_id: user.id, // Use authenticated user's ID
                zone_id: selectedZone.id,
                duration: hours,
                plate_number: plate,
                amount: totalCost
            });

            setWalletBalance(walletBalance - totalCost);

            // Record transaction
            saveTransaction({
                titleKey: 'parking_payment',
                details: selectedZone.name, // Zone name stored separately
                amount: -totalCost,
                type: 'parking'
            });

            // Trigger local update
            window.dispatchEvent(new Event('transactionAdded'));

            alert(t('payment_successful'));
            setPlate('');
            const updated = await getParkingZones();
            setZones(updated);
        } catch (e) {
            alert('Payment failed: ' + e);
        } finally {
            setLoading(false);
        }
    };

    const totalCost = selectedZone ? selectedZone.rate * hours : 0;

    return (
        <div className="space-y-6 pb-20">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('pay_for_parking')}</h2>

            {/* Horizontal Scrolling Zone Cards */}
            <div className="overflow-x-auto -mx-4 px-4 no-scrollbar">
                <div className="flex gap-4 pb-2 pt-2">{/* Added pt-2 to prevent cut-off */}
                    {zones.map(zone => {
                        const isSelected = selectedZone?.id === zone.id;
                        const totalCapacity = zone.capacity || 0;
                        const occupiedSpots = zone.occupied || 0;
                        const availableSpots = totalCapacity - occupiedSpots;
                        const isAvailable = availableSpots > 0;

                        return (
                            <button
                                key={zone.id}
                                onClick={() => setSelectedZone(zone)}
                                className={`relative flex-shrink-0 w-40 h-36 rounded-3xl p-4 flex flex-col justify-between transition-all ${isSelected
                                    ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-lg shadow-indigo-600/30 scale-105'
                                    : 'bg-slate-800 dark:bg-slate-800 text-white hover:scale-105'
                                    }`}
                            >
                                {/* Availability Indicator */}
                                <div className="absolute top-3 right-3">
                                    <div className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-green-400' : 'bg-red-400'}`} />
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold">{zone.name}</h3>
                                    <p className={`text-xs mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>MKD/hr</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-2xl font-bold">{zone.rate}</p>
                                    <p className={`text-[10px] ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                                        {availableSpots}/{totalCapacity} {t('free')}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* License Plate Input */}
            <div className="space-y-2">
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">NMK</span>
                        </div>
                    </div>
                    <input
                        type="text"
                        placeholder="SK-1234-AB"
                        value={plate}
                        onChange={(e) => setPlate(e.target.value.toUpperCase())}
                        className="w-full h-14 pl-16 pr-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none text-slate-900 dark:text-white text-lg font-semibold uppercase tracking-wider"
                    />
                </div>
            </div>

            {/* Duration Selector */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-slate-900 dark:text-white">{t('duration')}</span>
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">{hours} hrs</span>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setHours(Math.max(1, hours - 1))}
                        className="flex-1 h-14 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl flex items-center justify-center text-2xl font-bold text-slate-900 dark:text-white transition-colors"
                    >
                        -
                    </button>
                    <button
                        onClick={() => setHours(Math.min(24, hours + 1))}
                        className="flex-1 h-14 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl flex items-center justify-center text-2xl font-bold text-slate-900 dark:text-white transition-colors"
                    >
                        +
                    </button>
                </div>
            </Card>

            {/* Cost Summary */}
            {selectedZone && (
                <Card className="p-6 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{t('zone')}</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{selectedZone.name}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{t('rate')}</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{selectedZone.rate} MKD</span>
                    </div>
                    <div className="h-px bg-slate-200 dark:bg-slate-700 mb-4" />
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-slate-900 dark:text-white">{t('total_cost')}</span>
                        <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{totalCost} <span className="text-lg font-normal">MKD</span></span>
                    </div>
                </Card>
            )}

            {/* Pay Button */}
            <Button fullWidth onClick={handlePay} disabled={loading || !selectedZone || !plate} className="h-14 text-lg">
                {loading ? <span className="animate-spin mr-2">⟳</span> : null}
                {t('pay_for_parking')}
            </Button>
        </div>
    );
};
