import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users as UsersIcon, Shield, ShieldCheck, Search, Phone, Calendar, FileText, CheckCircle } from 'lucide-react';
import { Modal } from '../components/Modal';

interface UserProfile {
    id: string;
    phone: string | null;
    role: 'citizen' | 'admin';
    updated_at: string;
    reports_count?: number;
    transactions_count?: number;
}

export const Users: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'citizen' | 'admin'>('all');
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [updating, setUpdating] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Fetch profiles
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .order('updated_at', { ascending: false });

            if (profilesError) throw profilesError;

            // Fetch report counts per user
            const { data: reportCounts } = await supabase
                .from('reports')
                .select('user_id');

            // Fetch transaction counts per user
            const { data: transactionCounts } = await supabase
                .from('transactions')
                .select('user_id');

            // Count reports and transactions per user
            const reportsMap: Record<string, number> = {};
            const transactionsMap: Record<string, number> = {};

            reportCounts?.forEach(r => {
                reportsMap[r.user_id] = (reportsMap[r.user_id] || 0) + 1;
            });

            transactionCounts?.forEach(t => {
                transactionsMap[t.user_id] = (transactionsMap[t.user_id] || 0) + 1;
            });

            // Merge counts into profiles
            const enrichedProfiles = profiles?.map(p => ({
                ...p,
                reports_count: reportsMap[p.id] || 0,
                transactions_count: transactionsMap[p.id] || 0
            })) || [];

            setUsers(enrichedProfiles);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (newRole: 'citizen' | 'admin') => {
        if (!selectedUser) return;
        setUpdating(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', selectedUser.id);

            if (error) throw error;

            setShowRoleModal(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            console.error('Error updating role:', error);
            alert(`Failed to update role: ${error}`);
        } finally {
            setUpdating(false);
        }
    };

    const openRoleModal = (user: UserProfile) => {
        setSelectedUser(user);
        setShowRoleModal(true);
    };

    // Filter users based on search and role filter
    const filteredUsers = users.filter(user => {
        const matchesSearch = searchQuery === '' ||
            user.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.id.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = roleFilter === 'all' || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const stats = {
        total: users.length,
        citizens: users.filter(u => u.role === 'citizen').length,
        admins: users.filter(u => u.role === 'admin').length
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
                        <UsersIcon size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Total Users</p>
                        <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-emerald-50 text-emerald-600">
                        <Shield size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Citizens</p>
                        <h3 className="text-2xl font-bold text-slate-900">{stats.citizens}</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-amber-50 text-amber-600">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Administrators</p>
                        <h3 className="text-2xl font-bold text-slate-900">{stats.admins}</h3>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by phone or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setRoleFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${roleFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setRoleFilter('citizen')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${roleFilter === 'citizen' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        Citizens
                    </button>
                    <button
                        onClick={() => setRoleFilter('admin')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${roleFilter === 'admin' ? 'bg-amber-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        Admins
                    </button>
                </div>
            </div>

            {/* Users Table */}
            {loading ? (
                <div className="text-center py-20 text-slate-500">Loading users...</div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reports</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Transactions</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Updated</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                    <Phone size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-slate-900">
                                                        {user.phone || 'No phone'}
                                                    </div>
                                                    <div className="text-xs text-slate-400 font-mono">
                                                        {user.id.slice(0, 8)}...
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user.role === 'admin'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                {user.role === 'admin' ? <ShieldCheck size={14} /> : <Shield size={14} />}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <FileText size={16} className="text-slate-400" />
                                                {user.reports_count || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Calendar size={16} className="text-slate-400" />
                                                {user.transactions_count || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {new Date(user.updated_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => openRoleModal(user)}
                                                className="text-indigo-600 hover:text-indigo-800 font-medium text-sm hover:underline"
                                            >
                                                Change Role
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-10 text-slate-500">
                                {searchQuery || roleFilter !== 'all' ? 'No users match your filters' : 'No users found'}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Role Change Modal */}
            <Modal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} title="Change User Role">
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">User</p>
                        <p className="font-medium text-slate-900">{selectedUser?.phone || 'No phone'}</p>
                        <p className="text-xs text-slate-400 font-mono mt-1">{selectedUser?.id}</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Current Role</p>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${selectedUser?.role === 'admin'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}>
                            {selectedUser?.role === 'admin' ? <ShieldCheck size={14} /> : <Shield size={14} />}
                            {selectedUser?.role}
                        </span>
                    </div>

                    <p className="text-sm text-slate-600">Select new role:</p>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleRoleChange('citizen')}
                            disabled={updating || selectedUser?.role === 'citizen'}
                            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all disabled:opacity-50 ${selectedUser?.role === 'citizen'
                                    ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500'
                                    : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                                }`}
                        >
                            <Shield size={18} />
                            Citizen
                            {selectedUser?.role === 'citizen' && <CheckCircle size={16} />}
                        </button>
                        <button
                            onClick={() => handleRoleChange('admin')}
                            disabled={updating || selectedUser?.role === 'admin'}
                            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all disabled:opacity-50 ${selectedUser?.role === 'admin'
                                    ? 'bg-amber-100 text-amber-700 border-2 border-amber-500'
                                    : 'bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-700'
                                }`}
                        >
                            <ShieldCheck size={18} />
                            Admin
                            {selectedUser?.role === 'admin' && <CheckCircle size={16} />}
                        </button>
                    </div>

                    {updating && (
                        <p className="text-center text-sm text-indigo-600">Updating role...</p>
                    )}
                </div>
            </Modal>
        </div>
    );
};

