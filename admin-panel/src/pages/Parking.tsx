import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Car, Edit2 } from 'lucide-react';

export const Parking: React.FC = () => {
    const [zones, setZones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchZones = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('parking_zones').select('*').order('name');
        if (error) console.error(error);
        else setZones(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchZones();
    }, []);

    const updateZone = async (id: string) => {
        const newRate = prompt('Enter new hourly rate (MKD):');
        if (newRate && !isNaN(Number(newRate))) {
            await supabase.from('parking_zones').update({ rate: Number(newRate) }).eq('id', id);
            fetchZones();
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Parking Management</h1>

            {loading ? (
                <div className="text-center py-20 text-slate-500">Loading zones...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {zones.map((zone) => {
                        const occupancyRate = (zone.occupied / zone.capacity) * 100;
                        const isFull = occupancyRate > 90;

                        return (
                            <div key={zone.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                                            <Car size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{zone.name}</h3>
                                            <p className="text-sm text-slate-500">{zone.capacity} Spaces</p>
                                        </div>
                                    </div>
                                    <button onClick={() => updateZone(zone.id)} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors">
                                        <Edit2 size={18} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-600">Occupancy</span>
                                            <span className={`font-bold ${isFull ? 'text-red-600' : 'text-emerald-600'}`}>
                                                {zone.occupied} / {zone.capacity} ({occupancyRate.toFixed(0)}%)
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${occupancyRate}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                        <span className="text-sm text-slate-500">Hourly Rate</span>
                                        <span className="font-bold text-slate-900">{zone.rate} MKD</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
