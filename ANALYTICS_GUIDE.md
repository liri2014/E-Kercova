# Analytics & Push Notifications Setup Guide

## Google Analytics (Optional)

To add analytics tracking:

1. Create a Google Analytics account at [analytics.google.com](https://analytics.google.com)
2. Get your Measurement ID (e.g., `G-XXXXXXXXXX`)
3. Install the plugin:
   ```bash
   npm install @capacitor-community/firebase-analytics
   npx cap sync
   ```
4. Add to `App.tsx`:
   ```typescript
   import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
   
   // Track events
   FirebaseAnalytics.logEvent({
     name: 'report_submitted',
     params: { category: 'infrastructure' }
   });
   ```

## Push Notifications (Optional)

For real-time notifications about report status:

1. Set up Firebase Cloud Messaging
2. Get FCM server key
3. Add to backend for sending notifications
4. Already integrated in app (see `@capacitor/push-notifications`)

**Note:** These features are optional for initial launch. You can add them later based on user feedback.
