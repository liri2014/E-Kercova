import React, { useState, useEffect } from 'react';
import { Landmark } from '../../types';
import { api } from '../../services/api';
import { useTranslation } from '../../i18n';
import { Icon, Icons, Button, Card } from '../ui';

const { getLandmarks } = api;

export const MapView: React.FC = () => {
    const { t, language } = useTranslation();
    const [landmarks, setLandmarks] = useState<Landmark[]>([]);
    const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    useEffect(() => {
        getLandmarks().then(data => {
            setLandmarks(data);
            setLoading(false);
        }).catch(err => {
            console.error('Failed to fetch landmarks:', err);
            setLoading(false);
        });
    }, []);

    const openNativeMap = (lat: number, lng: number, name: string) => {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const url = isIOS
            ? `maps://maps.apple.com/?daddr=${lat},${lng}`
            : `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(name)})`;
        window.location.href = url;
    };

    const getTitle = (landmark: Landmark) => {
        const key = `title_${language}` as keyof Landmark;
        return landmark[key] as string || landmark.title_en || landmark.title;
    };

    const getDescription = (landmark: Landmark) => {
        const key = `description_${language}` as keyof Landmark;
        return landmark[key] as string || landmark.description_en || landmark.description;
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-slate-500">{t('loading')}</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4 pb-20">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Explore Kicevo
                </h2>

                {/* 2-Column Grid of Landmarks - Responsive */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {landmarks.map((landmark) => (
                        <Card
                            key={landmark.id}
                            className="p-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => {
                                setSelectedLandmark(landmark);
                                setCurrentPhotoIndex(0);
                            }}
                        >
                            {/* Photo */}
                            {landmark.photo_url && (
                                <div className="relative w-full h-32">
                                    <img
                                        src={landmark.photo_url}
                                        alt={getTitle(landmark)}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-3 space-y-2">
                                <span className="inline-block px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-xs font-bold uppercase rounded">
                                    {landmark.category}
                                </span>
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-tight">
                                    {getTitle(landmark)}
                                </h3>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Landmark Details Modal */}
            {selectedLandmark && (
                <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
                    <div className="flex items-center justify-between p-4 text-white">
                        <span className="text-sm capitalize">{selectedLandmark.category}</span>
                        <button
                            onClick={() => setSelectedLandmark(null)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <Icon path={Icons.close} size={24} />
                        </button>
                    </div>

                    {/* Horizontal Scroll Photo Carousel */}
                    {selectedLandmark.photo_url && (
                        <div className="relative flex-1">
                            <div className="h-full flex items-center justify-center p-4">
                                <img
                                    src={selectedLandmark.photo_url}
                                    alt={getTitle(selectedLandmark)}
                                    className="max-w-full max-h-full object-contain rounded-2xl"
                                />
                            </div>
                        </div>
                    )}

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-t-3xl space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400">
                                {selectedLandmark.category}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {getTitle(selectedLandmark)}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            {getDescription(selectedLandmark)}
                        </p>

                        <Button
                            variant="primary"
                            fullWidth
                            onClick={() => openNativeMap(
                                selectedLandmark.latitude,
                                selectedLandmark.longitude,
                                getTitle(selectedLandmark)
                            )}
                            className="gap-2"
                        >
                            <Icon path={Icons.location} size={20} />
                            {t('get_directions')}
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
};
