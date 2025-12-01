import * as Sentry from '@sentry/react';

// Initialize Sentry for error tracking
export const initSentry = () => {
    const dsn = import.meta.env.VITE_SENTRY_DSN;
    
    if (!dsn) {
        console.log('Sentry DSN not configured - error tracking disabled');
        return;
    }

    Sentry.init({
        dsn,
        environment: import.meta.env.MODE || 'development',
        
        // Performance monitoring sample rate
        tracesSampleRate: 0.1,
        
        // Session replay sample rate
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        
        // Only report errors in production
        enabled: import.meta.env.PROD,
        
        // Filter out known non-critical errors
        beforeSend(event, hint) {
            const error = hint.originalException;
            
            // Ignore network errors (common when offline)
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                return null;
            }
            
            // Ignore cancelled requests
            if (error instanceof DOMException && error.name === 'AbortError') {
                return null;
            }
            
            return event;
        },
        
        // Additional integrations
        integrations: [
            new Sentry.BrowserTracing({
                // Set custom trace propagation targets
                tracePropagationTargets: [
                    'localhost',
                    /^https:\/\/e-kicevo-backend\.onrender\.com/,
                ],
            }),
        ],
    });

    console.log('Sentry error tracking initialized');
};

// Capture error with additional context
export const captureError = (error: Error, context?: Record<string, any>) => {
    if (context) {
        Sentry.setContext('additional', context);
    }
    Sentry.captureException(error);
};

// Capture message (for non-error events)
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
    Sentry.captureMessage(message, level);
};

// Set user context for error tracking
export const setUserContext = (userId: string, phone?: string) => {
    Sentry.setUser({
        id: userId,
        phone,
    });
};

// Clear user context (on logout)
export const clearUserContext = () => {
    Sentry.setUser(null);
};

// Add breadcrumb for better error tracking
export const addBreadcrumb = (
    message: string,
    category: string,
    data?: Record<string, any>,
    level: Sentry.SeverityLevel = 'info'
) => {
    Sentry.addBreadcrumb({
        message,
        category,
        data,
        level,
    });
};

// Error boundary wrapper component
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Wrap component with Sentry profiling
export const withSentryProfiling = Sentry.withProfiler;

export default Sentry;

