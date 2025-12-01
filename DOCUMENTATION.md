# E-Kičevo App - Technical Documentation

## 📱 Overview

**E-Kičevo** is a comprehensive smart city mobile application designed for the Municipality of Kičevo (Општината Кичево / Kërçovë), North Macedonia. It serves as a digital bridge between citizens and local government, enabling residents to report municipal issues, pay for parking, access city news and events, and interact with city services—all from their smartphones.

---

## 🎯 Purpose & Vision

The app aims to:
- **Digitize municipal services** for easier citizen access
- **Streamline problem reporting** with AI-powered categorization
- **Provide real-time city information** (news, events, holidays)
- **Enable cashless parking payments**
- **Foster community engagement** through shared reports
- **Support multilingual citizens** (Macedonian, Albanian, English)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  Mobile App (Capacitor)     │  Admin Panel (Web)                │
│  - Android (APK/AAB)        │  - React + Vite                   │
│  - iOS (IPA)                │  - Deployed on Vercel             │
│  - React + TypeScript       │                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  Backend Server (Node.js + Express)                             │
│  - RESTful API endpoints                                        │
│  - Authentication middleware                                     │
│  - Rate limiting & security                                     │
│  - Push notification service (FCM)                              │
│  - Translation service (MyMemory API)                           │
│  - Deployed on Railway                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  Supabase (PostgreSQL)                                          │
│  - User profiles & authentication                               │
│  - Reports, news, events, landmarks                             │
│  - Transactions & parking data                                  │
│  - Row Level Security (RLS) policies                            │
│  - Real-time subscriptions                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      STORAGE LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  Supabase Storage                                               │
│  - Report photos (with compression)                             │
│  - News images                                                  │
│  - Landmark photos                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend (Mobile App)

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI framework |
| **TypeScript** | 5.8.2 | Type-safe JavaScript |
| **Vite** | 6.2.0 | Build tool & dev server |
| **Capacitor** | 7.4.4 | Native mobile wrapper (Android/iOS) |
| **TailwindCSS** | 4.1.17 | Utility-first CSS framework |
| **Leaflet** | 1.9.4 | Interactive maps |
| **React-Leaflet** | 5.0.0 | React wrapper for Leaflet |

### Frontend (Admin Panel)

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.x | UI framework |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Vite** | 5.x | Build tool |
| **TailwindCSS** | 3.x | Styling |
| **Recharts** | 2.x | Analytics charts |
| **Lucide React** | Icons |
| **React Router DOM** | 6.x | Client-side routing |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **Express.js** | 4.x | Web framework |
| **Supabase JS** | 2.84.0 | Database client |
| **Firebase Admin** | 12.x | Push notifications (FCM) |
| **Helmet** | Security headers |
| **Express Rate Limit** | API rate limiting |
| **Axios** | HTTP client for translations |
| **Multer** | File upload handling |

### Database & Services

| Service | Purpose |
|---------|---------|
| **Supabase** | PostgreSQL database, authentication, storage |
| **Firebase Cloud Messaging** | Push notifications |
| **MyMemory API** | Auto-translation service |
| **Sentry** | Error tracking & monitoring |

### DevOps & Deployment

| Platform | Purpose |
|----------|---------|
| **Railway** | Backend hosting |
| **Vercel** | Admin panel hosting |
| **GitHub** | Version control |
| **Android Studio** | Android builds |
| **Xcode** | iOS builds |

---

## 📦 Features

### 1. **Problem Reporting System**
- 📸 Photo capture with annotation tools (draw arrows, circles)
- 📍 Automatic GPS location tagging
- 🏷️ AI-powered category suggestion
- 📊 Status tracking (pending → in_progress → resolved)
- 🔔 Push notifications on status updates

### 2. **Smart Parking**
- 🅿️ View available parking zones on map
- 💳 Digital wallet for payments
- ⏰ Duration selection (30min - 8hrs)
- 🚗 License plate memory for quick re-entry
- ⏱️ Parking expiry reminders (push notifications)

### 3. **City News**
- 📰 Multi-language news articles (MK/SQ/EN)
- 🖼️ Photo galleries with horizontal scroll
- 🔄 Auto-translation via MyMemory API
- 📅 Publication date & category filtering

### 4. **Events & Holidays**
- 📅 Interactive calendar view
- 🎉 City events and cultural activities
- 🏛️ National holidays (North Macedonia)
- 🕌 Religious holidays (Orthodox, Catholic, Islamic)
- 🌐 Trilingual support

### 5. **City Landmarks**
- 🗺️ Interactive map with landmark pins
- 📖 Historical information
- 🖼️ Photo galleries
- 🧭 Navigation integration

### 6. **Digital Wallet**
- 💰 Virtual balance management
- 💳 Top-up functionality
- 📜 Transaction history
- 🔐 Secure payments

### 7. **Community Reports** *(Coming Soon)*
- 👍 Upvote/downvote system
- 💬 Comments on reports
- 🔥 Popular reports feed
- 📍 Nearby reports

### 8. **City Services** *(Coming Soon)*
- 📄 Document requests
- 💡 Utility bill payments
- 📅 Appointment scheduling

### 9. **Search**
- 🔍 Global search across news, events, reports
- 💡 Search suggestions
- 🏷️ Category filtering

### 10. **Settings & Preferences**
- 🌙 Dark/Light/Auto theme
- 🌐 Language selection (MK/SQ/EN)
- 👤 Profile management
- 📜 Legal documents (Privacy Policy, Terms)
- 🗑️ Account deletion

---

## 📁 Project Structure

```
municipal-problem-reporter/
├── 📱 Mobile App (Root)
│   ├── components/           # React components
│   │   ├── views/           # Main app screens
│   │   │   ├── HomeView.tsx
│   │   │   ├── ReportView.tsx
│   │   │   ├── ParkingView.tsx
│   │   │   ├── EventsView.tsx
│   │   │   ├── NewsView.tsx
│   │   │   ├── MapView.tsx
│   │   │   ├── WalletView.tsx
│   │   │   ├── MenuHub.tsx
│   │   │   ├── CommunityView.tsx
│   │   │   ├── ServicesView.tsx
│   │   │   ├── SearchView.tsx
│   │   │   └── lazy.ts      # Lazy loading exports
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── Icon.tsx     # Custom SVG icon system
│   │   │   └── index.ts
│   │   ├── tutorial/        # Onboarding tutorial
│   │   ├── LegalDocuments.tsx
│   │   ├── PhotoAnnotator.tsx
│   │   ├── OfflineIndicator.tsx
│   │   └── Toast.tsx
│   ├── contexts/            # React contexts
│   │   ├── AuthContext.tsx  # Authentication state
│   │   └── ThemeContext.tsx # Theme management
│   ├── services/            # API & utilities
│   │   ├── api.ts           # Backend API client
│   │   ├── pushNotifications.ts
│   │   ├── offlineQueue.ts  # Offline support
│   │   └── errorTracking.ts # Sentry integration
│   ├── i18n.ts              # Translations (MK/SQ/EN)
│   ├── supabase.ts          # Supabase client
│   ├── App.tsx              # Main app component
│   ├── index.tsx            # Entry point
│   └── types.ts             # TypeScript types
│
├── 🖥️ admin-panel/          # Admin dashboard
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Reports.tsx
│   │   │   ├── Content.tsx  # News/Events management
│   │   │   ├── Parking.tsx
│   │   │   ├── Users.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── HeatMap.tsx
│   │   │   └── Notifications.tsx
│   │   ├── contexts/
│   │   └── components/
│   └── package.json
│
├── ⚙️ backend/              # Node.js API server
│   ├── routes/
│   │   ├── auth.js          # Authentication
│   │   ├── reports.js       # Problem reports
│   │   ├── news.js          # News CRUD + translation
│   │   ├── events.js        # Events management
│   │   ├── parking.js       # Parking zones
│   │   ├── landmarks.js     # City landmarks
│   │   ├── notifications.js # FCM push notifications
│   │   ├── search.js        # Global search
│   │   └── analyze.js       # AI analysis
│   ├── middleware/
│   │   └── security.js      # Helmet, rate limiting
│   ├── server.js            # Express app entry
│   └── package.json
│
├── 📱 android/              # Android native project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── res/         # Icons, splash screens
│   │   │   ├── AndroidManifest.xml
│   │   │   └── assets/public/ # Web assets
│   │   ├── build.gradle
│   │   └── google-services.json
│   └── keystore.properties
│
├── 🍎 ios/                  # iOS native project
│   └── App/
│       ├── App/
│       │   ├── Assets.xcassets/
│       │   └── Info.plist
│       └── Podfile
│
├── 🗃️ migrations/           # SQL migrations
│   ├── add_community_features.sql
│   ├── add_north_macedonia_holidays.sql
│   └── ...
│
├── 📚 resources/            # App icons & splash
│   ├── icon.png
│   └── splash.png
│
└── 📄 Configuration Files
    ├── capacitor.config.ts
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── package.json
    └── vitest.config.ts
```

---

## 🔐 Security Implementation

### Authentication
- **Phone OTP verification** via Supabase Auth
- **JWT tokens** for API authentication
- **Role-based access** (citizen, admin)

### Database Security
- **Row Level Security (RLS)** on all tables
- **Optimized policies** using `(select auth.uid())`
- **Admin-only routes** protected by API keys

### API Security
- **Helmet.js** for security headers
- **Rate limiting** (100 req/15min general, 5 req/15min auth)
- **Input validation** and sanitization
- **CORS** configuration for allowed origins

### Mobile Security
- **HTTPS enforced** via network security config
- **ProGuard** enabled for code obfuscation
- **Secure keystore** for app signing

---

## 🌐 Internationalization (i18n)

The app supports three languages:
- 🇲🇰 **Macedonian** (mk) - Default
- 🇦🇱 **Albanian** (sq)
- 🇬🇧 **English** (en)

### Implementation
```typescript
// i18n.ts - Translation system
const translations = {
  en: { welcome: "Welcome", ... },
  mk: { welcome: "Добредојдовте", ... },
  sq: { welcome: "Mirësevini", ... }
};

// Usage in components
const { t, language, setLanguage } = useTranslation();
<h1>{t('welcome')}</h1>
```

### Auto-Translation
News and events are automatically translated using the **MyMemory Translation API** when created in the admin panel.

---

## 📊 Database Schema (Key Tables)

### profiles
```sql
- id (uuid, PK, FK to auth.users)
- phone (text)
- first_name, last_name (text)
- wallet_balance (integer, default 1000)
- role (text: 'citizen' | 'admin')
- fcm_token (text) -- Push notification token
- language (text: 'mk' | 'sq' | 'en')
- created_at, updated_at (timestamp)
```

### reports
```sql
- id (uuid, PK)
- user_id (uuid, FK to profiles)
- category (text)
- description (text)
- photos (text[]) -- Array of storage URLs
- lat, lng (double precision)
- address (text)
- status (text: 'pending' | 'in_progress' | 'resolved')
- ai_analysis (jsonb) -- AI categorization result
- upvotes_count, comments_count (integer)
- created_at, updated_at (timestamp)
```

### news
```sql
- id (uuid, PK)
- title, title_en, title_mk, title_sq (text)
- description, description_en, description_mk, description_sq (text)
- photos (text[])
- category (text)
- published_at (timestamp)
```

### events
```sql
- id (uuid, PK)
- title, title_en, title_mk, title_sq (text)
- description, description_en, description_mk, description_sq (text)
- event_date (date)
- type (text: 'event' | 'national' | 'orthodox' | 'catholic' | 'islamic')
- location (text)
```

### parking_zones
```sql
- id (uuid, PK)
- name (text)
- lat, lng (double precision)
- hourly_rate (integer)
- total_spots, occupied (integer)
```

### transactions
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- type (text: 'parking' | 'topup' | 'transfer')
- amount (integer)
- description (text)
- created_at (timestamp)
```

---

## 🚀 Deployment

### Backend (Railway)
```bash
cd backend
git push origin main  # Auto-deploys via GitHub integration
```

### Admin Panel (Vercel)
```bash
cd admin-panel
vercel --prod
```

### Mobile App (Android)
```bash
# Build APK (for testing)
npm run build
npx cap sync android
cd android && ./gradlew assembleRelease

# Build AAB (for Play Store)
cd android && ./gradlew bundleRelease
```

### Mobile App (iOS)
```bash
npm run build
npx cap sync ios
# Open in Xcode and archive
```

---

## 🔧 Environment Variables

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_API_URL=https://your-backend.railway.app
VITE_SENTRY_DSN=xxx
```

### Backend (.env)
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx
FIREBASE_PROJECT_ID=xxx
FIREBASE_PRIVATE_KEY=xxx
FIREBASE_CLIENT_EMAIL=xxx
ADMIN_API_KEY=xxx
ALLOWED_ORIGINS=https://admin.ekicevo.com,capacitor://localhost
```

---

## 📈 Performance Optimizations

1. **Code Splitting** - Lazy loading for all views
2. **Image Compression** - Client-side before upload
3. **Bundle Optimization** - Manual chunks for vendors
4. **Console Stripping** - Removed in production builds
5. **Tree Shaking** - Unused code elimination
6. **Caching** - Asset fingerprinting for cache busting

### Bundle Analysis
```
Total JS (gzipped): ~150 KB
- React: 59 KB
- Supabase: 41 KB
- Maps: ~20 KB
- App code: ~30 KB
```

---

## 🧪 Testing

### Unit Tests (Vitest)
```bash
npm run test        # Watch mode
npm run test:run    # Single run
npm run test:coverage
```

### E2E Tests (Playwright)
```bash
npm run test:e2e
npm run test:e2e:ui  # Interactive mode
```

---

## 📱 App Store Information

### Android
- **Package**: `com.ekicevo.app`
- **Min SDK**: 23 (Android 6.0)
- **Target SDK**: 35 (Android 15)
- **APK Size**: ~10 MB
- **AAB Size**: ~11 MB (optimized per device)

### iOS
- **Bundle ID**: `com.ekicevo.app`
- **Min iOS**: 14.0
- **Deployment Target**: iOS 14+

---

## 👨‍💻 Development Setup

```bash
# Clone repository
git clone https://github.com/your-repo/e-kicevo.git
cd e-kicevo

# Install dependencies
npm install
cd admin-panel && npm install
cd ../backend && npm install

# Start development
npm run dev          # Frontend (port 3000)
cd admin-panel && npm run dev  # Admin (port 5173)
cd backend && node server.js   # Backend (port 3001)

# Mobile development
npx cap open android  # Open in Android Studio
npx cap open ios      # Open in Xcode
```

---

## 📞 Contact & Support

- **App Support**: support@ekicevo.com
- **Municipality**: [kicevo.gov.mk](https://kicevo.gov.mk)

---

## 📄 License

© 2025 Municipality of Kičevo. All rights reserved.

---

*Documentation last updated: December 2025*
*App Version: 1.0.0*

