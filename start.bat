@echo off
setlocal enabledelayedexpansion
title Smart Wallet - Launchpad
color 0A

echo ===================================================
echo         SMART WALLET - DEMARRAGE DU PROJET
echo ===================================================
echo.

set "ROOT_DIR=%~dp0"
set "API_DIR=%ROOT_DIR%smart-wallet-api"
set "UI_DIR=%ROOT_DIR%smart-wallet-ui"
set "JDK_DIR=%USERPROFILE%\.jdks\ms-21.0.10"
set "MYSQL_DIR=C:\wamp64\bin\mysql\mysql9.1.0"

REM --- Java 21 ---
if exist "%JDK_DIR%\bin\java.exe" (
    set "JAVA_HOME=%JDK_DIR%"
) else if exist "C:\Program Files\Java\jdk-21\bin\java.exe" (
    set "JAVA_HOME=C:\Program Files\Java\jdk-21"
) else if exist "%USERPROFILE%\.jdks\openjdk-25.0.2\bin\java.exe" (
    set "JAVA_HOME=%USERPROFILE%\.jdks\openjdk-25.0.2"
) else if defined JAVA_HOME (
    rem Conserver JAVA_HOME
) else (
    echo [ERREUR] JDK 21 introuvable dans "%JDK_DIR%".
    echo          Modifiez JDK_DIR en haut de start.bat.
    goto :fail
)
set "PATH=%JAVA_HOME%\bin;%PATH%"
echo [OK] JDK 21 detecte : %JAVA_HOME%

REM --- Node / npm ---
where npm >nul 2>&1 || (
    echo [ERREUR] npm introuvable. Installez Node.js.
    goto :fail
)
echo [OK] Node/npm detecte.

REM --- 1. Base MySQL (Port 3306) ---
echo.
echo [1/3] Verification de la base MySQL (port 3306)...
call :port_open 3306 && (
    echo   -^> MySQL est deja actif sur le port 3306.
    goto :backend
)

echo   -^> MySQL non detecte sur le port 3306. Tentative de lancement...
net start wampmysqld64 >nul 2>&1
call :wait_port 3306 8 && (
    echo   -^> Service MySQL (WAMP) demarre avec succes.
    goto :backend
)

if exist "%MYSQL_DIR%\bin\mysqld.exe" (
    echo   -^> Lancement autonome de MySQL (processus separe)...
    start "Smart Wallet - MySQL Server (Port 3306)" /MIN "%MYSQL_DIR%\bin\mysqld.exe" --defaults-file="%MYSQL_DIR%\my.ini"
    call :wait_port 3306 15 && (
        echo   -^> MySQL demarre avec succes sur le port 3306.
        goto :backend
    )
)

echo   -^> Attention : Impossible de detecter MySQL sur le port 3306.
echo       Assurez-vous que WampServer est lance.

:backend
echo.
echo [2/3] Lancement du Backend (Spring Boot API sur le port 8081)...
call :port_open 8081 && (
    echo   -^> Backend deja actif sur le port 8081.
    goto :frontend
)
start "Smart Wallet - Backend API (Port 8081)" /D "%API_DIR%" cmd /k call run.bat

:frontend
echo.
echo [3/3] Lancement du Frontend (React Vite sur le port 5173)...
call :port_open 5173 && (
    echo   -^> Frontend deja actif sur le port 5173.
    goto :wait_services
)
start "Smart Wallet - Frontend UI (Port 5173)" /D "%UI_DIR%" cmd /k call run.bat

:wait_services
echo.
echo Attente de la disponibilite du backend (port 8081, max 90 s)...
call :wait_port 8081 90 && (
    echo   -^> Backend pret sur http://localhost:8081 !
) || (
    echo   -^> Le backend met plus de temps a demarrer. Consultez la fenetre Backend API.
)

echo.
echo Ouverture automatique de http://localhost:5173 dans votre navigateur...
start http://localhost:5173

:dashboard_menu
cls
echo ========================================================
echo         SMART WALLET - PANNEAU DE CONTROLE LOCAL
echo ========================================================
echo.
echo  Statut des services :
call :port_open 3306 && (
    echo    - MySQL Database  (Port 3306) : [EN LIGNE]
) || (
    echo    - MySQL Database  (Port 3306) : [ARRETE]
)
call :port_open 8081 && (
    echo    - Backend API     (Port 8081) : [EN LIGNE]  -^> http://localhost:8081
) || (
    echo    - Backend API     (Port 8081) : [ARRETE]
)
call :port_open 5173 && (
    echo    - Frontend UI     (Port 5173) : [EN LIGNE]  -^> http://localhost:5173
) || (
    echo    - Frontend UI     (Port 5173) : [ARRETE]
)
echo.
echo ========================================================
echo  Actions disponibles :
echo    [1] Ouvrir l'application web dans le navigateur
echo    [2] Relancer le Backend API (port 8081)
echo    [3] Relancer le Frontend UI (port 5173)
echo    [R] Rafraichir le statut
echo    [Q] Quitter et fermer tous les services
echo ========================================================
echo.
set /p "CHOICE=Votre choix (1/2/3/R/Q) : "

if /i "%CHOICE%"=="1" (
    start http://localhost:5173
    goto :dashboard_menu
)
if /i "%CHOICE%"=="2" (
    start "Smart Wallet - Backend API (Port 8081)" /D "%API_DIR%" cmd /k call run.bat
    goto :dashboard_menu
)
if /i "%CHOICE%"=="3" (
    start "Smart Wallet - Frontend UI (Port 5173)" /D "%UI_DIR%" cmd /k call run.bat
    goto :dashboard_menu
)
if /i "%CHOICE%"=="R" (
    goto :dashboard_menu
)
if /i "%CHOICE%"=="Q" (
    echo.
    echo Arret des services Smart Wallet...
    call "%ROOT_DIR%stop.bat"
    exit /b 0
)

goto :dashboard_menu

:fail
echo.
pause
exit /b 1

REM --- Helpers -----------------------------------------------------
:port_open
netstat -ano | findstr /R /C:":%~1 .*LISTENING" >nul
exit /b %errorlevel%

:wait_port
for /L %%i in (1,1,%~2) do (
    call :port_open %~1 && exit /b 0
    ping -n 2 127.0.0.1 >nul
)
exit /b 1
