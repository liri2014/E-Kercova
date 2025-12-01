# 🏛️ E-Kičevo

<p align="center">
  <img src="resources/icon.png" alt="E-Kičevo Logo" width="150" height="150">
</p>

<p align="center">
  <strong>Smart City Mobile App for the Municipality of Kičevo</strong><br>
  <em>Општината Кичево • Komuna e Kërçovës</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue" alt="Version">
  <img src="https://img.shields.io/badge/platform-Android%20%7C%20iOS-green" alt="Platform">
  <img src="https://img.shields.io/badge/languages-MK%20%7C%20SQ%20%7C%20EN-orange" alt="Languages">
</p>

---

## 📱 About

**E-Kičevo** is a comprehensive smart city application that connects citizens of Kičevo, North Macedonia with their local government. Report problems, pay for parking, stay informed about city news and events - all in one app.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🚨 **Problem Reporting** | Report municipal issues with photos, GPS location & AI categorization |
| 🅿️ **Smart Parking** | Find spots, pay digitally, get expiry reminders |
| 📰 **City News** | Trilingual news articles with auto-translation |
| 📅 **Events & Holidays** | City events + national/religious holidays calendar |
| 🗺️ **City Map** | Interactive map with landmarks and reports |
| 💰 **Digital Wallet** | Secure payments for city services |
| 🌙 **Dark Mode** | Automatic theme based on system preference |
| 🌐 **Multilingual** | Macedonian, Albanian, English |

## 🛠️ Tech Stack

### Mobile App
- **React 19** + TypeScript
- **Capacitor 7** (Android & iOS)
- **TailwindCSS 4**
- **Leaflet** for maps

### Backend
- **Node.js** + Express
- **Supabase** (PostgreSQL + Auth + Storage)
- **Firebase Cloud Messaging** (Push Notifications)

### Admin Panel
- **React** + Vite
- **Recharts** for analytics
- Deployed on **Vercel**

## 📦 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Sync with mobile platforms
npx cap sync

# Build Android APK
cd android && ./gradlew assembleRelease

# Build Android AAB (Play Store)
cd android && ./gradlew bundleRelease
```

## 📁 Project Structure

```
├── components/        # React components
│   └── views/        # App screens
├── contexts/         # Auth & Theme contexts
├── services/         # API & utilities
├── admin-panel/      # Admin dashboard
├── backend/          # Node.js API server
├── android/          # Android native project
├── ios/              # iOS native project
└── migrations/       # SQL migrations
```

## 🔐 Security

- ✅ Phone OTP authentication
- ✅ Row Level Security (RLS)
- ✅ API rate limiting
- ✅ HTTPS enforced
- ✅ ProGuard code obfuscation

## 📊 App Metrics

| Metric | Value |
|--------|-------|
| APK Size | ~10 MB |
| JS Bundle | ~150 KB (gzipped) |
| Min Android | 6.0 (API 23) |
| Min iOS | 14.0 |

## 📖 Documentation

See [DOCUMENTATION.md](DOCUMENTATION.md) for comprehensive technical documentation including:
- Architecture overview
- Database schema
- API endpoints
- Deployment guide
- Security implementation

## 🌍 Languages Supported

- 🇲🇰 Macedonian (Македонски)
- 🇦🇱 Albanian (Shqip)
- 🇬🇧 English

## 📄 License

© 2025 Municipality of Kičevo. All rights reserved.

---

<p align="center">
  Made with ❤️ for the citizens of Kičevo
</p>
