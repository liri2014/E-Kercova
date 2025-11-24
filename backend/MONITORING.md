# Render.com Monitoring Setup

## Quick Start - UptimeRobot (Free)

1. Go to [uptimerobot.com](https://uptimerobot.com) and sign up (free)
2. Click "Add New Monitor"
3. Configure:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: E-Kicevo Backend
   - **URL**: `https://e-kicevo-backend.onrender.com/health`
   - **Monitoring Interval**: 5 minutes (free tier)
4. Click "Create Monitor"

You'll receive email/SMS alerts if your backend goes down!

## Alternative: Render Dashboard

1. Log into [render.com](https://render.com)
2. Go to your service dashboard
3. Click "Logs" tab to monitor real-time errors
4. Set up email notifications in Settings → Notifications

## What to Monitor

- **Uptime**: Backend should respond to /health endpoint
- **Error Rate**: Check Render logs for 500-level errors  
- **Cold Starts**: First request after sleep takes ~30 seconds (free tier)
- **Memory Usage**: Render dashboard shows memory consumption

Done! Your production backend is now monitored. 🎉
