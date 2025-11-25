import React, { useState, useEffect } from 'react';
import { ReportCategory, GeolocationState, Report } from '../../types';
import { api } from '../../services/api';
import { useTranslation } from '../../i18n';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { supabase } from '../../supabase';
import { Icon, Icons, Button } from '../ui';

export const ReportView: React.FC<{ onViewChange: (view: string) => void, photos: string[], setPhotos: React.Dispatch<React.SetStateAction<string[]>> }> = ({ onViewChange, photos, setPhotos }) => {
    const { t } = useTranslation();
    // Photos state lifted to App component
    const [location, setLocation] = useState<GeolocationState | null>(null);
    const [description, setDescription] = useState(() => localStorage.getItem('reportDescription') || '');
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        localStorage.setItem('reportDescription', description);
    }, [description]);

    // Persist photos to localStorage whenever they change - handled in App component now
    // But we keep this for consistency if needed, though App handles it.
    // Actually, App handles it, so we can remove it here to avoid double writes.

    const [aiResult, setAiResult] = useState<{ title: string; category: ReportCategory } | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);

    useEffect(() => {
        // Test Railway connectivity
        api.testHealth().then(() => {
            console.log('Railway backend is reachable!');
        }).catch(err => {
            console.error('Railway backend is NOT reachable:', err);
        });

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                (err) => {
                    console.error("Location access denied", err);
                },
                { timeout: 10000, enableHighAccuracy: true }
            );
        }
    }, []);

    const handleTakePhoto = async (source: CameraSource) => {
        try {
            const image = await Camera.getPhoto({
                quality: 50,
                width: 1024,
                height: 1024,
                allowEditing: false,
                resultType: CameraResultType.Uri, // Changed to Uri for better stability
                source: source,
                saveToGallery: false
            });

            if (image.webPath) {
                // Convert blob/url to base64 for display/upload
                const response = await fetch(image.webPath);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                        // Update state
                        setPhotos(prev => [...prev, reader.result as string]);
                        setShowPhotoOptions(false); // Close modal only after photo is added
                    }
                };
                reader.readAsDataURL(blob);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            setShowPhotoOptions(false); // Close modal on error
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (photos.length === 0 || !location) return alert(t('error_required_fields'));

        setAnalyzing(true);
        try {
            // Get the authenticated user's ID from Supabase
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Please log in to submit a report');
                setAnalyzing(false);
                return;
            }

            const formData = new FormData();

            // Process all photos in parallel
            const photoPromises = photos.map(async (photoUrl, index) => {
                const response = await fetch(photoUrl);
                const blob = await response.blob();
                return new File([blob], `photo_${index}.jpg`, { type: 'image/jpeg' });
            });

            const files = await Promise.all(photoPromises);
            files.forEach(file => formData.append('photos', file));

            formData.append('user_id', user.id); // Use authenticated user's ID
            formData.append('lat', location.latitude.toString());
            formData.append('lng', location.longitude.toString());
            formData.append('description', description);

            const report = await api.submitReport(formData);

            const newReport: Report = {
                id: report.id,
                title: report.title,
                category: report.category as ReportCategory,
                location,
                photoPreviewUrl: photos[0] || '',
                timestamp: report.created_at
            };

            const existing = localStorage.getItem('submittedReports');
            const reports = existing ? JSON.parse(existing) : [];
            localStorage.setItem('submittedReports', JSON.stringify([newReport, ...reports]));

            // Clear photos and description after successful submission
            setPhotos([]);
            setDescription('');
            localStorage.removeItem('reportPhotos');
            localStorage.removeItem('reportDescription');
            setAiResult({ title: report.title, category: report.category as ReportCategory });
            setShowSuccess(true);
        } catch (e) {
            alert('Failed to submit report: ' + e);
            console.error(e);
        } finally {
            setAnalyzing(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-6 animate-slide-up">
                    <Icon path={Icons.checkCircle} size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('report_submitted')}</h2>
                <p className="text-slate-500 mb-8">{t('report_submitted_desc')}</p>
                <Button onClick={() => onViewChange('dashboard')}>{t('back_to_dashboard')}</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('submit_new_report')}</h2>

            {/* Photo Upload */}
            <div className="space-y-4">
                {photos.length > 0 ? (
                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                        {photos.map((p, index) => (
                            <div key={index} className="relative flex-shrink-0 w-40 h-40 rounded-xl overflow-hidden group">
                                <img src={p} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                                <button
                                    onClick={() => removePhoto(index)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Icon path={Icons.x} size={16} />
                                </button>
                            </div>
                        ))}
                        {photos.length < 5 && (
                            <button
                                onClick={() => setShowPhotoOptions(true)}
                                className="flex-shrink-0 w-40 h-40 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
                            >
                                <Icon path={Icons.plus} size={32} />
                                <span className="text-xs mt-2">{t('add_photo')}</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div
                        onClick={() => setShowPhotoOptions(true)}
                        className="relative aspect-video rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all hover:border-indigo-400 bg-slate-50 dark:bg-slate-800"
                    >
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                <Icon path={Icons.camera} size={32} />
                            </div>
                            <p className="font-medium">{t('tap_to_take_photo')}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Photo Options Modal */}
            {showPhotoOptions && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setShowPhotoOptions(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-t-3xl w-full max-w-md p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('add_photo')}</h3>
                        <Button fullWidth variant="secondary" onClick={() => handleTakePhoto(CameraSource.Camera)}>
                            <Icon path={Icons.camera} size={20} />
                            {t('take_photo')}
                        </Button>
                        <Button fullWidth variant="secondary" onClick={() => handleTakePhoto(CameraSource.Photos)}>
                            <Icon path={Icons.news} size={20} />
                            {t('choose_from_gallery')}
                        </Button>
                        <Button fullWidth variant="ghost" onClick={() => setShowPhotoOptions(false)}>
                            {t('cancel')}
                        </Button>
                    </div>
                </div>
            )}

            {/* Location Status */}
            <div className={`flex items-center gap-3 p-3 rounded-2xl border ${location ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/50' : 'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${location ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400'}`}>
                    <Icon path={Icons.location} size={16} className={!location ? 'animate-pulse' : ''} />
                </div>
                <div>
                    <p className={`text-sm font-semibold ${location ? 'text-emerald-900 dark:text-emerald-100' : 'text-amber-900 dark:text-amber-100'}`}>
                        {location ? t('location_acquired') : t('fetching_location')}
                    </p>
                    <p className="text-xs opacity-70 dark:text-slate-300">
                        {location ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : t('please_wait_gps')}
                    </p>
                </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">{t('brief_description')}</label>
                <textarea
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none text-slate-900 dark:text-white resize-none h-32"
                    placeholder={t('description_placeholder')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <Button fullWidth onClick={handleSubmit} disabled={photos.length === 0 || description.length < 5 || analyzing}>
                {analyzing ? <span className="animate-spin mr-2">⟳</span> : null}
                {analyzing ? t('submitting') : t('submit_report')}
            </Button>
        </div>
    );
};
