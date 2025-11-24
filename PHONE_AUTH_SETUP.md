# Supabase Phone Authentication Setup

## Step 1: Enable Phone Auth in Supabase
1. Go to your **Supabase Dashboard**
2. Click on **Authentication** (left sidebar)
3. Go to **Providers** tab
4. Find **Phone** and click **Enable**

## Step 2: Choose SMS Provider - Twilio (Recommended)
1. Select **Twilio** as your SMS provider
2. Go to https://www.twilio.com/try-twilio
3. Sign up for a **Free Trial Account**
   - You get: **$15 in free credits** (approx 200-300 SMS)
4. After signup, go to **Twilio Console** (https://console.twilio.com)
5. Copy these credentials:
   - **Account SID**
   - **Auth Token**
   - **Phone Number** (Twilio will provide a free trial number)

## Step 3: Configure Supabase with Twilio
1. Back in **Supabase > Authentication > Providers > Phone**
2. Paste your Twilio credentials:
   - **Twilio Account SID**: [paste here]
   - **Twilio Auth Token**: [paste here]
   - **Twilio Message Service SID**: (optional, can skip for now)
3. Click **Save**

## Step 4: Test the App
1. **Important:** Twilio trial accounts can only send to **verified phone numbers**
2. In Twilio Console, add your phone number to **Verified Caller IDs**:
   - Go to **Phone Numbers > Manage > Verified Caller IDs**
   - Click **Add a new number**
   - Enter YOUR phone number (the one you'll test with)
   - Twilio will send you a verification code
3. Now test the app with your verified number!

## Country Code
The app automatically adds **+389** (Macedonia) to phone numbers.
- If testing with a different country, temporarily modify `App.tsx` line 185:
  ```typescript
  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber}`; // Change to your country code
  ```

## Troubleshooting
- **"Invalid credentials"**: Double-check Twilio Account SID and Auth Token
- **"Unverified number"**: Add your test phone to Twilio Verified Caller IDs
- **"Service unavailable"**: Check your Supabase project is not paused
- Check Supabase logs: **Supabase Dashboard > Logs**
- Check Twilio logs: **Twilio Console > Monitor > Logs > Messaging**

## Going to Production
- Upgrade Twilio account (remove trial limitations)
- Or switch to another provider like **MessageBird** or **Vonage**
- All verified numbers will work without restrictions
