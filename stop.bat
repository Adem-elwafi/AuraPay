@echo off
title Smart Wallet - Arret des services
color 0C

echo ========================================================
echo        SMART WALLET - ARRET DES SERVICES
echo ========================================================
echo.

echo [1/3] Arret du Backend API (Port 8081)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":8081 .*LISTENING"') do (
    echo   -^> Arret du processus PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [2/3] Arret du Frontend UI (Port 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":5173 .*LISTENING"') do (
    echo   -^> Arret du processus PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [3/3] Statut de MySQL (Port 3306)...
echo   -^> Note : MySQL est conserve actif pour WAMP.

echo.
echo ========================================================
echo  Tous les services de Smart Wallet ont ete arretes.
echo ========================================================
echo.
timeout /t 3 >nul
exit /b 0
