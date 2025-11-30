import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../supabase';

// Check if push notifications are available (native platform only)
export const isPushNotificationsAvailable = (): boolean => {
    return Capacitor.isNativePlatform();
};

// Request permission and register for push notifications
export const registerPushNotifications = async (): Promise<string | null> => {
    if (!isPushNotificationsAvailable()) {
        console.log('Push notifications not available on web');
        return null;
    }

    try {
        // Request permission
        const permission = await PushNotifications.requestPermissions();
        
        if (permission.receive === 'granted') {
            // Register with APNS/FCM
            await PushNotifications.register();
            
            // Return token via promise
            return new Promise((resolve) => {
                PushNotifications.addListener('registration', async (token: Token) => {
                    console.log('Push registration success, token:', token.value);
                    resolve(token.value);
                });

                PushNotifications.addListener('registrationError', (error: any) => {
                    console.error('Push registration error:', error);
                    resolve(null);
                });
            });
        } else {
            console.log('Push notification permission denied');
            return null;
        }
    } catch (error) {
        console.error('Error registering push notifications:', error);
        return null;
    }
};

// Save FCM token to user's profile in Supabase
export const saveFCMToken = async (token: string): Promise<boolean> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            const { error } = await supabase
                .from('profiles')
                .update({ 
                    fcm_token: token,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) {
                console.error('Error saving FCM token:', error);
                return false;
            }
            
            console.log('FCM token saved successfully');
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error saving FCM token:', error);
        return false;
    }
};

// Setup push notification listeners
export const setupPushNotificationListeners = (
    onNotificationReceived?: (notification: PushNotificationSchema) => void,
    onNotificationTapped?: (action: ActionPerformed) => void
): (() => void) => {
    if (!isPushNotificationsAvailable()) {
        return () => {};
    }

    const listeners: Promise<any>[] = [];

    // Handle received notifications (when app is in foreground)
    listeners.push(
        PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
            console.log('Push notification received:', notification);
            if (onNotificationReceived) {
                onNotificationReceived(notification);
            }
        })
    );

    // Handle notification tap (when user taps on notification)
    listeners.push(
        PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
            console.log('Push notification action performed:', action);
            if (onNotificationTapped) {
                onNotificationTapped(action);
            }
        })
    );

    // Return cleanup function
    return () => {
        PushNotifications.removeAllListeners();
    };
};

// Initialize push notifications - call this after user is authenticated
export const initializePushNotifications = async (): Promise<void> => {
    if (!isPushNotificationsAvailable()) {
        return;
    }

    try {
        // Check current permission status
        const permissionStatus = await PushNotifications.checkPermissions();
        
        if (permissionStatus.receive === 'granted') {
            // Already have permission, just register to get token
            await PushNotifications.register();
            
            PushNotifications.addListener('registration', async (token: Token) => {
                await saveFCMToken(token.value);
            });
        } else if (permissionStatus.receive === 'prompt') {
            // Need to request permission
            const token = await registerPushNotifications();
            if (token) {
                await saveFCMToken(token);
            }
        }
        // If 'denied', don't do anything - user has explicitly denied
    } catch (error) {
        console.error('Error initializing push notifications:', error);
    }
};

// Check if push notifications are enabled
export const checkPushNotificationStatus = async (): Promise<'granted' | 'denied' | 'prompt'> => {
    if (!isPushNotificationsAvailable()) {
        return 'denied';
    }

    try {
        const status = await PushNotifications.checkPermissions();
        return status.receive;
    } catch (error) {
        console.error('Error checking push notification status:', error);
        return 'denied';
    }
};

