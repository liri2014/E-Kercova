import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Filter, MapPin, CheckCircle, Clock, AlertTriangle, Trash2 } from 'lucide-react';

export const Reports: React.FC = () => {
    const [reports, setReports] = useState<any[]>([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        setLoading(true);
        let query = supabase
            .from('reports')
            .select(`
                *,
                profiles:user_id (
                    phone
                )
            `)
            .order('created_at', { ascending: false });
        if (filter !== 'all') {
            query = query.eq('status', filter);
        }
        const { data, error } = await query;
        if (error) console.error(error);
        else setReports(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchReports();
    }, [filter]);

    const updateStatus = async (id: string, status: string) => {
        const { error } = await supabase.from('reports').update({ status }).eq('id', id);
        if (error) {
            console.error(error);
            alert(`Failed to update status: ${error.message}`);
        } else {
            fetchReports();
        }
    };

    const deleteReport = async (id: string) => {
        if (confirm('Are you sure you want to delete this report?')) {
            const { error } = await supabase.from('reports').delete().eq('id', id);
            if (error) {
                console.error(error);
                alert(`Failed to delete report: ${error.message}`);
            } else {
                fetchReports();
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'in_progress': return 'bg-blue-100 text-blue-700';
            case 'resolved': return 'bg-green-100 text-green-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Reports Management</h1>
                <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                    <Filter size={18} className="text-slate-400 ml-2" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm font-medium text-slate-700"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-500">Loading reports...</div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {reports.map((report) => (
                        <div key={report.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-6">
                            <img
                                src={report.photo_url || 'https://via.placeholder.com/150'}
                                alt="Report"
                                className="w-32 h-32 object-cover rounded-xl bg-slate-100"
                            />
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(report.status)}`}>
                                            {report.status}
                                        </span>
                                        <h3 className="text-xl font-bold text-slate-900 mt-2">{report.title || 'Untitled Report'}</h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => updateStatus(report.id, 'resolved')} className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors" title="Mark Resolved">
                                            <CheckCircle size={20} />
                                        </button>
                                        <button onClick={() => deleteReport(report.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Delete">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-slate-600 mb-4 line-clamp-2">{report.description}</p>

                                <div className="flex items-center gap-6 text-sm text-slate-500">
                                    {report.profiles?.phone && (
                                        <div className="flex items-center gap-2 font-medium text-slate-700">
                                            <span>📱</span>
                                            <span>{report.profiles.phone}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} />
                                        <span>{report.lat.toFixed(4)}, {report.lng.toFixed(4)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} />
                                        <span>{new Date(report.created_at).toLocaleDateString()}</span>
                                    </div>
                                    {report.ai_analysis_json && (
                                        <div className="flex items-center gap-2 text-indigo-600">
                                            <AlertTriangle size={16} />
                                            <span className="font-medium">AI Analyzed</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4">
                                    <label className="text-xs font-medium text-slate-500 mb-1 block">Change Status</label>
                                    <select
                                        value={report.status}
                                        onChange={(e) => updateStatus(report.id, e.target.value)}
                                        className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
