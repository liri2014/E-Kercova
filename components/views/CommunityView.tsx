import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useTranslation } from '../../i18n';
import { Icon, Icons, Button } from '../ui';

interface CommunityReport {
    id: string;
    title: string;
    category: string;
    description: string;
    status: string;
    lat: number;
    lng: number;
    photo_urls: string[];
    upvotes_count: number;
    comments_count: number;
    created_at: string;
    user_id: string;
    has_upvoted?: boolean;
    distance?: number;
    profiles?: {
        first_name: string;
        last_name: string;
    };
}


const CATEGORY_ICONS: Record<string, string> = {
    road: Icons.car,
    lighting: '💡',
    garbage: '🗑️',
    greenery: '🌳',
    water: '💧',
    other: Icons.alertCircle,
};

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export const CommunityView: React.FC = () => {
    const { t } = useTranslation();
    const [reports, setReports] = useState<CommunityReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<CommunityReport | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [filter, setFilter] = useState<'nearby' | 'recent' | 'popular'>('recent');
    const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);

    useEffect(() => {
        // Get current user
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setCurrentUserId(user.id);
        });

        // Get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => console.log('Location not available')
            );
        }

        fetchReports();
    }, [filter]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('reports')
                .select(`
                    *,
                    profiles:user_id (first_name, last_name)
                `)
                .order(filter === 'popular' ? 'upvotes_count' : 'created_at', { ascending: false })
                .limit(50);

            const { data, error } = await query;

            if (error) throw error;

            // Get user's upvotes
            const { data: { user } } = await supabase.auth.getUser();
            let userUpvotes: string[] = [];
            if (user) {
                const { data: upvotes } = await supabase
                    .from('report_upvotes')
                    .select('report_id')
                    .eq('user_id', user.id);
                userUpvotes = upvotes?.map(u => u.report_id) || [];
            }

            let processedReports = (data || []).map(report => ({
                ...report,
                has_upvoted: userUpvotes.includes(report.id),
                distance: userLocation ? calculateDistance(
                    userLocation.lat, userLocation.lng,
                    report.lat, report.lng
                ) : undefined,
            }));

            // Sort by distance if nearby filter
            if (filter === 'nearby' && userLocation) {
                processedReports.sort((a, b) => (a.distance || 999) - (b.distance || 999));
            }

            setReports(processedReports);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const handleUpvote = async (report: CommunityReport) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return alert('Please log in to upvote');

        try {
            if (report.has_upvoted) {
                // Remove upvote
                await supabase
                    .from('report_upvotes')
                    .delete()
                    .eq('report_id', report.id)
                    .eq('user_id', user.id);
            } else {
                // Add upvote
                await supabase
                    .from('report_upvotes')
                    .insert({ report_id: report.id, user_id: user.id });
            }

            // Update local state
            setReports(reports.map(r => {
                if (r.id === report.id) {
                    return {
                        ...r,
                        has_upvoted: !r.has_upvoted,
                        upvotes_count: r.has_upvoted ? r.upvotes_count - 1 : r.upvotes_count + 1,
                    };
                }
                return r;
            }));

            if (selectedReport?.id === report.id) {
                setSelectedReport({
                    ...selectedReport,
                    has_upvoted: !selectedReport.has_upvoted,
                    upvotes_count: selectedReport.has_upvoted 
                        ? selectedReport.upvotes_count - 1 
                        : selectedReport.upvotes_count + 1,
                });
            }
        } catch (error) {
            console.error('Error toggling upvote:', error);
        }
    };

    const openReportDetails = (report: CommunityReport) => {
        setSelectedReport(report);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {t('community_reports') || 'Community Reports'}
                </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {(['recent', 'popular', 'nearby'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                            filter === f
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                    >
                        {f === 'recent' && '🕐 Recent'}
                        {f === 'popular' && '🔥 Popular'}
                        {f === 'nearby' && '📍 Nearby'}
                    </button>
                ))}
            </div>

            {/* Reports List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
            ) : reports.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                    No reports found in your area
                </div>
            ) : (
                <div className="space-y-4">
                    {reports.map(report => (
                        <div
                            key={report.id}
                            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                            onClick={() => openReportDetails(report)}
                        >
                            {/* Photo - Full Width */}
                            {report.photo_urls?.[0] && (
                                <div className="relative w-full h-48">
                                    <img 
                                        src={report.photo_urls[0]} 
                                        alt="" 
                                        className="w-full h-full object-cover"
                                    />
                                    {report.photo_urls.length > 1 && (
                                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs">
                                            +{report.photo_urls.length - 1} more
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Report Content */}
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[report.status] || STATUS_COLORS.pending}`}>
                                        {report.status}
                                    </span>
                                    {report.distance !== undefined && (
                                        <span className="text-xs text-slate-500">
                                            {report.distance < 1 
                                                ? `${Math.round(report.distance * 1000)}m` 
                                                : `${report.distance.toFixed(1)}km`
                                            }
                                        </span>
                                    )}
                                    <span className="text-xs text-slate-400 ml-auto capitalize">
                                        {report.category}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">
                                    {report.title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                                    {report.description}
                                </p>
                                <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                                    <span>{formatDate(report.created_at)}</span>
                                    {report.profiles && (
                                        <>
                                            <span>•</span>
                                            <span>{report.profiles.first_name} {report.profiles.last_name?.[0]}.</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Actions Bar */}
                            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-4 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleUpvote(report); }}
                                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                                        report.has_upvoted 
                                            ? 'text-indigo-600' 
                                            : 'text-slate-500 hover:text-indigo-600'
                                    }`}
                                >
                                    <Icon 
                                        path="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" 
                                        size={18} 
                                    />
                                    <span>{report.upvotes_count || 0}</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Report Detail Modal */}
            {selectedReport && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t('report_details')}</h3>
                            <button onClick={() => setSelectedReport(null)} className="p-2 text-slate-500">
                                <Icon path={Icons.x} size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* Photos */}
                            {selectedReport.photo_urls && selectedReport.photo_urls.length > 0 && (
                                <div className="space-y-2">
                                    {selectedReport.photo_urls.map((url, idx) => (
                                        <img 
                                            key={idx}
                                            src={url} 
                                            alt="" 
                                            className="w-full rounded-xl object-contain bg-slate-100 dark:bg-slate-800 cursor-pointer"
                                            onClick={() => setFullscreenPhoto(url)}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Title & Status */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[selectedReport.status]}`}>
                                        {selectedReport.status}
                                    </span>
                                    <span className="text-xs text-slate-500 capitalize">{selectedReport.category}</span>
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {selectedReport.title}
                                </h2>
                            </div>

                            {/* Description */}
                            <p className="text-slate-600 dark:text-slate-400">
                                {selectedReport.description}
                            </p>

                            {/* Stats */}
                            <div className="flex items-center gap-4 py-3 border-t border-slate-200 dark:border-slate-700">
                                <button
                                    onClick={() => handleUpvote(selectedReport)}
                                    className={`flex items-center gap-2 ${
                                        selectedReport.has_upvoted ? 'text-indigo-600' : 'text-slate-500'
                                    }`}
                                >
                                    <Icon path="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" size={20} />
                                    <span className="font-medium">{selectedReport.upvotes_count} {t('upvotes')}</span>
                                </button>
                                <span className="text-slate-400">•</span>
                                <span className="text-slate-500">{formatDate(selectedReport.created_at)}</span>
                            </div>

                            {/* Reporter Info */}
                            {selectedReport.profiles && (
                                <div className="text-sm text-slate-500">
                                    Reported by {selectedReport.profiles.first_name} {selectedReport.profiles.last_name?.[0]}.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Fullscreen Photo Viewer */}
            {fullscreenPhoto && (
                <div 
                    className="fixed inset-0 bg-black z-[60] flex items-center justify-center"
                    onClick={() => setFullscreenPhoto(null)}
                >
                    <button
                        onClick={() => setFullscreenPhoto(null)}
                        className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
                        style={{ marginTop: 'env(safe-area-inset-top)' }}
                    >
                        <Icon path={Icons.x} size={24} className="text-white" />
                    </button>
                    <img
                        src={fullscreenPhoto}
                        alt="Full size"
                        className="max-w-full max-h-full object-contain p-4"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default CommunityView;

