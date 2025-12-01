const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 login attempts per hour
    message: {
        error: 'Too many authentication attempts, please try again in an hour.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for notification sending (prevent spam)
const notificationLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 notifications per minute
    message: {
        error: 'Too many notifications sent, please slow down.',
        retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for report submissions
const reportLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 reports per hour
    message: {
        error: 'Too many reports submitted, please try again later.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for search (prevent abuse)
const searchLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 searches per minute
    message: {
        error: 'Too many search requests, please slow down.',
        retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Input validation middleware
const validateInput = (req, res, next) => {
    // Sanitize string inputs to prevent XSS
    const sanitize = (obj) => {
        if (typeof obj === 'string') {
            // Remove potentially dangerous characters
            return obj
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '')
                .trim();
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitize);
        }
        if (obj && typeof obj === 'object') {
            const sanitized = {};
            for (const key of Object.keys(obj)) {
                sanitized[key] = sanitize(obj[key]);
            }
            return sanitized;
        }
        return obj;
    };

    if (req.body) {
        req.body = sanitize(req.body);
    }
    if (req.query) {
        req.query = sanitize(req.query);
    }
    if (req.params) {
        req.params = sanitize(req.params);
    }

    next();
};

// Request size limiter
const sizeLimiter = (maxSize = '10mb') => {
    return (req, res, next) => {
        const contentLength = parseInt(req.headers['content-length'] || '0');
        const maxBytes = parseInt(maxSize) * (maxSize.includes('mb') ? 1024 * 1024 : 1024);
        
        if (contentLength > maxBytes) {
            return res.status(413).json({
                error: 'Request too large',
                maxSize
            });
        }
        next();
    };
};

// API key validation middleware (for admin endpoints)
const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const validKey = process.env.ADMIN_API_KEY;

    if (!validKey) {
        // If no API key is set, skip validation (development mode)
        return next();
    }

    if (!apiKey || apiKey !== validKey) {
        return res.status(401).json({
            error: 'Invalid or missing API key'
        });
    }

    next();
};

// Log suspicious requests
const securityLogger = (req, res, next) => {
    const suspicious = [
        /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // SQL injection
        /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/i, // XSS
        /((\%3C)|<)((\%69)|i|(\%49))((\%6D)|m|(\%4D))((\%67)|g|(\%47))/i, // IMG XSS
    ];

    const checkValue = (value) => {
        if (typeof value !== 'string') return false;
        return suspicious.some(pattern => pattern.test(value));
    };

    const checkObject = (obj) => {
        if (!obj) return false;
        for (const key of Object.keys(obj)) {
            if (checkValue(obj[key])) return true;
        }
        return false;
    };

    if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
        console.warn(`⚠️ Suspicious request detected from ${req.ip}:`, {
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString()
        });
    }

    next();
};

module.exports = {
    apiLimiter,
    authLimiter,
    notificationLimiter,
    reportLimiter,
    searchLimiter,
    validateInput,
    sizeLimiter,
    validateApiKey,
    securityLogger
};

