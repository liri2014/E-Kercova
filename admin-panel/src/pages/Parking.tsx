import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Car, Edit2, Trash2, Plus } from 'lucide-react';
import { Modal } from '../components/Modal';

interface ParkingZone {
    id: string;
    name: string;
    rate: number;
    capacity: number;
    occupied: number;
}

export const Parking: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'zones' | 'transactions'>('zones');
    const [zones, setZones] = useState<ParkingZone[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedZone, setSelectedZone] = useState<ParkingZone | null>(null);
    const [formData, setFormData] = useState({ name: '', rate: '', capacity: '' });

    const fetchZones = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('parking_zones').select('*').order('name');
        if (error) console.error(error);
        else setZones(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchZones();
        fetchTransactions();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/api/parking/zones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    rate: Number(formData.rate),
                    capacity: Number(formData.capacity)
                })
            });

            if (response.ok) {
                setShowAddModal(false);
                setFormData({ name: '', rate: '', capacity: '' });
                fetchZones();
            }
        } catch (error) {
            console.error('Error adding zone:', error);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedZone) return;

        try {
            const response = await fetch(`http://localhost:3000/api/parking/zones/${selectedZone.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    rate: Number(formData.rate),
                    capacity: Number(formData.capacity)
                })
            });

            if (response.ok) {
                setShowEditModal(false);
                setSelectedZone(null);
                setFormData({ name: '', rate: '', capacity: '' });
                fetchZones();
            }
        } catch (error) {
            console.error('Error updating zone:', error);
        }
    };

    const handleDelete = async () => {
        if (!selectedZone) return;

        try {
            const response = await fetch(`http://localhost:3000/api/parking/zones/${selectedZone.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setShowDeleteModal(false);
                setSelectedZone(null);
                fetchZones();
            }
        } catch (error) {
            console.error('Error deleting zone:', error);
        }
    };

    const openEditModal = (zone: ParkingZone) => {
        setSelectedZone(zone);
        setFormData({
            name: zone.name,
            rate: zone.rate.toString(),
            capacity: zone.capacity.toString()
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (zone: ParkingZone) => {
        setSelectedZone(zone);
        setShowDeleteModal(true);
    };

    const fetchTransactions = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('transactions')
            .select(`
                *,
                parking_zones:zone_id (name),
                profiles:user_id (phone)
            `)
            .order('created_at', { ascending: false });
        if (error) console.error(error);
        else setTransactions(data || []);
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Parking Management</h1>
                {activeTab === 'zones' && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                    >
                        <Plus size={20} />
                        Add Zone
                    </button>
                )}
            </div>

            <div className="flex gap-4 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('zones')}
                    className={`pb-4 px-2 font-medium transition-all ${activeTab === 'zones' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Parking Zones
                </button>
                <button
                    onClick={() => setActiveTab('transactions')}
                    className={`pb-4 px-2 font-medium transition-all ${activeTab === 'transactions' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Transactions
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-500">Loading...</div>
            ) : activeTab === 'zones' ? (
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
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(zone)}
                                            className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(zone)}
                                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
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
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Zone</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">License Plate</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Duration</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {transactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-slate-900">📱</span>
                                                <span className="text-sm text-slate-700">{transaction.profiles?.phone || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-slate-900">{transaction.parking_zones?.name || 'Unknown'}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-slate-700 font-mono bg-slate-50 px-2 py-1 rounded">{transaction.plate_number}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-slate-700">{transaction.duration}h</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-emerald-600">{transaction.amount} MKD</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {new Date(transaction.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {transactions.length === 0 && (
                            <div className="text-center py-10 text-slate-500">
                                No transactions yet
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add Zone Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Parking Zone">
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Zone Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                            placeholder="e.g., Zone A"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Hourly Rate (MKD)</label>
                        <input
                            type="number"
                            required
                            value={formData.rate}
                            onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                            placeholder="e.g., 50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Total Spaces</label>
                        <input
                            type="number"
                            required
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                            placeholder="e.g., 100"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all"
                    >
                        Create Zone
                    </button>
                </form>
            </Modal>

            {/* Edit Zone Modal */}
            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Parking Zone">
                <form onSubmit={handleEdit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Zone Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Hourly Rate (MKD)</label>
                        <input
                            type="number"
                            required
                            value={formData.rate}
                            onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Total Spaces</label>
                        <input
                            type="number"
                            required
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all"
                    >
                        Update Zone
                    </button>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Parking Zone">
                <div className="space-y-4">
                    <p className="text-slate-600">
                        Are you sure you want to delete <strong>{selectedZone?.name}</strong>? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
