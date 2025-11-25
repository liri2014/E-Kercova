@echo off
echo Creating admin panel .env file...
cd admin-panel
(
echo # Admin Panel Environment Variables
echo.
echo # Backend API URL - Your Render deployment
echo VITE_API_URL=https://e-kicevo-backend.onrender.com
) > .env
echo .env file created successfully!
echo.
echo Now rebuilding admin panel...
call npm run build
echo.
echo Done! Your admin panel is now configured to use your live Render backend.
pause
