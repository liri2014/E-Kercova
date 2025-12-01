import React, { useState, useEffect } from 'react';
import { NewsItem, NewsType } from '../../types';
import { api } from '../../services/api';
import { useTranslation } from '../../i18n';
import { Icon, Icons, Card } from '../ui';

const { getNews } = api;

export const NewsView: React.FC = () => {
    const { t, language } = useTranslation();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        getNews().then(data => {
            setNews(data);
            setLoading(false);
        }).catch(err => {
            console.error('Failed to fetch news:', err);
            setLoading(false);
        });
    }, []);

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            return date.toLocaleDateString();
        } catch {
            return 'N/A';
        }
    };

    const getNewsTitle = (news: NewsItem) => {
        // Try language-specific first, then fallback chain
        if (language === 'mk' && news.title_mk) return news.title_mk;
        if (language === 'sq' && news.title_sq) return news.title_sq;
        if (language === 'en' && news.title_en) return news.title_en;
        // Fallback to any available translation
        return news.title_en || news.title_mk || news.title_sq || news.title || '';
    };

    const getNewsDescription = (news: NewsItem) => {
        // Try language-specific first, then fallback chain
        if (language === 'mk' && news.description_mk) return news.description_mk;
        if (language === 'sq' && news.description_sq) return news.description_sq;
        if (language === 'en' && news.description_en) return news.description_en;
        // Fallback to any available translation
        return news.description_en || news.description_mk || news.description_sq || news.description || '';
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
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{t('news')}</h2>
                {news.length === 0 ? (
                    <p className="text-slate-500 text-center py-10">No news available</p>
                ) : (
                    news.map(item => (
                        <Card
                            key={item.id}
                            className="p-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => {
                                setSelectedNews(item);
                                setCurrentPhotoIndex(0);
                                setScrollY(0);
                            }}
                        >
                            {/* Photo thumbnail - Full Width */}
                            {item.photo_urls && item.photo_urls.length > 0 && (
                                <div className="relative w-full h-48">
                                    <img
                                        src={item.photo_urls[0]}
                                        alt={getNewsTitle(item)}
                                        className="w-full h-full object-cover"
                                    />
                                    {item.photo_urls.length > 1 && (
                                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs">
                                            +{item.photo_urls.length - 1} more
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Content with padding */}
                            <div className="p-5 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${item.type === NewsType.CONSTRUCTION ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>
                                        {item.type}
                                    </span>
                                    <span className="text-xs text-slate-400">{formatDate(item.start_date)}</span>
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{getNewsTitle(item)}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{getNewsDescription(item)}</p>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Full-screen News Viewer Modal */}
            {selectedNews && (
                <div className="fixed inset-0 bg-black z-50 flex flex-col">
                    {/* Header - Fixed */}
                    <div
                        className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm z-20"
                        style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}
                    >
                        <span className="text-sm text-white/70">{formatDate(selectedNews.start_date)}</span>
                        <button
                            onClick={() => { setSelectedNews(null); setScrollY(0); }}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <Icon path={Icons.close} size={24} className="text-white" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div 
                        className="flex-1 overflow-y-auto"
                        onScroll={(e) => setScrollY(e.currentTarget.scrollTop)}
                    >
                        {/* Photo Carousel - Shrinks on scroll */}
                        {selectedNews.photo_urls && selectedNews.photo_urls.length > 0 && (
                            <div 
                                className="sticky top-0 z-10 bg-black overflow-hidden transition-all duration-100"
                                style={{
                                    height: `${Math.max(0, 60 - (scrollY / 5))}vh`,
                                    opacity: Math.max(0, 1 - (scrollY / 300))
                                }}
                            >
                                {/* Horizontal Scroll Container */}
                                <div 
                                    className="flex h-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
                                    onScroll={(e) => {
                                        const container = e.currentTarget;
                                        const scrollLeft = container.scrollLeft;
                                        const itemWidth = container.offsetWidth;
                                        const newIndex = Math.round(scrollLeft / itemWidth);
                                        setCurrentPhotoIndex(newIndex);
                                    }}
                                >
                                    {selectedNews.photo_urls.map((photoUrl, index) => (
                                        <div 
                                            key={index} 
                                            className="flex-shrink-0 w-full h-full snap-center flex items-center justify-center"
                                        >
                                            <img
                                                src={photoUrl}
                                                alt={`${getNewsTitle(selectedNews)} - Photo ${index + 1}`}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Dots Indicator */}
                                {selectedNews.photo_urls.length > 1 && (
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                                        {selectedNews.photo_urls.map((_, index) => (
                                            <div
                                                key={index}
                                                className={`rounded-full transition-all duration-300 ${
                                                    index === currentPhotoIndex
                                                        ? 'w-2 h-2 bg-white'
                                                        : 'w-1.5 h-1.5 bg-white/50'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Photo Counter */}
                                {selectedNews.photo_urls.length > 1 && (
                                    <div className="absolute top-3 right-3 bg-black/60 text-white px-2.5 py-1 rounded-full text-xs font-medium">
                                        {currentPhotoIndex + 1} / {selectedNews.photo_urls.length}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Content - Scrolls over photo */}
                        <div className="bg-white dark:bg-slate-900 min-h-screen rounded-t-3xl -mt-6 relative z-20 pt-6">
                            {/* Type Badge */}
                            <div className="px-4 pb-2">
                                <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold uppercase ${selectedNews.type === NewsType.CONSTRUCTION ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>
                                    {selectedNews.type}
                                </span>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white px-4 pb-4">
                                {getNewsTitle(selectedNews)}
                            </h2>

                            {/* Description */}
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base px-4 pb-20">
                                {getNewsDescription(selectedNews)}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
