@echo off
echo Starting Expo in Tunnel Mode...
echo This might take a few seconds.
echo.
cd mobile
call npx expo start --tunnel --clear
pause
