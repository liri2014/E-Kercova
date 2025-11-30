# Project Status & Documentation

## Overview
**Project Name**: Municipal Problem Reporter
**Stack**: 
- **Frontend**: React 19, Vite, TailwindCSS 4
- **Mobile**: Capacitor 7 (Android/iOS)
- **Backend**: Node.js/Express (Custom) + Supabase (Auth/DB)
- **Admin**: Separate React/Vite Admin Panel

## 1. What Has Been Done So Far

### Core Application (`/`)
- **Framework Setup**: React + Vite with TypeScript.
- **Mobile Integration**: Capacitor configured for Android and iOS.
- **UI/UX**: 
  - TailwindCSS 4 for styling.
  - Dark/Light mode support.
  - Custom UI components in `components/ui`.
  - "Spotlight" Tutorial Overlay implemented.
- **Navigation**: Custom state-based navigation (`activeView` in `App.tsx`).
- **Features Implemented**:
  - **Dashboard (`HomeView`)**: Widgets for Wallet, Reporting, Parking, Events, News.
  - **Reporting (`ReportView`)**: Camera integration (Capacitor), photo storage, location tagging.
  - **Parking (`ParkingView`)**: Zone selection, SMS payment integration.
  - **News & Events (`NewsView`, `EventsView`)**: Displaying content fetched from API/Supabase.
  - **Wallet (`WalletView`)**: Balance display and management.
  - **Map (`MapView`)**: Leaflet integration for visualizing reports/locations.
  - **History (`HistoryView`)**: User's report history.
  - **Menu (`MenuHub`)**: Settings, Language, Theme toggle.
- **Authentication**: Phone authentication via Supabase (OTP).

### Admin Panel (`/admin-panel`)
- Separate React application for administrators.
- Likely handles management of Reports, News, Events, and Parking zones.
- Has its own build process and dependencies.

### Backend (`/backend`)
- Node.js/Express server.
- Routes for handling specific logic (likely proxying requests or handling complex business logic not suitable for client-side).
- Deployment configurations for Railway and Render.

## 2. What Is Working
- **Build System**: Vite build scripts are present and seem functional.
- **Mobile Sync**: `npm run mobile:sync` script exists to build and sync with Capacitor.
- **Core Views**: All main views (`Home`, `Report`, `Parking`, etc.) have corresponding components in `components/views`.
- **Camera Logic**: sophisticated handling of camera state restoration on Android (in `App.tsx`).
- **Internationalization**: `i18n` setup is present.

## 3. What Needs to be Done / Recommendations

### Immediate Actions
- [ ] **Cleanup**: Remove backup files (`App.tsx.backup`, `*.phaseX.backup`) to avoid confusion.
- [ ] **Refactoring**: 
  - `App.tsx` is very large (460+ lines) and handles Routing, Auth, Camera, and Global State.
  - **Recommendation**: Move Routing to `react-router-dom` (already installed) or a dedicated `Router` component.
  - **Recommendation**: Move Auth and Theme logic to Context Providers (`AuthProvider`, `ThemeProvider`).
- [ ] **Backend Clarification**: Determine if the Node.js backend is strictly necessary or if Supabase Edge Functions could replace it to simplify the stack.

### Missing / To Be Added
- **Tests**: No obvious testing setup (Unit or E2E) found.
- **CI/CD**: No GitHub Actions or similar workflows visible for automated testing/deployment.
- **Error Handling**: Global error boundary seems missing (though `Toast` is used for notifications).
- **Offline Support**: While Capacitor helps, robust offline queuing for reports (if network is down) might need verification.

## 4. Migration to Cursor (Next Steps)
To fully leverage Cursor:
1.  **Open Workspace**: Open the root folder in Cursor.
2.  **Install Extensions**: Ensure ESLint, Prettier, and Tailwind CSS extensions are active.
3.  **Run Dev Server**: Use `npm run dev` to start the frontend.
4.  **Run Backend**: If needed, start the backend server in a separate terminal (`cd backend && npm start`).
5.  **AI Context**: Use `@Codebase` in Cursor to ask questions about `App.tsx` or specific components.

## Directory Structure Summary
- `src/`: Main source code.
- `components/`: Reusable UI and Feature components.
- `components/views/`: Full-page views (Dashboard, Report, etc.).
- `admin-panel/`: Separate Admin App.
- `backend/`: API Server.
- `android/` & `ios/`: Native mobile project files.
