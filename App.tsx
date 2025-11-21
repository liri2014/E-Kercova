import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ReportCategory, GeolocationState, Transaction, ParkingZone, NewsItem, NewsStatus, NewsType, Report } from './types';
import { api } from './services/api';
import { useTranslation } from './i18n';

// Destructure for easier usage in component, or just use api.method
const { getParkingZones, payParking: payForParking, getEvents, getNews } = api;

// --- Icon System ---
const Icon: React.FC<{ path: string; className?: string; size?: number;[key: string]: any; }> = ({ path, className = '', size = 24, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d={path} />
    </svg>
);

const Icons = {
    location: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    camera: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    chevronLeft: "m15 18-6-6 6-6",
    chevronRight: "m9 18 6-6-6-6",
    checkCircle: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M9 11l3 3L22 4",
    alertCircle: "m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z M12 9v4 M12 17h.01",
    sun: "M12 1v2 M12 21v2 M4.22 4.22l1.42 1.42 M18.36 18.36l1.42 1.42 M1 12h2 M21 12h2 M4.22 19.78l1.42-1.42 M18.36 5.64l1.42-1.42 M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z",
    moon: "M12 3a6.36 6.36 0 0 0 9 9 9 9 0 1 1-9-9Z",
    building: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18 M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2 M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2 M10 6h4 M10 10h4 M10 14h4 M10 18h4",
    cog: "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M12 2v2 M12 22v-2 m-7.07-2.93 1.41 1.41 m11.31-11.31 1.41 1.41 M2 12h2 M22 12h-2 m-2.93 7.07 1.41-1.41 M6.34 6.34l1.41-1.41",
    phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
    parking: "M9 12h6 M2 9a3 3 0 0 1 0 6v1a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-1a3 3 0 0 1 0-6V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z",
    calendar: "M8 2v4 M16 2v4 M3 10h18 M3 6h18v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z",
    wallet: "M21 12V7H5a2 2 0 0 1 0-4h14v4 M3 5v14a2 2 0 0 0 2 2h16v-5 M18 12a2 2 0 0 0 0 4h4v-4Z",
    calendarDays: "M8 2v4 M16 2v4 M3 10h18 M3 6h18v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z M8 14h.01 M12 14h.01 M16 14h.01 M8 18h.01 M12 18h.01 M16 18h.01",
    news: "M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2V8h2 M14 12h4 M14 8h4 M14 16h4 M8 12h2 M8 8h2 M8 16h2",
    report: "M3 11v2a1 1 0 0 0 1 1h3l3 3V8l-3 3H4a1 1 0 0 0-1 1z m8 0.5a4.5 4.5 0 0 1 0-3 m3 1.5a8 8 0 0 1 0-4 m3 2a10 10 0 0 1 0-6",
    wrench: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6",
    home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
    menu: "M4 6h16M4 12h16M4 18h16",
    plus: "M12 5v14M5 12h14",
    clock: "M12 6v6l4 2",
    creditCard: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    map: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
};

// --- UI Components ---
const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
    <div onClick={onClick} className={`bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden ${className} ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}`}>
        {children}
    </div>
);

const Button: React.FC<{ children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; className?: string; disabled?: boolean; fullWidth?: boolean }> = ({ children, onClick, variant = 'primary', className = '', disabled = false, fullWidth = false }) => {
    const baseStyle = "relative h-12 px-6 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 active:translate-y-0.5",
        secondary: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700",
        ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
    };
    return (
        <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}>
            {children}
        </button>
    );
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
    <input className={`w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 ${className}`} {...props} />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className, children, ...props }) => (
    <div className="relative">
        <select className={`w-full h-12 px-4 pr-10 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none text-slate-900 dark:text-white ${className}`} {...props}>
            {children}
        </select>
        <Icon path={Icons.chevronRight} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" size={20} />
    </div>
);

// --- App Component ---
export const App: React.FC = () => {
    const { t, language, setLanguage } = useTranslation();
    const [activeView, setActiveView] = useState('dashboard');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [isVerified, setIsVerified] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [showVerificationInput, setShowVerificationInput] = useState(false);
    const [walletBalance, setWalletBalance] = useState(1250);

    // Initialize theme
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // Check verification
    useEffect(() => {
        const verified = localStorage.getItem('isVerified') === 'true';
        if (verified) setIsVerified(true);
    }, []);

    const handleVerify = () => {
        if (verificationCode === '123456') {
            localStorage.setItem('isVerified', 'true');
            setIsVerified(true);
        } else {
            alert(t('error_code_mismatch'));
        }
    };

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard': return <HomeView onViewChange={setActiveView} walletBalance={walletBalance} />;
            case 'report': return <ReportView onViewChange={setActiveView} />;
            case 'parking': return <ParkingView walletBalance={walletBalance} setWalletBalance={setWalletBalance} />;
            case 'events': return <EventsView />;
            case 'news': return <NewsView />;
            case 'wallet': return <WalletView balance={walletBalance} setBalance={setWalletBalance} />;
            case 'map': return <PlaceholderView title={t('map_view')} icon={Icons.map} />;
            case 'history': return <HistoryView />;
            case 'menu': return <MenuHub onViewChange={setActiveView} theme={theme} setTheme={setTheme} language={language} setLanguage={setLanguage} />;
            default: return <HomeView onViewChange={setActiveView} walletBalance={walletBalance} />;
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
                            <Button fullWidth onClick={() => {
                                if (phoneNumber.length < 8) {
                                    alert(t('error_phone_invalid'));
                                    return;
                                }
                                setShowVerificationInput(true);
                                alert(t('demo_code_notice') + ' 123456');
                            }}>
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
                className="absolute top-0 left-0 right-0 px-6 flex items-center justify-between z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50"
                style={{ paddingTop: 'max(16px, env(safe-area-inset-top))', height: 'calc(64px + env(safe-area-inset-top))' }}
            >
                <div className="flex items-center gap-2" onClick={() => setActiveView('dashboard')}>
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Icon path={Icons.building} className="text-white" size={18} />
                    </div>
                    <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">{t('app_title')}</span>
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
                className="absolute left-0 right-0 overflow-y-auto no-scrollbar p-4"
                style={{
                    top: 'calc(64px + env(safe-area-inset-top))',
                    bottom: 'calc(80px + env(safe-area-inset-bottom))'
                }}
            >
                <div className="animate-fade-in">
                    {renderContent()}
                </div>
            </main>

            {/* Bottom Navigation with Safe Area Support */}
            <div
                className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between z-30"
                style={{
                    paddingBottom: 'env(safe-area-inset-bottom)',
                    height: 'calc(80px + env(safe-area-inset-bottom))'
                }}
            >
                <NavButton icon={Icons.home} label="Home" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
                <NavButton icon={Icons.parking} label="Parking" active={activeView === 'parking'} onClick={() => setActiveView('parking')} />

                {/* FAB */}
                <div className="-mt-8">
                    <button
                        onClick={() => setActiveView('report')}
                        className="w-14 h-14 bg-indigo-600 rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center text-white active:scale-95 transition-transform"
                    >
                        <Icon path={Icons.plus} size={28} />
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
    const { t } = useTranslation();
    const hour = new Date().getHours();
    const greeting = hour < 12 ? t('good_morning') : hour < 18 ? t('good_afternoon') : t('good_evening');

    return (
        <div className="space-y-6">
            {/* Greeting */}
            <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{greeting}, Citizen</h2>
                <p className="text-slate-500">{t('how_can_we_help')}</p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
                <ServiceCard icon={Icons.report} title={t('report_new_issue')} color="bg-rose-500" onClick={() => onViewChange('report')} />
                <ServiceCard icon={Icons.parking} title={t('parking')} color="bg-indigo-500" onClick={() => onViewChange('parking')} />
                <ServiceCard icon={Icons.calendarDays} title={t('events')} color="bg-orange-500" onClick={() => onViewChange('events')} />
                <ServiceCard icon={Icons.news} title={t('news')} color="bg-emerald-500" onClick={() => onViewChange('news')} />
                <ServiceCard icon={Icons.map} title={t('map_view')} color="bg-cyan-500" onClick={() => onViewChange('map')} />
                <ServiceCard icon={Icons.history} title={t('report_history')} color="bg-slate-500" onClick={() => onViewChange('history')} />
            </div>

            {/* Mini Wallet Widget */}
            <Card className="p-5 bg-gradient-to-br from-indigo-600 to-purple-700 border-none text-white" onClick={() => onViewChange('wallet')}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-indigo-100 text-sm font-medium">{t('current_balance')}</p>
                        <h3 className="text-3xl font-bold mt-1">{walletBalance} <span className="text-lg font-normal opacity-80">MKD</span></h3>
                    </div>
                    <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                        <Icon path={Icons.wallet} className="text-white" />
                    </div>
                </div>
            </Card>
        </div>
    );
};

const ServiceCard: React.FC<{ icon: string; title: string; color: string; onClick: () => void }> = ({ icon, title, color, onClick }) => (
    <button onClick={onClick} className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-start gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all text-left group">
        <div className={`w-10 h-10 ${color} rounded-2xl flex items-center justify-center text-white shadow-md`}>
            <Icon path={icon} size={20} />
        </div>
        <span className="font-semibold text-slate-900 dark:text-white text-sm leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{title}</span>
    </button>
);

const ReportView: React.FC<{ onViewChange: (view: string) => void }> = ({ onViewChange }) => {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [location, setLocation] = useState<GeolocationState | null>(null);
    const [description, setDescription] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState<{ title: string; category: ReportCategory } | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                (err) => {
                    console.error("Location access denied", err);
                    // Optional: Set a default location or show error state
                },
                { timeout: 10000, enableHighAccuracy: true }
            );
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!photo || !location) return alert(t('error_required_fields'));

        setAnalyzing(true);
        try {
            const formData = new FormData();
            formData.append('photo', photo);
            formData.append('user_id', 'test-user-id'); // Replace with real auth ID later
            formData.append('lat', location.latitude.toString());
            formData.append('lng', location.longitude.toString());
            formData.append('description', description);

            const report = await api.submitReport(formData);

            // Save locally for history (optional, or just rely on fetching)
            const newReport: Report = {
                id: report.id,
                title: report.title,
                category: report.category as ReportCategory,
                location,
                photoPreviewUrl: photoPreview || '',
                timestamp: report.created_at
            };

            const existing = localStorage.getItem('submittedReports');
            const reports = existing ? JSON.parse(existing) : [];
            localStorage.setItem('submittedReports', JSON.stringify([newReport, ...reports]));

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
            <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative aspect-video rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all hover:border-indigo-400 ${photoPreview ? 'border-none' : 'bg-slate-50 dark:bg-slate-800'}`}
            >
                {photoPreview ? (
                    <>
                        <img src={photoPreview} alt={t('preview')} className="w-full h-full object-cover" />
                        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium flex items-center gap-2">
                            <Icon path={Icons.camera} size={16} /> {t('change_photo')}
                        </div>
                    </>
                ) : (
                    <div className="text-center p-6">
                        <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Icon path={Icons.camera} size={28} />
                        </div>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{t('add_photo_prompt')}</p>
                        <p className="text-xs text-slate-400 mt-1">{t('use_camera_gallery')}</p>
                    </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>

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

            {/* AI Analysis Result */}
            {(analyzing || aiResult) && (
                <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-2 ml-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('category')}</label>
                        {analyzing && <span className="text-xs text-indigo-600 font-medium animate-pulse">{t('analyzing')}</span>}
                    </div>
                    <Select
                        value={aiResult?.category || ''}
                        disabled={analyzing}
                        onChange={(e) => setAiResult(prev => prev ? { ...prev, category: e.target.value as ReportCategory } : null)}
                    >
                        <option value="">{analyzing ? t('analyzing') : t('submitted_category')}</option>
                        {Object.values(ReportCategory).map(c => (
                            <option key={c} value={c}>{t(c)}</option>
                        ))}
                    </Select>

                    {aiResult?.title && (
                        <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">AI Suggested Title</span>
                            <p className="font-semibold text-indigo-900 dark:text-indigo-100 mt-1">{aiResult.title}</p>
                        </div>
                    )}
                </div>
            )}

            <Button fullWidth onClick={handleSubmit} disabled={!photo || description.length < 5 || analyzing}>
                {analyzing ? <span className="animate-spin mr-2">⟳</span> : null}
                {t('submit_report')}
            </Button>
        </div>
    );
};

const ParkingView: React.FC<{ walletBalance: number, setWalletBalance: (b: number) => void }> = ({ walletBalance, setWalletBalance }) => {
    const { t } = useTranslation();
    const [zones, setZones] = useState<ParkingZone[]>([]);
    const [selectedZone, setSelectedZone] = useState<ParkingZone | null>(null);
    const [hours, setHours] = useState(1);
    const [plate, setPlate] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getParkingZones().then(data => {
            setZones(data);
            setSelectedZone(data[0]);
        });
    }, []);

    const handlePay = async () => {
        if (!selectedZone || !plate) return alert(t('error_enter_plate'));
        const totalCost = selectedZone.rate * hours;
        if (walletBalance < totalCost) return alert(t('error_insufficient_funds'));

        setLoading(true);
        try {
            await payForParking({
                user_id: 'test-user-id', // Replace with real auth ID
                zone_id: selectedZone.id,
                duration: hours,
                plate_number: plate,
                amount: totalCost
            });

            setWalletBalance(walletBalance - totalCost);
            alert(t('payment_successful'));
            setPlate('');
            // refresh zones
            const updated = await getParkingZones();
            setZones(updated);
        } catch (e) {
            alert('Payment failed: ' + e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('pay_parking')}</h2>

            {/* Zone Selection */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">{t('select_zone')}</label>
                <Select
                    value={selectedZone?.id || ''}
                    onChange={(e) => setSelectedZone(zones.find(z => z.id === e.target.value) || null)}
                >
                    {zones.map(z => (
                        <option key={z.id} value={z.id}>{z.name} ({z.rate} MKD/hr)</option>
                    ))}
                </Select>
            </div>

            {/* Duration & Plate */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">{t('duration_hours')}</label>
                    <input
                        type="number"
                        min="1"
                        max="24"
                        value={hours}
                        onChange={(e) => setHours(parseInt(e.target.value) || 1)}
                        className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none text-slate-900 dark:text-white"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">{t('license_plate')}</label>
                    <input
                        type="text"
                        placeholder="SK-1234-AB"
                        value={plate}
                        onChange={(e) => setPlate(e.target.value.toUpperCase())}
                        className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none text-slate-900 dark:text-white uppercase"
                    />
                </div>
            </div>

            {/* Cost Summary */}
            {selectedZone && (
                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{t('total_cost')}</p>
                        <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">{selectedZone.rate * hours} <span className="text-lg font-normal">MKD</span></p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-500 dark:text-slate-400">{selectedZone.name}</p>
                        <p className="text-xs text-slate-400">{hours} {hours === 1 ? 'hour' : 'hours'}</p>
                    </div>
                </div>
            )}

            <Button fullWidth onClick={handlePay} disabled={loading || !selectedZone || !plate}>
                {loading ? <span className="animate-spin mr-2">⟳</span> : <Icon path={Icons.creditCard} className="mr-2" size={20} />}
                {t('pay_now')}
            </Button>
        </div>
    );
};

const EventsView: React.FC = () => {
    const { t } = useTranslation();
    const [events, setEvents] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    useEffect(() => {
        getEvents().then(setEvents);
    }, []);

    // Simple calendar generation logic
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(selectedDate);
    const dayList = Array.from({ length: days }, (_, i) => i + 1);
    const padding = Array.from({ length: firstDay }, (_, i) => null);

    const getEventForDay = (day: number) => {
        if (!events) return null;
        const key = `${selectedDate.getMonth() + 1}-${day}`;
        if (events.holidays[key]) return { type: 'holiday', title: t(events.holidays[key]) };
        if (events.municipalEvents[key]) return { type: 'event', title: t(events.municipalEvents[key]) };
        return null;
    };

    const selectedEvent = getEventForDay(selectedDate.getDate());

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('events')}</h2>

            <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}>
                        <Icon path={Icons.chevronLeft} />
                    </button>
                    <span className="font-bold text-lg">{t(`month_${selectedDate.getMonth()}`)} {selectedDate.getFullYear()}</span>
                    <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}>
                        <Icon path={Icons.chevronRight} />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center mb-2">
                    {[0, 1, 2, 3, 4, 5, 6].map(d => <span key={d} className="text-xs text-slate-400 font-medium">{t(`day_${d}`)}</span>)}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {padding.map((_, i) => <div key={`pad-${i}`} />)}
                    {dayList.map(day => {
                        const evt = getEventForDay(day);
                        const isSelected = selectedDate.getDate() === day;
                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))}
                                className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                            >
                                <span className="text-sm font-medium">{day}</span>
                                {evt && (
                                    <div className={`w-1.5 h-1.5 rounded-full mt-1 ${evt.type === 'holiday' ? 'bg-rose-500' : 'bg-indigo-400'} ${isSelected ? 'bg-white' : ''}`} />
                                )}
                            </button>
                        )
                    })}
                </div>
            </Card>

            {/* Selected Day Detail */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 min-h-[120px] flex items-center justify-center text-center">
                {selectedEvent ? (
                    <div>
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${selectedEvent.type === 'holiday' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30'}`}>
                            {selectedEvent.type === 'holiday' ? t('national_holiday') : t('municipality_event')}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedEvent.title}</h3>
                    </div>
                ) : (
                    <p className="text-slate-400">{t('no_events_today')}</p>
                )}
            </div>
        </div>
    );
};

const NewsView: React.FC = () => {
    const { t } = useTranslation();
    const [news, setNews] = useState<NewsItem[]>([]);

    useEffect(() => {
        getNews().then(setNews);
    }, []);

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('news')}</h2>
            {news.map(item => (
                <Card key={item.id} className="p-5 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${item.type === NewsType.CONSTRUCTION ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                            {item.type}
                        </span>
                        <span className="text-xs text-slate-400">{new Date(item.startDate).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t(item.title)}</h3>
                    <p className="text-sm text-slate-500">{t(item.description)}</p>
                </Card>
            ))}
        </div>
    );
};

const WalletView: React.FC<{ balance: number, setBalance: (b: number) => void }> = ({ balance, setBalance }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-6">
            <div className="relative h-48 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white shadow-xl shadow-indigo-600/20 overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Icon path={Icons.wallet} size={120} />
                </div>
                <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                        <p className="text-indigo-200 font-medium mb-1">{t('current_balance')}</p>
                        <h1 className="text-4xl font-bold">{balance} <span className="text-2xl font-normal opacity-80">MKD</span></h1>
                    </div>
                    <div className="flex justify-between items-end">
                        <div className="text-indigo-200 text-xs">
                            <p>{t('valid_thru')}</p>
                            <p className="font-mono text-white text-base">12/28</p>
                        </div>
                        <Icon path={Icons.building} className="text-white/50" size={32} />
                    </div>
                </div>
            </div>

            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t('add_funds')}</h3>
            <div className="grid grid-cols-3 gap-3">
                {[200, 500, 1000].map(amt => (
                    <Button key={amt} variant="secondary" onClick={() => setBalance(balance + amt)} className="h-16 flex-col gap-0">
                        <span className="font-bold text-lg">+{amt}</span>
                        <span className="text-[10px] uppercase">MKD</span>
                    </Button>
                ))}
            </div>
        </div>
    );
};

const PlaceholderView: React.FC<{ title: string, icon: string }> = ({ title, icon }) => {
    const { t } = useTranslation();
    return (
        <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <Icon path={icon} size={64} className="mb-4 text-slate-300" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
            <p>{t('content_coming_soon')}</p>
        </div>
    );
};

const HistoryView: React.FC = () => {
    const { t } = useTranslation();
    const [reports, setReports] = useState<Report[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('submittedReports');
        if (stored) setReports(JSON.parse(stored));
    }, []);

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('report_history')}</h2>
            {reports.length === 0 ? (
                <p className="text-slate-500 text-center py-10">{t('no_reports_yet')}</p>
            ) : (
                reports.map(r => (
                    <Card key={r.id} className="flex gap-4 p-4">
                        <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                            {r.photoPreviewUrl && <img src={r.photoPreviewUrl} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">{r.title}</h4>
                            <p className="text-xs text-slate-500 mb-1">{new Date(r.timestamp).toLocaleDateString()}</p>
                            <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 text-xs rounded-md font-medium">{t(r.category)}</span>
                        </div>
                    </Card>
                ))
            )}
        </div>
    );
};

const MenuHub: React.FC<{ onViewChange: (v: string) => void, theme: 'light' | 'dark', setTheme: (t: 'light' | 'dark') => void, language: string, setLanguage: (l: any) => void }> = ({ onViewChange, theme, setTheme, language, setLanguage }) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('settings')}</h2>

            <Card className="divide-y divide-slate-100 dark:divide-slate-800 p-0 overflow-hidden">
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Icon path={theme === 'light' ? Icons.sun : Icons.moon} size={16} />
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{t('appearance')}</span>
                    </div>
                    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium">
                        {theme === 'light' ? 'Light' : 'Dark'}
                    </button>
                </div>

                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <span className="text-xs font-bold">AZ</span>
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{t('language')}</span>
                    </div>
                    <div className="flex gap-1">
                        {['en', 'mk', 'sq'].map(l => (
                            <button
                                key={l}
                                onClick={() => setLanguage(l)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold uppercase ${language === l ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            <div className="text-center pt-10">
                <p className="text-xs text-slate-400">E-Kicevo App v2.1.0</p>
            </div>
        </div>
    );
};