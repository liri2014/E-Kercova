import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ReportCategory, GeolocationState, Transaction, ParkingZone, NewsItem, NewsStatus, NewsType, Report, Landmark } from './types';
import { api } from './services/api';
import { useTranslation } from './i18n';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { App as CapacitorApp } from '@capacitor/app';
import { supabase } from './supabase';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { TutorialOverlay } from './components/tutorial';
import { Icon, Icons, Card, Button, Input, Select } from './components/ui';
import { MapView, ReportView, ParkingView, EventsView, NewsView, WalletView, PlaceholderView, HistoryView, MenuHub } from './components/views';

// Destructure for easier usage in component, or just use api.method
const { getParkingZones, payParking: payForParking, getEvents, getNews, getLandmarks } = api;


// --- App Component ---
export const App: React.FC = () => {
    const { t, language, setLanguage } = useTranslation();
    const [activeView, setActiveView] = useState(() => localStorage.getItem('lastActiveView') || 'dashboard');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Lifted photos state for camera restoration
    const [photos, setPhotos] = useState<string[]>(() => {
        const stored = localStorage.getItem('reportPhotos');
        return stored ? JSON.parse(stored) : [];
    });

    useEffect(() => {
        localStorage.setItem('reportPhotos', JSON.stringify(photos));
    }, [photos]);

    useEffect(() => {
        localStorage.setItem('lastActiveView', activeView);
    }, [activeView]);
    const [isVerified, setIsVerified] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [showVerificationInput, setShowVerificationInput] = useState(false);
    const [walletBalance, setWalletBalance] = useState(1250);

    // Initialize theme with system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        if (savedTheme) {
            setTheme(savedTheme);
        } else {
            // Detect system theme
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
        }
    }, []);

    // Apply theme changes
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Check verification
    useEffect(() => {
        const verified = localStorage.getItem('isVerified') === 'true';
        if (verified) setIsVerified(true);
    }, []);

    // Handle Android back button and App Restoration (Camera)
    useEffect(() => {
        let backButtonListener: any;
        let restoreListener: any;

        const setupListeners = async () => {
            backButtonListener = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
                if (activeView !== 'dashboard') {
                    setActiveView('dashboard');
                } else if (canGoBack) {
                    window.history.back();
                } else {
                    CapacitorApp.exitApp();
                }
            });

            // Handle camera result when app is restored after being killed
            restoreListener = await CapacitorApp.addListener('appRestoredResult', (data: any) => {
                if (data.pluginId === 'Camera' && data.methodName === 'getPhoto' && data.success) {
                    const imagePath = data.data.webPath;
                    if (imagePath) {
                        // Fetch and save the restored photo
                        fetch(imagePath)
                            .then(res => res.blob())
                            .then(blob => {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    if (typeof reader.result === 'string') {
                                        // Update state directly
                                        setPhotos(prev => [...prev, reader.result as string]);
                                        // Navigate to report view to show the photo
                                        setActiveView('report');
                                    }
                                };
                                reader.readAsDataURL(blob);
                            })
                            .catch(err => console.error('Error recovering photo:', err));
                    }
                }
            });
        };

        setupListeners();

        return () => {
            if (backButtonListener) backButtonListener.remove();
            if (restoreListener) restoreListener.remove();
        };
    }, [activeView]);

    const handleVerify = async () => {
        try {
            // Format phone number the same way as when sending the code
            const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+389${phoneNumber}`;

            const { data, error } = await supabase.auth.verifyOtp({
                phone: formattedPhone,
                token: verificationCode,
                type: 'sms'
            });

            if (error) {
                alert(t('error_code_mismatch'));
                console.error('Verification error:', error);
            } else {
                localStorage.setItem('isVerified', 'true');
                setIsVerified(true);
            }
        } catch (err) {
            alert(t('error_code_mismatch'));
            console.error('Verification error:', err);
        }
    };

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard': return <HomeView onViewChange={setActiveView} walletBalance={walletBalance} />;
            case 'report': return <ReportView onViewChange={setActiveView} photos={photos} setPhotos={setPhotos} />;
            case 'parking': return <ParkingView walletBalance={walletBalance} setWalletBalance={setWalletBalance} />;
            case 'events': return <EventsView />;
            case 'news': return <NewsView />;
            case 'wallet': return <WalletView balance={walletBalance} setBalance={setWalletBalance} />;
            case 'map': return <MapView />;
            case 'history': return <HistoryView />;
            case 'menu': return <MenuHub onViewChange={setActiveView} theme={theme} setTheme={setTheme} language={language} setLanguage={setLanguage} />;
            default: return <HomeView onViewChange={setActiveView} walletBalance={walletBalance} />;
        }
    };

    const handleSendCode = async () => {
        if (phoneNumber.length < 8) {
            alert(t('error_phone_invalid'));
            return;
        }

        try {
            // Format phone number with country code (assuming Macedonia +389)
            const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+389${phoneNumber}`;

            const { data, error } = await supabase.auth.signInWithOtp({
                phone: formattedPhone
            });

            if (error) {
                alert(`Error: ${error.message}`);
                console.error('Send OTP error:', error);
            } else {
                setShowVerificationInput(true);
                alert(t('code_sent'));
            }
        } catch (err) {
            alert(`Error sending code: ${err}`);
            console.error('Send OTP error:', err);
        }
    };

    if (!isVerified) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
                <Card className="w-full max-w-sm p-8 text-center">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icon path={Icons.phone} className="text-indigo-600" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('verify_account')}</h1>
                    <p className="text-slate-500 mb-8">{t('verification_description')}</p>

                    {!showVerificationInput ? (
                        <div className="space-y-4">
                            <Input
                                type="tel"
                                placeholder={t('phone_placeholder')}
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                            <Button fullWidth onClick={handleSendCode}>
                                {t('send_code')}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500">{t('enter_code_prompt')} <span className="font-semibold text-slate-900 dark:text-white">{phoneNumber}</span></p>
                            <Input
                                type="text"
                                placeholder="123456"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                className="text-center tracking-widest text-xl font-mono"
                            />
                            <Button fullWidth onClick={handleVerify}>{t('verify')}</Button>
                            <Button variant="ghost" fullWidth onClick={() => setShowVerificationInput(false)}>{t('change_number')}</Button>
                        </div>
                    )}
                </Card>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 max-w-md mx-auto shadow-2xl overflow-hidden">
            {/* Header with Safe Area Support */}
            <div
                className="fixed top-0 left-0 right-0 px-4 sm:px-6 flex items-center justify-between z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 max-w-md mx-auto"
                style={{ paddingTop: 'max(16px, env(safe-area-inset-top))', height: 'calc(64px + env(safe-area-inset-top))' }}
            >
                <div className="flex items-center gap-2" onClick={() => setActiveView('dashboard')}>
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Icon path={Icons.building} className="text-white" size={18} />
                    </div>
                    <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">{t('app_title')}</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setActiveView('wallet')} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <Icon path={Icons.wallet} size={14} className="text-indigo-600" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{walletBalance}</span>
                    </button>
                </div>
            </div>

            {/* Scrollable Content with Padding for Header and Nav */}
            <main
                className="absolute left-0 right-0 overflow-y-auto no-scrollbar px-3 sm:px-4 md:px-6 py-4"
                style={{
                    top: '0',
                    paddingTop: 'calc(80px + env(safe-area-inset-top))', // Added padding for header
                    bottom: 'calc(80px + env(safe-area-inset-bottom))'
                }}
            >
                <div className="animate-fade-in">
                    {renderContent()}
                </div>
            </main>

            {/* Bottom Navigation with Safe Area Support */}
            <div
                className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between z-30 max-w-md mx-auto"
                style={{
                    paddingBottom: 'env(safe-area-inset-bottom)',
                    height: 'calc(80px + env(safe-area-inset-bottom))'
                }}
            >
                <NavButton icon={Icons.home} label="Home" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
                <NavButton icon={Icons.parking} label="Parking" active={activeView === 'parking'} onClick={() => setActiveView('parking')} />

                {/* FAB */}
                <div>
                    <button
                        onClick={() => setActiveView('report')}
                        className="w-12 h-12 bg-indigo-600 rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center text-white active:scale-95 transition-transform"
                    >
                        <Icon path={Icons.plus} size={24} />
                    </button>
                </div>

                <NavButton icon={Icons.wallet} label="Wallet" active={activeView === 'wallet'} onClick={() => setActiveView('wallet')} />
                <NavButton icon={Icons.menu} label="Menu" active={activeView === 'menu'} onClick={() => setActiveView('menu')} />
            </div>
        </div>
    );
};

const NavButton: React.FC<{ icon: string; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 ${active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
        <Icon path={icon} size={24} strokeWidth={active ? 2.5 : 1.5} />
        {/* <span className="text-[10px] font-medium">{label}</span> */}
    </button>
);

// --- Sub-Views ---


const HomeView: React.FC<{ onViewChange: (view: string) => void, walletBalance: number }> = ({ onViewChange, walletBalance }) => {
    const { t, language } = useTranslation();
    const hour = new Date().getHours();
    const greeting = hour < 12 ? t('good_morning') : hour < 18 ? t('good_afternoon') : t('good_evening');
    const [latestNews, setLatestNews] = useState<NewsItem | null>(null);

    useEffect(() => {
        // Fetch latest news
        getNews().then(data => {
            if (data && data.length > 0) {
                setLatestNews(data[0]); // Get the first (latest) news item
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
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{greeting}, Citizen</h2>
                <p className="text-sm sm:text-base text-slate-500">{t('how_can_we_help')}</p>
            </div>

            {/* Mini Wallet Widget - Moved to Top */}
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
                <ServiceCard icon={Icons.map} title="Explore Kicevo" color="bg-cyan-500" onClick={() => onViewChange('map')} />
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
                        View All
                    </button>
                </div>

                {latestNews ? (
                    <Card className="p-0 overflow-hidden" onClick={() => onViewChange('news')}>
                        <div className="flex gap-3 p-4">
                            {/* Thumbnail */}
                            {latestNews.photo_urls && latestNews.photo_urls.length > 0 && (
                                <div className="flex-shrink-0">
                                    <img
                                        src={latestNews.photo_urls[0]}
                                        alt={getNewsTitle(latestNews)}
                                        className="w-20 h-20 object-cover rounded-xl"
                                    />
                                </div>
                            )}

                            {/* Content */}
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
                        <p className="text-slate-400 text-sm">{t('no_news_available')}</p>
                    </Card>
                )}
            </div>
        </div>
    );
};

const ServiceCard: React.FC<{ icon: string; title: string; color: string; onClick: () => void; id?: string }> = ({ icon, title, color, onClick, id }) => (
    <button id={id} onClick={onClick} className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border-none flex flex-col items-start gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all text-left group">
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20`}>
            <Icon path={icon} size={24} />
        </div>
        <span className="font-bold text-slate-900 dark:text-white text-sm leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{title}</span>
    </button>
);








