import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useTranslation } from '../../i18n';
import { Icon, Icons, Button } from '../ui';

interface CityService {
    id: string;
    name_en: string;
    name_mk: string;
    name_sq: string;
    description_en: string;
    description_mk: string;
    description_sq: string;
    icon: string;
    category: 'utility' | 'document' | 'appointment';
    url?: string;
}

interface ServiceRequest {
    id: string;
    service_type: string;
    status: string;
    details: Record<string, any>;
    scheduled_date?: string;
    created_at: string;
}

const SERVICE_ICONS: Record<string, string> = {
    droplet: '💧',
    zap: '⚡',
    home: '🏠',
    'file-text': '📄',
    heart: '💕',
    building: '🏗️',
    calendar: '📅',
    trash: '🗑️',
    lightbulb: '💡',
};

const CATEGORY_LABELS = {
    utility: { en: 'Utility Bills', mk: 'Сметки', sq: 'Faturat' },
    document: { en: 'Documents', mk: 'Документи', sq: 'Dokumente' },
    appointment: { en: 'Appointments', mk: 'Закажувања', sq: 'Takime' },
};

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const ServicesView: React.FC = () => {
    const { t, language } = useTranslation();
    const [services, setServices] = useState<CityService[]>([]);
    const [myRequests, setMyRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'services' | 'requests'>('services');
    const [selectedService, setSelectedService] = useState<CityService | null>(null);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [requestDetails, setRequestDetails] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch services
            const { data: servicesData } = await supabase
                .from('city_services')
                .select('*')
                .eq('is_active', true)
                .order('category');

            setServices(servicesData || []);

            // Fetch user's requests
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: requestsData } = await supabase
                    .from('service_requests')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                setMyRequests(requestsData || []);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    const getServiceName = (service: CityService) => {
        if (language === 'mk' && service.name_mk) return service.name_mk;
        if (language === 'sq' && service.name_sq) return service.name_sq;
        return service.name_en;
    };

    const getServiceDescription = (service: CityService) => {
        if (language === 'mk' && service.description_mk) return service.description_mk;
        if (language === 'sq' && service.description_sq) return service.description_sq;
        return service.description_en;
    };

    const getCategoryLabel = (category: string) => {
        const labels = CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS];
        if (!labels) return category;
        return labels[language as keyof typeof labels] || labels.en;
    };

    const handleServiceClick = (service: CityService) => {
        if (service.url) {
            window.open(service.url, '_blank');
        } else {
            setSelectedService(service);
            setShowRequestForm(true);
        }
    };

    const handleSubmitRequest = async () => {
        if (!selectedService) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return alert('Please log in to submit a request');

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('service_requests')
                .insert({
                    user_id: user.id,
                    service_id: selectedService.id,
                    service_type: selectedService.category,
                    details: requestDetails,
                    scheduled_date: requestDetails.date || null,
                });

            if (error) throw error;

            setShowRequestForm(false);
            setSelectedService(null);
            setRequestDetails({});
            fetchData(); // Refresh requests
            alert(t('request_submitted') || 'Request submitted successfully!');
        } catch (error) {
            console.error('Error submitting request:', error);
            alert('Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    const groupedServices = services.reduce((acc, service) => {
        if (!acc[service.category]) acc[service.category] = [];
        acc[service.category].push(service);
        return acc;
    }, {} as Record<string, CityService[]>);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(
            language === 'mk' ? 'mk-MK' : language === 'sq' ? 'sq-AL' : 'en-US',
            { year: 'numeric', month: 'short', day: 'numeric' }
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t('city_services') || 'City Services'}
            </h2>

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('services')}
                    className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                        activeTab === 'services'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                >
                    {t('available_services') || 'Services'}
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`flex-1 py-3 rounded-xl font-medium transition-colors relative ${
                        activeTab === 'requests'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                >
                    {t('my_requests') || 'My Requests'}
                    {myRequests.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {myRequests.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Services Tab */}
            {activeTab === 'services' && (
                <div className="space-y-6">
                    {Object.entries(groupedServices).map(([category, categoryServices]) => (
                        <div key={category}>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                                {getCategoryLabel(category)}
                            </h3>
                            <div className="grid gap-3">
                                {categoryServices.map(service => (
                                    <button
                                        key={service.id}
                                        onClick={() => handleServiceClick(service)}
                                        className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 text-left hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-3xl">
                                                {SERVICE_ICONS[service.icon] || '📋'}
                                            </span>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-slate-900 dark:text-white">
                                                    {getServiceName(service)}
                                                </h4>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {getServiceDescription(service)}
                                                </p>
                                            </div>
                                            <Icon path={Icons.chevronRight} size={20} className="text-slate-400" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
                <div className="space-y-4">
                    {myRequests.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <Icon path={Icons.file} size={48} className="mx-auto mb-4 opacity-50" />
                            <p>{t('no_requests') || 'No service requests yet'}</p>
                        </div>
                    ) : (
                        myRequests.map(request => (
                            <div
                                key={request.id}
                                className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[request.status]}`}>
                                        {request.status}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {formatDate(request.created_at)}
                                    </span>
                                </div>
                                <h4 className="font-semibold text-slate-900 dark:text-white capitalize">
                                    {request.service_type.replace('_', ' ')}
                                </h4>
                                {request.details && Object.keys(request.details).length > 0 && (
                                    <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                        {Object.entries(request.details).map(([key, value]) => (
                                            <p key={key}><span className="capitalize">{key}:</span> {value}</p>
                                        ))}
                                    </div>
                                )}
                                {request.scheduled_date && (
                                    <p className="mt-2 text-sm text-indigo-600 dark:text-indigo-400">
                                        📅 Scheduled: {formatDate(request.scheduled_date)}
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Request Form Modal */}
            {showRequestForm && selectedService && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                {getServiceName(selectedService)}
                            </h3>
                            <button 
                                onClick={() => {
                                    setShowRequestForm(false);
                                    setSelectedService(null);
                                    setRequestDetails({});
                                }} 
                                className="p-2 text-slate-500"
                            >
                                <Icon path={Icons.x} size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-4 space-y-4">
                            <p className="text-slate-600 dark:text-slate-400">
                                {getServiceDescription(selectedService)}
                            </p>

                            {/* Dynamic form fields based on service type */}
                            {selectedService.category === 'utility' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Account Number
                                        </label>
                                        <input
                                            type="text"
                                            value={requestDetails.accountNumber || ''}
                                            onChange={(e) => setRequestDetails({ ...requestDetails, accountNumber: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Enter your account number"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Amount (MKD)
                                        </label>
                                        <input
                                            type="number"
                                            value={requestDetails.amount || ''}
                                            onChange={(e) => setRequestDetails({ ...requestDetails, amount: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Enter amount"
                                        />
                                    </div>
                                </>
                            )}

                            {selectedService.category === 'document' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Full Name (as on document)
                                        </label>
                                        <input
                                            type="text"
                                            value={requestDetails.fullName || ''}
                                            onChange={(e) => setRequestDetails({ ...requestDetails, fullName: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Personal ID Number
                                        </label>
                                        <input
                                            type="text"
                                            value={requestDetails.personalId || ''}
                                            onChange={(e) => setRequestDetails({ ...requestDetails, personalId: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Enter your ID number"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Number of Copies
                                        </label>
                                        <select
                                            value={requestDetails.copies || '1'}
                                            onChange={(e) => setRequestDetails({ ...requestDetails, copies: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="1">1 copy</option>
                                            <option value="2">2 copies</option>
                                            <option value="3">3 copies</option>
                                            <option value="5">5 copies</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {selectedService.category === 'appointment' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Preferred Date
                                        </label>
                                        <input
                                            type="date"
                                            value={requestDetails.date || ''}
                                            onChange={(e) => setRequestDetails({ ...requestDetails, date: e.target.value })}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Preferred Time
                                        </label>
                                        <select
                                            value={requestDetails.time || ''}
                                            onChange={(e) => setRequestDetails({ ...requestDetails, time: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">Select time slot</option>
                                            <option value="09:00">09:00 - 10:00</option>
                                            <option value="10:00">10:00 - 11:00</option>
                                            <option value="11:00">11:00 - 12:00</option>
                                            <option value="13:00">13:00 - 14:00</option>
                                            <option value="14:00">14:00 - 15:00</option>
                                            <option value="15:00">15:00 - 16:00</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Notes (optional)
                                        </label>
                                        <textarea
                                            value={requestDetails.notes || ''}
                                            onChange={(e) => setRequestDetails({ ...requestDetails, notes: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                            placeholder="Any additional information..."
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                            <Button fullWidth onClick={handleSubmitRequest} disabled={submitting}>
                                {submitting ? 'Submitting...' : t('submit_request') || 'Submit Request'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServicesView;

