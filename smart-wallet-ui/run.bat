@echo off
setlocal
title Smart Wallet - Frontend UI (Port 5173)
color 0E

echo ========================================================
echo       SMART WALLET - FRONTEND UI (PORT 5173)
echo ========================================================
echo.

cd /d "%~dp0"

if not exist "node_modules" (
    echo Installation des dependances npm...
    call npm install
)

echo Demarrage du serveur Vite sur http://localhost:5173 ...
call npm run dev
if %errorlevel% neq 0 (
    echo.
    echo [ERREUR] Le frontend s'est arrete avec une erreur.
    pause
)
