@echo off
title Smart Wallet - Arret des Services
color 0C

echo ===================================================
echo         SMART WALLET - ARRET DES SERVICES
echo ===================================================
echo.

echo Arret des processus sur les ports 8081 (Backend) et 5173 (Frontend)...
powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort 8081,5173 -State Listen -ErrorAction SilentlyContinue; if (-not $c) { Write-Host '  -> Aucun service actif.' }; $c | ForEach-Object { taskkill /T /F /PID $_.OwningProcess *> $null; Write-Host ('  -> Processus arrete sur le port ' + $_.LocalPort) }"

echo.
echo ===================================================
echo  Services backend et frontend arretes.
echo ===================================================
echo.
pause
