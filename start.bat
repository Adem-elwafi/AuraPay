@echo off
setlocal
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

REM --- Java 21 (herite par la fenetre du backend) ---
if exist "%JDK_DIR%\bin\java.exe" (
    set "JAVA_HOME=%JDK_DIR%"
    set "PATH=%JDK_DIR%\bin;%PATH%"
) else (
    echo [ERREUR] JDK 21 introuvable dans "%JDK_DIR%".
    echo          Modifiez JDK_DIR en haut de start.bat.
    goto :fail
)

REM --- Node / npm ---
where npm >nul 2>&1 || (
    echo [ERREUR] npm introuvable. Installez Node.js.
    goto :fail
)

echo [1/3] Verification de la base MySQL (port 3306)...
call :port_open 3306 && (
    echo   -^> MySQL est deja actif.
    goto :backend
)
if not exist "%MYSQL_DIR%\bin\mysqld.exe" (
    echo   -^> Attention : mysqld.exe introuvable, demarrez MySQL manuellement.
    goto :backend
)
start "" /B /MIN "%MYSQL_DIR%\bin\mysqld.exe" --defaults-file="%MYSQL_DIR%\my.ini"
call :wait_port 3306 20 && (
    echo   -^> MySQL demarre avec succes.
) || (
    echo   -^> Attention : MySQL ne repond pas sur le port 3306.
)

:backend
echo.
echo [2/3] Lancement du Backend (Spring Boot API sur le port 8081)...
start "Smart Wallet - Backend API (Port 8081)" /D "%API_DIR%" cmd /k call .\mvnw.cmd spring-boot:run

echo.
echo [3/3] Lancement du Frontend (React Vite sur le port 5173)...
if not exist "%UI_DIR%\node_modules" (
    echo   -^> node_modules absent, installation des dependances...
    pushd "%UI_DIR%"
    call npm install
    popd
)
start "Smart Wallet - Frontend UI (Port 5173)" /D "%UI_DIR%" cmd /k npm run dev

echo.
echo En attente du backend (port 8081, max 90 s)...
call :wait_port 8081 90 && (
    echo   -^> Backend pret.
) || (
    echo   -^> Le backend n'a pas encore demarre, verifiez sa fenetre.
)

echo.
echo ===================================================
echo  Services lances :
echo   - Base de donnees : MySQL (port 3306)
echo   - Backend API    : http://localhost:8081
echo   - Frontend UI    : http://localhost:5173
echo ===================================================
echo.
pause
exit /b 0

:fail
echo.
pause
exit /b 1

REM --- Helpers -----------------------------------------------------
REM :port_open PORT  -> errorlevel 0 si le port est en ecoute
:port_open
netstat -ano | findstr /R /C:":%~1 .*LISTENING" >nul
exit /b %errorlevel%

REM :wait_port PORT SECONDES -> errorlevel 0 si le port s'ouvre a temps
:wait_port
for /L %%i in (1,1,%~2) do (
    call :port_open %~1 && exit /b 0
    ping -n 2 127.0.0.1 >nul
)
exit /b 1
