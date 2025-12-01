import React, { useState, useEffect, useCallback } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { useTranslation } from './i18n';
import { useAuth, useTheme } from './contexts';
import { TutorialOverlay } from './components/tutorial';
import { VerificationScreen } from './components/VerificationScreen';
import { LanguageSelectionScreen } from './components/LanguageSelectionScreen';
import { Icon, Icons } from './components/ui';
import { supabase } from './supabase';
import { 
    initializePushNotifications, 
    setupPushNotificationListeners 
} from './services/pushNotifications';
// Direct imports for instant loading
import { HomeView } from './components/views/HomeView';
import { MapView } from './components/views/MapView';
import { ReportView } from './components/views/ReportView';
import { ParkingView } from './components/views/ParkingView';
import { EventsView } from './components/views/EventsView';
import { NewsView } from './components/views/NewsView';
import { WalletView } from './components/views/WalletView';
import { HistoryView } from './components/views/HistoryView';
import { MenuHub } from './components/views/MenuHub';
import { CommunityView } from './components/views/CommunityView';
import { ServicesView } from './components/views/ServicesView';
import { OfflineIndicator } from './components/OfflineIndicator';

// --- App Component ---
export const App: React.FC = () => {
    const { t, language, setLanguage, hasSelectedLanguage } = useTranslation();
    const { isVerified } = useAuth();
    const { theme, setTheme } = useTheme();
    
    const [activeView, setActiveView] = useState(() => localStorage.getItem('lastActiveView') || 'dashboard');
    const [walletBalance, setWalletBalance] = useState(0);
    const [balanceLoaded, setBalanceLoaded] = useState(false);

    // Load wallet balance from Supabase
    useEffect(() => {
        const loadWalletBalance = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('wallet_balance')
                        .eq('id', user.id)
                        .single();
                    
                    if (profile?.wallet_balance !== undefined) {
                        setWalletBalance(profile.wallet_balance);
                    } else {
                        // Default balance for new users
                        setWalletBalance(1000);
                    }
                }
            } catch (err) {
                console.error('Error loading wallet balance:', err);
                // Fallback to localStorage if Supabase fails
                const stored = localStorage.getItem('walletBalance');
                setWalletBalance(stored ? parseInt(stored) : 1000);
            }
            setBalanceLoaded(true);
        };

        if (isVerified) {
            loadWalletBalance();
        }
    }, [isVerified]);

    // Initialize push notifications when user is verified
    useEffect(() => {
        if (isVerified) {
            // Initialize push notifications (request permission & save token)
            initializePushNotifications();
            
            // Setup notification listeners
            const cleanup = setupPushNotificationListeners(
                (notification) => {
                    // Handle notification received while app is in foreground
                    console.log('Notification received:', notification.title);
                },
                (action) => {
                    // Handle notification tap - navigate based on data
                    const data = action.notification.data;
                    if (data?.view) {
                        setActiveView(data.view);
                    }
                }
            );
            
            return cleanup;
        }
    }, [isVerified]);

    // Save wallet balance to Supabase and localStorage
    const updateWalletBalance = useCallback(async (newBalance: number) => {
        setWalletBalance(newBalance);
        localStorage.setItem('walletBalance', newBalance.toString());
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from('profiles')
                    .update({ wallet_balance: newBalance, updated_at: new Date().toISOString() })
                    .eq('id', user.id);
            }
        } catch (err) {
            console.error('Error saving wallet balance:', err);
        }
    }, []);

    // Lifted photos state for camera restoration
    const [photos, setPhotos] = useState<string[]>(() => {
        const stored = localStorage.getItem('reportPhotos');
        return stored ? JSON.parse(stored) : [];
    });

    // Tutorial state
    const [showTutorial, setShowTutorial] = useState(() => {
        const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
        return !hasSeenTutorial;
    });

    // Persist photos to localStorage
    useEffect(() => {
        localStorage.setItem('reportPhotos', JSON.stringify(photos));
    }, [photos]);

    // Persist active view
    useEffect(() => {
        localStorage.setItem('lastActiveView', activeView);
    }, [activeView]);

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
                        fetch(imagePath)
                            .then(res => res.blob())
                            .then(blob => {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    if (typeof reader.result === 'string') {
                                        setPhotos(prev => [...prev, reader.result as string]);
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

    // Render content based on active view
    const renderContent = () => {
        switch (activeView) {
            case 'dashboard': return <HomeView onViewChange={setActiveView} walletBalance={walletBalance} />;
            case 'report': return <ReportView onViewChange={setActiveView} photos={photos} setPhotos={setPhotos} />;
            case 'parking': return <ParkingView walletBalance={walletBalance} setWalletBalance={updateWalletBalance} />;
            case 'events': return <EventsView />;
            case 'news': return <NewsView />;
            case 'wallet': return <WalletView balance={walletBalance} setBalance={updateWalletBalance} />;
            case 'map': return <MapView />;
            case 'history': return <HistoryView />;
            case 'community': return <CommunityView />;
            case 'services': return <ServicesView />;
            case 'menu': return <MenuHub onViewChange={setActiveView} theme={theme} setTheme={setTheme} language={language} setLanguage={setLanguage} />;
            default: return <HomeView onViewChange={setActiveView} walletBalance={walletBalance} />;
        }
    };

    // Show language selection if not selected yet
    if (!hasSelectedLanguage) {
        return <LanguageSelectionScreen onSelectLanguage={setLanguage} />;
    }

    // Show verification screen if not verified
    if (!isVerified) {
        return <VerificationScreen />;
    }

    return (
        <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 max-w-md mx-auto shadow-2xl overflow-hidden">
            {/* Offline Indicator */}
            <OfflineIndicator />

            {/* Tutorial Overlay */}
            {showTutorial && (
                <TutorialOverlay
                    onComplete={() => {
                        localStorage.setItem('hasSeenTutorial', 'true');
                        setShowTutorial(false);
                    }}
                />
            )}

            {/* Header with Safe Area Support */}
            <Header 
                onLogoClick={() => setActiveView('dashboard')} 
                onWalletClick={() => setActiveView('wallet')} 
                walletBalance={walletBalance} 
            />

            {/* Scrollable Content */}
            <main
                className="absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-contain no-scrollbar px-3 sm:px-4 md:px-6"
                style={{
                    top: 'calc(64px + env(safe-area-inset-top))',
                    bottom: 'calc(80px + env(safe-area-inset-bottom))',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                <div className="py-4">
                    {renderContent()}
                </div>
            </main>

            {/* Bottom Navigation */}
            <BottomNavigation activeView={activeView} onViewChange={setActiveView} />
        </div>
    );
};

// --- Header Component ---
const Header: React.FC<{ onLogoClick: () => void; onWalletClick: () => void; walletBalance: number }> = ({ 
    onLogoClick, 
    onWalletClick, 
    walletBalance 
}) => {
    const { t } = useTranslation();
    
    return (
        <div
            className="fixed top-0 left-0 right-0 px-4 sm:px-6 flex items-center justify-between z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 max-w-md mx-auto"
            style={{ paddingTop: 'max(16px, env(safe-area-inset-top))', height: 'calc(64px + env(safe-area-inset-top))' }}
        >
            <div className="flex items-center gap-2 cursor-pointer" onClick={onLogoClick}>
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <Icon path={Icons.building} className="text-white" size={18} />
                </div>
                <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                    {t('app_title')}
                </span>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={onWalletClick} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <Icon path={Icons.wallet} size={14} className="text-indigo-600" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{walletBalance}</span>
                </button>
            </div>
        </div>
    );
};

// --- Bottom Navigation Component ---
const BottomNavigation: React.FC<{ activeView: string; onViewChange: (view: string) => void }> = ({ 
    activeView, 
    onViewChange 
}) => (
    <div
        className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between z-30 max-w-md mx-auto"
        style={{
            paddingBottom: 'env(safe-area-inset-bottom)',
            height: 'calc(80px + env(safe-area-inset-bottom))'
        }}
    >
        <NavButton icon={Icons.home} active={activeView === 'dashboard'} onClick={() => onViewChange('dashboard')} />
        <NavButton icon={Icons.parking} active={activeView === 'parking'} onClick={() => onViewChange('parking')} />

        {/* FAB - Report Button */}
        <div>
            <button
                onClick={() => onViewChange('report')}
                className="w-12 h-12 bg-indigo-600 rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center text-white active:scale-95 transition-transform"
            >
                <Icon path={Icons.plus} size={24} />
            </button>
        </div>

        <NavButton icon={Icons.wallet} active={activeView === 'wallet'} onClick={() => onViewChange('wallet')} />
        <NavButton icon={Icons.menu} active={activeView === 'menu'} onClick={() => onViewChange('menu')} />
    </div>
);

// --- Navigation Button Component ---
const NavButton: React.FC<{ icon: string; active: boolean; onClick: () => void }> = ({ icon, active, onClick }) => (
    <button 
        onClick={onClick} 
        className={`flex flex-col items-center gap-1 ${active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
    >
        <Icon path={icon} size={24} strokeWidth={active ? 2.5 : 1.5} />
    </button>
);
