import React, { useState, useEffect, useRef } from 'react';
import { ParkingZone } from '../../types';
import { api } from '../../services/api';
import { useTranslation } from '../../i18n';
import { supabase } from '../../supabase';
import { Card, Button } from '../ui';
import { saveTransaction } from './WalletView';

const { getParkingZones, payParking: payForParking } = api;
const API_URL = import.meta.env.VITE_API_URL || 'https://e-kicevo-backend.onrender.com';

// License plate storage functions
const SAVED_PLATES_KEY = 'ekicevo_saved_plates';
const MAX_SAVED_PLATES = 5;

const getSavedPlates = (): string[] => {
    try {
        const saved = localStorage.getItem(SAVED_PLATES_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
};

const savePlate = (plate: string) => {
    if (!plate || plate.length < 3) return;
    
    const plates = getSavedPlates();
    // Remove if already exists (to move to front)
    const filtered = plates.filter(p => p !== plate);
    // Add to front
    filtered.unshift(plate);
    // Keep only MAX_SAVED_PLATES
    const trimmed = filtered.slice(0, MAX_SAVED_PLATES);
    localStorage.setItem(SAVED_PLATES_KEY, JSON.stringify(trimmed));
};

const removeSavedPlate = (plate: string) => {
    const plates = getSavedPlates().filter(p => p !== plate);
    localStorage.setItem(SAVED_PLATES_KEY, JSON.stringify(plates));
};

// Schedule a parking reminder notification
const scheduleParkingReminder = async (userId: string, zoneName: string, plateNumber: string, hours: number) => {
    try {
        const endTime = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
        
        await fetch(`${API_URL}/api/notifications/parking-reminder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                parking_zone: zoneName,
                end_time: endTime,
                plate_number: plateNumber
            })
        });
        
        console.log('Parking reminder scheduled for:', endTime);
    } catch (error) {
        console.error('Failed to schedule parking reminder:', error);
    }
};

export const ParkingView: React.FC<{ walletBalance: number, setWalletBalance: (b: number) => void }> = ({ walletBalance, setWalletBalance }) => {
    const { t } = useTranslation();
    const [zones, setZones] = useState<ParkingZone[]>([]);
    const [selectedZone, setSelectedZone] = useState<ParkingZone | null>(null);
    const [hours, setHours] = useState(1);
    const [plate, setPlate] = useState('');
    const [loading, setLoading] = useState(false);
    const [savedPlates, setSavedPlates] = useState<string[]>([]);
    const [showPlateDropdown, setShowPlateDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getParkingZones().then(data => {
            setZones(data);
            setSelectedZone(data[0]);
        });
        // Load saved plates
        setSavedPlates(getSavedPlates());
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowPlateDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectPlate = (selectedPlate: string) => {
        setPlate(selectedPlate);
        setShowPlateDropdown(false);
    };

    const handleRemovePlate = (e: React.MouseEvent, plateToRemove: string) => {
        e.stopPropagation();
        removeSavedPlate(plateToRemove);
        setSavedPlates(getSavedPlates());
    };

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

            // Schedule parking reminder notification
            await scheduleParkingReminder(user.id, selectedZone.name, plate, hours);
            
            // Save the license plate for future use
            savePlate(plate);
            setSavedPlates(getSavedPlates());
            
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

            {/* License Plate Input with Saved Plates */}
            <div className="space-y-2" ref={dropdownRef}>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
                        <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">NMK</span>
                        </div>
                    </div>
                    <input
                        type="text"
                        placeholder="SK-1234-AB"
                        value={plate}
                        onChange={(e) => setPlate(e.target.value.toUpperCase())}
                        onFocus={() => savedPlates.length > 0 && setShowPlateDropdown(true)}
                        className="w-full h-14 pl-16 pr-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none text-slate-900 dark:text-white text-lg font-semibold uppercase tracking-wider"
                    />
                    {/* Dropdown toggle button */}
                    {savedPlates.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setShowPlateDropdown(!showPlateDropdown)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                            <svg className={`w-5 h-5 transition-transform ${showPlateDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    )}
                    
                    {/* Saved plates dropdown */}
                    {showPlateDropdown && savedPlates.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-20">
                            <div className="p-2">
                                <p className="text-xs text-slate-500 dark:text-slate-400 px-3 py-1 mb-1">{t('recent_plates') || 'Recent plates'}</p>
                                {savedPlates.map((savedPlate, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSelectPlate(savedPlate)}
                                        className="w-full flex items-center justify-between px-3 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center">
                                                <span className="text-white text-[8px] font-bold">NMK</span>
                                            </div>
                                            <span className="text-slate-900 dark:text-white font-semibold tracking-wider">{savedPlate}</span>
                                        </div>
                                        <button
                                            onClick={(e) => handleRemovePlate(e, savedPlate)}
                                            className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
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
