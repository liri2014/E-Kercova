import React, { useState, useEffect } from 'react';
import { NewsItem } from '../../types';
import { api } from '../../services/api';
import { useTranslation } from '../../i18n';
import { Icon, Icons, Card } from '../ui';

const { getNews } = api;

interface HomeViewProps {
    onViewChange: (view: string) => void;
    walletBalance: number;
}

export const HomeView: React.FC<HomeViewProps> = ({ onViewChange, walletBalance }) => {
    const { t, language } = useTranslation();
    const hour = new Date().getHours();
    const greeting = hour < 12 ? t('good_morning') : hour < 18 ? t('good_afternoon') : t('good_evening');
    const [latestNews, setLatestNews] = useState<NewsItem | null>(null);
    
    // Get user's first name from localStorage (saved during verification)
    const userName = localStorage.getItem('userName')?.split(' ')[0] || t('citizen');

    useEffect(() => {
        getNews().then(data => {
            if (data && data.length > 0) {
                setLatestNews(data[0]);
            }
        }).catch(err => console.error('Failed to fetch news:', err));
    }, []);

    const getNewsTitle = (news: NewsItem) => {
        const titleKey = `title_${language}` as 'title_en' | 'title_mk' | 'title_sq';
        return news[titleKey] || news.title_en || news.title || '';
    };

    const getNewsDescription = (news: NewsItem) => {
        const descKey = `description_${language}` as 'description_en' | 'description_mk' | 'description_sq';
        return news[descKey] || news.description_en || news.description || '';
    };

    return (
        <div className="space-y-6 pb-6">
            {/* Greeting */}
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{greeting}, {userName}</h2>
                <p className="text-sm sm:text-base text-slate-500">{t('how_can_we_help')}</p>
            </div>

            {/* Mini Wallet Widget */}
            <Card id="home-service-wallet" className="p-5 bg-gradient-to-br from-indigo-600 to-purple-700 border-none text-white" onClick={() => onViewChange('wallet')}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-indigo-100 text-sm font-medium">{t('current_balance')}</p>
                        <h3 className="text-2xl sm:text-3xl font-bold mt-1">{walletBalance} <span className="text-base sm:text-lg font-normal opacity-80">MKD</span></h3>
                    </div>
                    <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                        <Icon path={Icons.wallet} className="text-white" />
                    </div>
                </div>
            </Card>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <ServiceCard id="home-service-report" icon={Icons.report} title={t('report_new_issue')} color="bg-rose-500" onClick={() => onViewChange('report')} />
                <ServiceCard id="home-service-parking" icon={Icons.parking} title={t('parking')} color="bg-indigo-500" onClick={() => onViewChange('parking')} />
                <ServiceCard icon={Icons.calendarDays} title={t('events')} color="bg-orange-500" onClick={() => onViewChange('events')} />
                <ServiceCard id="home-service-news" icon={Icons.news} title={t('news')} color="bg-emerald-500" onClick={() => onViewChange('news')} />
                <ServiceCard icon={Icons.map} title={t('explore_kicevo')} color="bg-cyan-500" onClick={() => onViewChange('map')} />
                <ServiceCard icon={Icons.history} title={t('report_history')} color="bg-slate-500" onClick={() => onViewChange('history')} />
            </div>

            {/* News & Alerts Widget */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('news')}</h3>
                    <button
                        onClick={() => onViewChange('news')}
                        className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                        {t('view_all')}
                    </button>
                </div>

                {latestNews ? (
                    <Card className="p-0 overflow-hidden" onClick={() => onViewChange('news')}>
                        <div className="flex gap-3 p-4">
                            {latestNews.photo_urls && latestNews.photo_urls.length > 0 && (
                                <div className="flex-shrink-0">
                                    <img
                                        src={latestNews.photo_urls[0]}
                                        alt={getNewsTitle(latestNews)}
                                        className="w-20 h-20 object-cover rounded-xl"
                                    />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <span className="inline-block px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase rounded mb-1">
                                    {latestNews.type || 'NEWS'}
                                </span>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight mb-1 line-clamp-1">
                                    {getNewsTitle(latestNews)}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                    {getNewsDescription(latestNews)}
                                </p>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <Card className="p-6 text-center">
                        <p className="text-slate-400 text-sm">{t('loading')}</p>
                    </Card>
                )}
            </div>
        </div>
    );
};

// Service Card Component
const ServiceCard: React.FC<{ icon: string; title: string; color: string; onClick: () => void; id?: string }> = ({ icon, title, color, onClick, id }) => (
    <button id={id} onClick={onClick} className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border-none flex flex-col items-start gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all text-left group">
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20`}>
            <Icon path={icon} size={24} />
        </div>
        <span className="font-bold text-slate-900 dark:text-white text-sm leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{title}</span>
    </button>
);

