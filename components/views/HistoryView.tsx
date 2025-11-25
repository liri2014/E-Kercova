import React, { useState, useEffect } from 'react';
import { Report } from '../../types';
import { useTranslation } from '../../i18n';
import { Icon, Icons, Card } from '../ui';

export const HistoryView: React.FC = () => {
    const { t } = useTranslation();
    const [reports, setReports] = useState<Report[]>([]);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('submittedReports');
        if (stored) setReports(JSON.parse(stored));
    }, []);

    return (
        <>
            <div className="space-y-4 pb-20">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('report_history')}</h2>
                {reports.length === 0 ? (
                    <p className="text-slate-500 text-center py-10">{t('no_reports_yet')}</p>
                ) : (
                    reports.map(r => (
                        <Card
                            key={r.id}
                            className="flex gap-4 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            onClick={() => setSelectedReport(r)}
                        >
                            <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                                {r.photoPreviewUrl ? (
                                    <img src={r.photoPreviewUrl} className="w-full h-full object-cover" alt={r.title} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <Icon path={Icons.image} size={24} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-900 dark:text-white truncate">{r.title}</h4>
                                <p className="text-xs text-slate-500 mb-2">{new Date(r.timestamp).toLocaleDateString()} • {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                <span className="inline-block px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs rounded-md font-medium">
                                    {t(r.category)}
                                </span>
                            </div>
                            <div className="flex items-center text-slate-300">
                                <Icon path={Icons.chevronRight} size={20} />
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Report Details Modal */}
            {selectedReport && (
                <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-950 animate-slide-up">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                        <button
                            onClick={() => setSelectedReport(null)}
                            className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <Icon path={Icons.arrowLeft} size={24} />
                        </button>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t('report_details')}</h3>
                        <div className="w-10" /> {/* Spacer for centering */}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Photo */}
                        <div className="aspect-video rounded-2xl bg-slate-100 dark:bg-slate-900 overflow-hidden shadow-sm">
                            {selectedReport.photoPreviewUrl ? (
                                <img src={selectedReport.photoPreviewUrl} className="w-full h-full object-cover" alt={selectedReport.title} />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                    <Icon path={Icons.image} size={48} />
                                    <span className="text-sm">{t('no_photo')}</span>
                                </div>
                            )}
                        </div>

                        {/* Status Badge (Mock) */}
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-bold rounded-full">
                                Pending Review
                            </span>
                            <span className="text-sm text-slate-500">
                                ID: #{selectedReport.id.slice(0, 8)}
                            </span>
                        </div>

                        {/* Title & Category */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{selectedReport.title}</h2>
                            <div className="flex items-center gap-2 text-slate-500">
                                <Icon path={Icons.tag} size={16} />
                                <span>{t(selectedReport.category)}</span>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-2">
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium">
                                <Icon path={Icons.location} size={18} className="text-indigo-500" />
                                {t('location')}
                            </div>
                            <p className="text-sm text-slate-500 pl-6.5">
                                {selectedReport.location.latitude.toFixed(6)}, {selectedReport.location.longitude.toFixed(6)}
                            </p>
                        </div>

                        {/* Timestamp */}
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Icon path={Icons.clock} size={16} />
                            <span>Submitted on {new Date(selectedReport.timestamp).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
