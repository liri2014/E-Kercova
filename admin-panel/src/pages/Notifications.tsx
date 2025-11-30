import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { Bell, Send, Users, Shield, ShieldCheck, Trash2, Clock, CheckCircle } from 'lucide-react';
import { Modal } from '../components/Modal';

interface Notification {
    id: string;
    title: string;
    body: string;
    target_type: string;
    target_count: number;
    status: string;
    created_at: string;
}

export const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSendModal, setShowSendModal] = useState(false);
    const [sending, setSending] = useState(false);
    const [userStats, setUserStats] = useState({ total: 0, withToken: 0 });

    const [formData, setFormData] = useState({
        title: '',
        body: '',
        target: 'all' as 'all' | 'citizens' | 'admins'
    });

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setNotifications(data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserStats = async () => {
        try {
            const { count: total } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            const { count: withToken } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .not('fcm_token', 'is', null);

            setUserStats({
                total: total || 0,
                withToken: withToken || 0
            });
        } catch (error) {
            console.error('Error fetching user stats:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        fetchUserStats();
    }, []);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        try {
            await api.notifications.send({
                title: formData.title,
                body: formData.body,
                target: formData.target
            });

            setShowSendModal(false);
            setFormData({ title: '', body: '', target: 'all' });
            fetchNotifications();
            alert('Notification sent successfully!');
        } catch (error) {
            console.error('Error sending notification:', error);
            alert(`Failed to send: ${error}`);
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this notification from history?')) return;

        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
            alert(`Failed to delete: ${error}`);
        }
    };

    const getTargetIcon = (target: string) => {
        switch (target) {
            case 'admins': return <ShieldCheck size={16} className="text-amber-600" />;
            case 'citizens': return <Shield size={16} className="text-emerald-600" />;
            default: return <Users size={16} className="text-indigo-600" />;
        }
    };

    const getTargetLabel = (target: string) => {
        switch (target) {
            case 'admins': return 'Admins Only';
            case 'citizens': return 'Citizens Only';
            case 'specific': return 'Specific Users';
            default: return 'All Users';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Push Notifications</h1>
                <button
                    onClick={() => setShowSendModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                >
                    <Send size={20} />
                    Send Notification
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Total Users</p>
                        <h3 className="text-2xl font-bold text-slate-900">{userStats.total}</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-emerald-50 text-emerald-600">
                        <Bell size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Push Enabled</p>
                        <h3 className="text-2xl font-bold text-slate-900">{userStats.withToken}</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-amber-50 text-amber-600">
                        <Send size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Sent This Month</p>
                        <h3 className="text-2xl font-bold text-slate-900">{notifications.length}</h3>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Push notifications require users to have the mobile app installed with notifications enabled.
                    Currently {userStats.withToken} out of {userStats.total} users have push notifications enabled.
                </p>
            </div>

            {/* Notification History */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Notification History</h2>

                {loading ? (
                    <div className="text-center py-10 text-slate-500">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center text-slate-500">
                        <Bell size={48} className="mx-auto mb-4 text-slate-300" />
                        <p>No notifications sent yet</p>
                        <p className="text-sm mt-1">Click "Send Notification" to get started</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between gap-4"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
                                        <Bell size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{notification.title}</h3>
                                        <p className="text-slate-600 text-sm mt-1">{notification.body}</p>
                                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                {getTargetIcon(notification.target_type)}
                                                {getTargetLabel(notification.target_type)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users size={14} />
                                                {notification.target_count} recipients
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {new Date(notification.created_at).toLocaleString()}
                                            </span>
                                            <span className="flex items-center gap-1 text-emerald-600">
                                                <CheckCircle size={14} />
                                                {notification.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(notification.id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Send Modal */}
            <Modal isOpen={showSendModal} onClose={() => setShowSendModal(false)} title="Send Push Notification">
                <form onSubmit={handleSend} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Target Audience</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, target: 'all' })}
                                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium transition-all ${formData.target === 'all'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                <Users size={16} />
                                All
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, target: 'citizens' })}
                                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium transition-all ${formData.target === 'citizens'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                <Shield size={16} />
                                Citizens
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, target: 'admins' })}
                                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium transition-all ${formData.target === 'admins'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                <ShieldCheck size={16} />
                                Admins
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                            placeholder="Notification title..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                        <textarea
                            required
                            value={formData.body}
                            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                            rows={3}
                            placeholder="Notification message..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={sending}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                    >
                        <Send size={18} />
                        {sending ? 'Sending...' : 'Send Notification'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

