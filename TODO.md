# E-Kicevo App - Todo List

Last Updated: December 1, 2025

---

## 🔒 Security Audit - COMPLETED ✅

All critical security issues have been fixed. See `SECURITY_AUDIT.md` for details.

- [x] JWT authentication on delete account endpoint
- [x] Admin role verification in admin panel
- [x] API key protection on admin routes
- [x] File upload validation (images only, 10MB max)
- [x] HTTPS-only network security
- [x] ProGuard code obfuscation enabled
- [x] iOS push notification permissions

**Remaining manual action:** Change keystore password

---

## ✅ Completed

- [x] News Translations (using MyMemory API)
- [x] Instagram-style photo carousel with horizontal swipe
- [x] Shrinking photo on scroll effect
- [x] 2-column home grid with Community & City Services
- [x] White flash fix on app launch
- [x] Community features (upvoting reports)
- [x] City Services section
- [x] North Macedonia holidays (Nov 2025 - May 2027)
- [x] Multi-language support (EN, MK, SQ)
- [x] Push notification permissions
- [x] Privacy Policy & Terms of Service
- [x] User registration with name
- [x] Wallet balance persistence in Supabase
- [x] Admin panel user management
- [x] Offline queue support
- [x] Lazy loading for views
- [x] Photo annotation for reports
- [x] **FCM Backend Setup** - Firebase Admin SDK integrated for real push notifications
- [x] **Production API Keys** - Environment variable structure documented (PRODUCTION_SETUP.md)
- [x] **Error Reporting** - Sentry integration for frontend and backend
- [x] **Parking Reminders** - Push notification 10 min before parking expires
- [x] **Search Functionality** - Search across news, events, and reports
- [x] **Dark Mode Auto** - Now supports Light/Dark/Auto (follows system theme)
- [x] **Performance Audit** - DNS prefetch, preconnect, critical CSS, loading states
- [x] **Security Audit** - Rate limiting, input validation, security headers (Helmet)

---

## 🔴 High Priority (Before Launch)

- [ ] **Real Payment Integration** - Connect wallet to Stripe/bank API
- [ ] **App Store Assets** - Screenshots, icons, descriptions (3 languages)

---

## 🟡 Medium Priority (Post-Launch)

- [ ] **Report Status Notifications** - Notify users on status changes
- [ ] **User Profile Page** - View/edit profile, points, activity
- [ ] **Favorites/Bookmarks** - Save events or news for later
- [ ] **Share Reports** - Share to social media/messaging apps

---

## 🟢 Nice to Have

- [ ] **Biometric Login** - Fingerprint/Face ID for quick access
- [ ] **Report Categories Expansion** - More specific categories
- [ ] **Event Reminders** - Set reminder for upcoming events
- [ ] **Gamification** - Points, badges, leaderboard for reporters
- [ ] **iOS Build** - Sync and build for iOS devices

---

## 🛠️ Technical Debt

- [ ] **Unit Tests** - Increase test coverage
- [ ] **Accessibility** - Screen reader support, ARIA labels

---

## 📝 Notes

### Build Commands
```bash
# Build and sync with Android
npm run build && npx cap sync android

# Build APK
cd android && ./gradlew assembleRelease

# Build for iOS (if Mac)
npx cap sync ios
```

### New Backend Routes
```
GET  /api/search?q=query&language=en&type=news|events|reports
GET  /api/search/suggestions?q=query&language=en
POST /api/notifications/send
POST /api/notifications/send-to-user
POST /api/notifications/parking-reminder
POST /api/notifications/process-parking-reminders
POST /api/notifications/report-status
```

### New Migrations
- `migrations/add_parking_reminders.sql` - For scheduling parking expiry notifications

### Important URLs
- **Admin Panel**: Hosted on Vercel
- **Backend**: Hosted on Render (e.g., https://e-kicevo-backend.onrender.com)
- **Database**: Supabase

### Environment Variables

#### Frontend (.env.production)
- `VITE_API_URL` - Backend API URL
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_SENTRY_DSN` - Sentry DSN (optional)

#### Backend (Render/Railway)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_KEY` - Supabase service role key
- `FIREBASE_SERVICE_ACCOUNT` - Firebase service account JSON (stringified)
- `SENTRY_DSN` - Sentry DSN (optional)
- `ADMIN_API_KEY` - API key for admin endpoints
- `ALLOWED_ORIGINS` - Comma-separated allowed CORS origins

### API Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| General API | 100 requests | 15 minutes |
| Auth | 10 requests | 1 hour |
| Reports | 20 requests | 1 hour |
| Search | 30 requests | 1 minute |
| Notifications | 5 requests | 1 minute |

### Translation
Currently using **MyMemory Translation API** (free, no API key required)
- Supports: Albanian (sq), Macedonian (mk), English (en)

### Theme Options
- **Light** ☀️ - Always light mode
- **Dark** 🌙 - Always dark mode
- **Auto** 🔄 - Follows system preference (NEW!)
