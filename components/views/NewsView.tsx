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
        const titleKey = `title_${language}` as 'title_en' | 'title_mk' | 'title_sq';
        return news[titleKey] || news.title_en || news.title || '';
    };

    const getNewsDescription = (news: NewsItem) => {
        const descKey = `description_${language}` as 'description_en' | 'description_mk' | 'description_sq';
        return news[descKey] || news.description_en || news.description || '';
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
                    {/* Header */}
                    <div
                        className="flex items-center justify-between p-4 text-white bg-black/50 backdrop-blur-md z-10"
                        style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}
                    >
                        <span className="text-sm">{formatDate(selectedNews.start_date)}</span>
                        <button
                            onClick={() => setSelectedNews(null)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <Icon path={Icons.close} size={24} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div
                        className="flex-1 overflow-y-auto"
                        onScroll={(e) => {
                            const scrollTop = e.currentTarget.scrollTop;
                            setScrollY(scrollTop);
                        }}
                    >
                        {/* Horizontal Scroll Photo Carousel - Shrinks on scroll */}
                        {selectedNews.photo_urls && selectedNews.photo_urls.length > 0 && (
                            <div
                                className="sticky top-0 z-0 transition-all duration-300 bg-black"
                                style={{
                                    height: `${Math.max(33, 85 - (scrollY / 10))}vh`
                                }}
                            >
                                <div
                                    className="h-full w-full overflow-x-auto snap-x snap-mandatory flex no-scrollbar bg-black"
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
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Photo dots indicator */}
                                {selectedNews.photo_urls.length > 1 && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                        {selectedNews.photo_urls.map((_, index) => (
                                            <div
                                                key={index}
                                                className={`h-2 rounded-full transition-all duration-300 ${index === currentPhotoIndex
                                                    ? 'w-8 bg-white'
                                                    : 'w-2 bg-white/40'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Content - Scrolls under photo */}
                        <div className="bg-white dark:bg-slate-900 min-h-[67vh] sm:min-h-[60vh] p-6 space-y-4 rounded-t-3xl -mt-6 relative z-1">
                            <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold uppercase ${selectedNews.type === NewsType.CONSTRUCTION ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>
                                {selectedNews.type}
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{getNewsTitle(selectedNews)}</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">{getNewsDescription(selectedNews)}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
