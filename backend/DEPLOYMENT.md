# Railway Deployment Guide

This guide walks you through deploying the E-Kicevo backend to Railway's free tier with a hybrid keep-alive strategy.

## Prerequisites

- GitHub account
- Railway account (sign up at [railway.app](https://railway.app))
- Environment variables ready (see `.env.example`)

## Step 1: Push Code to GitHub

If you haven't already, push your backend code to a GitHub repository:

```bash
cd backend
git init
git add .
git commit -m "Initial backend commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## Step 2: Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `municipal-problem-reporter` repository
5. Railway will auto-detect the backend directory

## Step 3: Configure Environment Variables

1. In your Railway project dashboard, click on your service
2. Go to **"Variables"** tab
3. Add the following environment variables:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
NODE_ENV=production
```

4. Click **"Deploy"** to redeploy with new variables

## Step 4: Get Your Railway URL

1. After deployment completes, go to **"Settings"** tab
2. Under **"Domains"**, you'll see your Railway URL (e.g., `your-app.up.railway.app`)
3. Copy this URL - you'll need it for the mobile app and keep-alive setup

## Step 5: Test Your Deployment

Open your browser and test these endpoints:

- **Health Check**: `https://your-app.up.railway.app/health`
  - Should return: `{"status":"ok","timestamp":"...","environment":"production","uptime":...}`

- **Root**: `https://your-app.up.railway.app/`
  - Should return: "E-Kicevo Backend is running"

- **Test API**: `https://your-app.up.railway.app/api/news`
  - Should return news data from Supabase

## Step 6: Set Up Keep-Alive with Cron-Job.org

To keep your Railway app active during business hours and stay within free tier limits:

1. Go to [cron-job.org](https://cron-job.org) and create a free account
2. Click **"Create cronjob"**
3. Configure the job:
   - **Title**: "Railway E-Kicevo Keep-Alive"
   - **URL**: `https://your-app.up.railway.app/health`
   - **Schedule**: 
     - Pattern: `*/14 * * * *` (every 14 minutes)
     - **Important**: Click "Advanced" and set time restriction:
       - **From**: 08:00
       - **To**: 22:00
       - **Timezone**: Europe/Skopje (or your local timezone)
4. Enable notifications (optional) to get alerts if the ping fails
5. Click **"Create"**

**Expected Usage**: This schedule keeps your app active ~14 hours/day = ~420 hours/month (within the ~500 hour free tier limit)

## Step 7: Update Mobile App Configuration

Update your mobile app to use the Railway URL instead of localtunnel:

1. Open `.env` file in the root of your project
2. Update `VITE_API_BASE_URL`:
   ```
   VITE_API_BASE_URL=https://your-app.up.railway.app
   ```
3. Rebuild and sync the app:
   ```bash
   npm run build
   npx cap sync android
   ```
4. Clean and rebuild in Android Studio

## Step 8: Update Admin Panel Configuration

Update the admin panel environment file:

1. Open `admin-panel/.env`
2. Update `VITE_API_URL`:
   ```
   VITE_API_URL=https://your-app.up.railway.app
   ```
3. Rebuild the admin panel if needed

## Monitoring & Troubleshooting

### Check Railway Logs

1. In Railway dashboard, click on your service
2. Go to **"Deployments"** tab
3. Click on the active deployment to view logs

### Monitor Usage

1. Go to Railway dashboard
2. Click on **"Usage"** in the sidebar
3. Monitor your monthly hours and resource consumption
4. You should see approximately 14 hours of usage per day

### Common Issues

**Issue**: Deployment fails
- **Solution**: Check Railway logs for errors. Ensure all environment variables are set correctly.

**Issue**: Health check fails
- **Solution**: Verify the `/health` endpoint returns 200 OK. Check Railway logs for startup errors.

**Issue**: Database connection errors
- **Solution**: Verify `SUPABASE_URL` and `SUPABASE_KEY` are correct. Test Supabase connectivity.

**Issue**: Exceeding free tier
- **Solution**: Verify cron job is only running 8am-10pm. Consider reducing active hours or upgrading to paid tier.

### Cold Starts

If you access the app outside of keep-alive hours (10pm-8am), expect:
- First request: 10-20 seconds (Railway wakes the service)
- Subsequent requests: Normal speed

This is acceptable for a municipal reporting app where nighttime usage is minimal.

## Railway Free Tier Limits

- **Execution Time**: ~500 hours/month
- **Memory**: 512 MB
- **Bandwidth**: 100 GB outbound/month
- **Builds**: Unlimited

With the 8am-10pm keep-alive strategy, you'll use ~420 hours/month, leaving buffer for occasional nighttime usage.

## Need Help?

- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Cron-Job.org Support: [cron-job.org/en/documentation](https://cron-job.org/en/documentation/)
