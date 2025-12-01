require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Initialize Sentry for error tracking (if configured)
let Sentry = null;
if (process.env.SENTRY_DSN) {
    Sentry = require('@sentry/node');
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: 0.1,
        integrations: [
            new Sentry.Integrations.Http({ tracing: true }),
            new Sentry.Integrations.Express({ app: express() }),
        ],
    });
    console.log('Sentry error tracking initialized');
}

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
const {
    apiLimiter,
    authLimiter,
    reportLimiter,
    searchLimiter,
    validateInput,
    securityLogger
} = require('./middleware/security');

// Sentry request handler (must be first)
if (Sentry) {
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
}

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false // Disable for API
}));

// CORS configuration
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-API-Key']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(validateInput);
app.use(securityLogger);

// Apply general rate limiting to all routes
app.use('/api/', apiLimiter);

// Supabase Client
const supabase = require('./supabaseClient');

// Routes
const analyzeRoutes = require('./routes/analyze');
const reportRoutes = require('./routes/reports');
const parkingRoutes = require('./routes/parking');
const authRoutes = require('./routes/auth');
const translateRoutes = require('./routes/translate');
const holidaysRoutes = require('./routes/holidays');
const newsRoutes = require('./routes/news');
const eventsRoutes = require('./routes/events');
const landmarksRoutes = require('./routes/landmarks');
const notificationsRoutes = require('./routes/notifications');
const searchRoutes = require('./routes/search');

// Export the supabase client for other files to use
module.exports.supabase = supabase;

// Apply specific rate limiters to sensitive routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/reports', reportLimiter, reportRoutes);
app.use('/api/search', searchLimiter, searchRoutes);

// Standard routes
app.use('/api/analyze', analyzeRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/holidays', holidaysRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/landmarks', landmarksRoutes);
app.use('/api/notifications', notificationsRoutes);

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        version: '2.1.0'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'E-Kicevo Backend',
        version: '2.1.0',
        status: 'running',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            reports: '/api/reports',
            parking: '/api/parking',
            news: '/api/news',
            events: '/api/events',
            search: '/api/search',
            notifications: '/api/notifications'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
    });
});

// Sentry error handler (must be before other error handlers)
if (Sentry) {
    app.use(Sentry.Handlers.errorHandler());
}

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Report to Sentry
    if (Sentry) {
        Sentry.captureException(err);
    }

    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 E-Kicevo Backend v2.1.0 running on http://0.0.0.0:${port}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 Security: Rate limiting enabled`);
    if (Sentry) console.log(`📡 Sentry: Error tracking enabled`);
});
