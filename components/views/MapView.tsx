import React, { useState, useEffect } from 'react';
import { Landmark } from '../../types';
import { api } from '../../services/api';
import { useTranslation } from '../../i18n';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, Icons, Button } from '../ui';

const { getLandmarks } = api;

export const MapView: React.FC = () => {
    const { t, language } = useTranslation();
    const [landmarks, setLandmarks] = useState<Landmark[]>([]);
    const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
    const [loading, setLoading] = useState(true);

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
            <div className="relative h-full pb-20">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    {t('map_view')}
                </h2>

                <div className="rounded-3xl overflow-hidden shadow-lg" style={{ height: 'calc(100vh - 200px)' }}>
                    <MapContainer
                        center={[41.5128, 20.9574]}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />

                        {landmarks.map((landmark) => (
                            <Marker
                                key={landmark.id}
                                position={[landmark.latitude, landmark.longitude]}
                                eventHandlers={{
                                    click: () => setSelectedLandmark(landmark)
                                }}
                            >
                                <Popup>
                                    <div className="text-center">
                                        <strong>{getTitle(landmark)}</strong>
                                        <br />
                                        <span className="text-xs text-slate-500">{landmark.category}</span>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>

            {selectedLandmark && (
                <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
                    <div className="flex items-center justify-between p-4 text-white">
                        <span className="text-sm capitalize">{selectedLandmark.category}</span>
                        <button
                            onClick={() => setSelectedLandmark(null)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <Icon path={Icons.x} size={24} />
                        </button>
                    </div>

                    {selectedLandmark.photo_url && (
                        <div className="flex-1 flex items-center justify-center p-4">
                            <img
                                src={selectedLandmark.photo_url}
                                alt={getTitle(selectedLandmark)}
                                className="max-w-full max-h-full object-contain rounded-2xl"
                            />
                        </div>
                    )}

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-t-3xl">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                                {selectedLandmark.category}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                            {getTitle(selectedLandmark)}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
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
