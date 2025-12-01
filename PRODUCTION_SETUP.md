# E-Kicevo Production Setup Guide

This document outlines all the environment variables and configurations needed to deploy E-Kicevo to production.

---

## Frontend Environment Variables

Create a `.env.production` file in the root directory:

```env
# API Backend URL
VITE_API_URL=https://your-backend.onrender.com

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Sentry Error Tracking (Optional)
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Google Maps API Key (for map features)
VITE_GOOGLE_MAPS_KEY=your-google-maps-key
```

---

## Backend Environment Variables (Render/Railway)

Set these in your hosting platform's dashboard:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Firebase Cloud Messaging (Push Notifications)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"..."}

# Sentry Error Tracking (Optional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Security
ADMIN_API_KEY=your-secure-admin-api-key
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://admin.your-domain.com

# Google Gemini AI (for report analysis)
GEMINI_API_KEY=your-gemini-api-key
```

---

## Firebase Setup for Push Notifications

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Cloud Messaging

### 2. Generate Service Account Key
1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Convert to single-line JSON:
   ```bash
   cat firebase-service-account.json | jq -c
   ```
5. Set as `FIREBASE_SERVICE_ACCOUNT` environment variable

### 3. Android Configuration
1. Download `google-services.json` from Firebase Console
2. Place in `android/app/google-services.json`
3. Ensure package name matches your app

### 4. iOS Configuration (if deploying to iOS)
1. Download `GoogleService-Info.plist`
2. Place in `ios/App/App/`
3. Configure APNs in Apple Developer Portal

---

## Sentry Setup for Error Tracking

### 1. Create Sentry Project
1. Go to [Sentry.io](https://sentry.io/)
2. Create a new project (React for frontend, Node.js for backend)
3. Copy the DSN from project settings

### 2. Configure Alerts
- Set up email alerts for critical errors
- Configure Slack/Discord integration if needed
- Set performance monitoring thresholds

---

## Supabase Database Setup

### Required Tables
Run these migrations in Supabase SQL Editor:

1. **Base Schema** - `supabase_schema.sql`
2. **Community Features** - `migrations/add_community_features_no_postgis.sql`
3. **Holidays** - `migrations/add_north_macedonia_holidays.sql`
4. **Parking Reminders** - `migrations/add_parking_reminders.sql`
5. **Notifications** - `migrations/add_notifications_table.sql`

### Row Level Security (RLS)
Ensure RLS is enabled on all tables with appropriate policies.

---

## Security Checklist

### API Security
- [x] Rate limiting configured (express-rate-limit)
- [x] Helmet security headers enabled
- [x] Input validation/sanitization
- [x] CORS properly configured
- [x] Admin API key for sensitive endpoints

### Data Security
- [ ] Supabase RLS policies reviewed
- [ ] Service key only used on backend
- [ ] User data encrypted at rest
- [ ] HTTPS enforced

### App Security
- [ ] API keys not exposed in client code
- [ ] ProGuard enabled for Android release builds
- [ ] App signing configured

---

## Deployment Checklist

### Frontend Build
```bash
# Build production bundle
npm run build

# Sync with mobile platforms
npx cap sync

# Build Android APK/AAB
cd android
./gradlew assembleRelease    # APK
./gradlew bundleRelease      # AAB for Play Store
```

### Backend Deployment
1. Push to GitHub (auto-deploys on Render)
2. Verify environment variables are set
3. Check health endpoint: `GET /health`
4. Monitor logs for errors

---

## API Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| General API | 100 requests | 15 minutes |
| Auth | 10 requests | 1 hour |
| Reports | 20 requests | 1 hour |
| Search | 30 requests | 1 minute |
| Notifications | 5 requests | 1 minute |

---

## Monitoring & Alerts

### Health Checks
- Backend: `GET /health`
- Configure uptime monitoring (UptimeRobot, Pingdom)

### Performance Monitoring
- Sentry performance traces
- Lighthouse CI for frontend metrics

### Error Alerts
- Sentry alerts for new errors
- Slack/email notifications for critical issues

---

## Support

For production issues, check:
1. Render/Railway logs
2. Supabase dashboard logs
3. Sentry error dashboard
4. Firebase Cloud Messaging delivery reports

