import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Filter, MapPin, CheckCircle, Clock, AlertTriangle, Trash2, X, Eye, User, Calendar, Tag, FileText, Image, Search } from 'lucide-react';
import { Modal } from '../components/Modal';

interface Report {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    photo_url: string;
    lat: number;
    lng: number;
    created_at: string;
    ai_analysis_json: any;
    upvotes_count?: number;
    comments_count?: number;
    profiles?: {
        phone: string;
        first_name: string;
        last_name: string;
    };
}

export const Reports: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchReports = async () => {
        setLoading(true);
        let query = supabase
            .from('reports')
            .select(`
                *,
                profiles:user_id (
                    phone,
                    first_name,
                    last_name
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
            case 'in_progress': case 'in-progress': return 'bg-blue-100 text-blue-700';
            case 'resolved': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    // Filter reports by search query
    const filteredReports = reports.filter(report => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            report.title?.toLowerCase().includes(query) ||
            report.description?.toLowerCase().includes(query) ||
            report.category?.toLowerCase().includes(query) ||
            report.profiles?.first_name?.toLowerCase().includes(query) ||
            report.profiles?.last_name?.toLowerCase().includes(query) ||
            report.profiles?.phone?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Reports Management</h1>
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search reports..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-64"
                        />
                    </div>
                    {/* Filter */}
                    <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                        <Filter size={18} className="text-slate-400 ml-2" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm font-medium text-slate-700"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-sm">
                <span className="px-3 py-1 bg-slate-100 rounded-full text-slate-600">
                    {filteredReports.length} reports
                </span>
                <span className="px-3 py-1 bg-amber-100 rounded-full text-amber-700">
                    {filteredReports.filter(r => r.status === 'pending').length} pending
                </span>
                <span className="px-3 py-1 bg-green-100 rounded-full text-green-700">
                    {filteredReports.filter(r => r.status === 'resolved').length} resolved
                </span>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-500">Loading reports...</div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredReports.map((report) => (
                        <div 
                            key={report.id} 
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-6 cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all"
                            onClick={() => setSelectedReport(report)}
                        >
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
                                        {report.category && (
                                            <span className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                                <Tag size={14} /> {report.category}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => setSelectedReport(report)} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors" title="View Details">
                                            <Eye size={20} />
                                        </button>
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
                                    {report.profiles && (
                                        <div className="flex items-center gap-2 font-medium text-slate-700">
                                            <User size={16} />
                                            <span>
                                                {report.profiles.first_name && report.profiles.last_name 
                                                    ? `${report.profiles.first_name} ${report.profiles.last_name}`
                                                    : report.profiles.phone || 'Unknown'
                                                }
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} />
                                        <span>{report.lat?.toFixed(4)}, {report.lng?.toFixed(4)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} />
                                        <span>{new Date(report.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredReports.length === 0 && (
                        <div className="text-center py-10 text-slate-500">
                            {searchQuery ? 'No reports match your search' : 'No reports found'}
                        </div>
                    )}
                </div>
            )}

            {/* Report Detail Modal */}
            <Modal 
                isOpen={!!selectedReport} 
                onClose={() => setSelectedReport(null)} 
                title="Report Details"
            >
                {selectedReport && (
                    <div className="space-y-6">
                        {/* Photo */}
                        {selectedReport.photo_url && (
                            <div className="relative">
                                <img
                                    src={selectedReport.photo_url}
                                    alt="Report"
                                    className="w-full h-64 object-cover rounded-xl bg-slate-100"
                                />
                                <a 
                                    href={selectedReport.photo_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/50 text-white text-xs rounded-lg hover:bg-black/70 transition-colors flex items-center gap-1"
                                >
                                    <Image size={14} /> View Full Size
                                </a>
                            </div>
                        )}

                        {/* Status & Category */}
                        <div className="flex items-center gap-3">
                            <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${getStatusColor(selectedReport.status)}`}>
                                {selectedReport.status}
                            </span>
                            {selectedReport.category && (
                                <span className="px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-700 flex items-center gap-2">
                                    <Tag size={14} /> {selectedReport.category}
                                </span>
                            )}
                        </div>

                        {/* Title & Description */}
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">{selectedReport.title || 'Untitled Report'}</h3>
                            <p className="text-slate-600 whitespace-pre-wrap">{selectedReport.description || 'No description provided'}</p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Reporter */}
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><User size={12} /> Reported by</p>
                                <p className="font-medium text-slate-900">
                                    {selectedReport.profiles?.first_name && selectedReport.profiles?.last_name 
                                        ? `${selectedReport.profiles.first_name} ${selectedReport.profiles.last_name}`
                                        : 'Unknown User'
                                    }
                                </p>
                                <p className="text-xs text-slate-500 mt-1">{selectedReport.profiles?.phone || 'No phone'}</p>
                            </div>

                            {/* Date */}
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Calendar size={12} /> Submitted</p>
                                <p className="font-medium text-slate-900">
                                    {new Date(selectedReport.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {new Date(selectedReport.created_at).toLocaleTimeString()}
                                </p>
                            </div>

                            {/* Location */}
                            <div className="p-4 bg-slate-50 rounded-xl col-span-2">
                                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><MapPin size={12} /> Location</p>
                                <p className="font-medium text-slate-900">
                                    {selectedReport.lat?.toFixed(6)}, {selectedReport.lng?.toFixed(6)}
                                </p>
                                <a 
                                    href={`https://www.google.com/maps?q=${selectedReport.lat},${selectedReport.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-indigo-600 hover:underline mt-1 inline-block"
                                >
                                    Open in Google Maps →
                                </a>
                            </div>
                        </div>

                        {/* AI Analysis */}
                        {selectedReport.ai_analysis_json && (
                            <div className="p-4 bg-indigo-50 rounded-xl">
                                <p className="text-xs text-indigo-600 mb-2 flex items-center gap-1 font-medium">
                                    <AlertTriangle size={12} /> AI Analysis
                                </p>
                                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono bg-white p-3 rounded-lg overflow-auto max-h-40">
                                    {typeof selectedReport.ai_analysis_json === 'string' 
                                        ? selectedReport.ai_analysis_json 
                                        : JSON.stringify(selectedReport.ai_analysis_json, null, 2)
                                    }
                                </pre>
                            </div>
                        )}

                        {/* Report ID */}
                        <div className="text-xs text-slate-400 font-mono">
                            ID: {selectedReport.id}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-slate-200">
                            <select
                                value={selectedReport.status}
                                onChange={(e) => {
                                    updateStatus(selectedReport.id, e.target.value);
                                    setSelectedReport({ ...selectedReport, status: e.target.value });
                                }}
                                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <button
                                onClick={() => {
                                    deleteReport(selectedReport.id);
                                    setSelectedReport(null);
                                }}
                                className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center gap-2"
                            >
                                <Trash2 size={18} /> Delete
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
