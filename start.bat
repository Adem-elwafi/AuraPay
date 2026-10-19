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

echo   -^> MySQL non detecte sur le port 3306. Tentative d'activation...
net start wampmysqld64 >nul 2>&1
call :wait_port 3306 10 && (
    echo   -^> Service MySQL (WAMP) demarre avec succes.
    goto :backend
)

if exist "%MYSQL_DIR%\bin\mysqld.exe" (
    echo   -^> Lancement de mysqld.exe...
    start "" /B /MIN "%MYSQL_DIR%\bin\mysqld.exe" --defaults-file="%MYSQL_DIR%\my.ini"
    call :wait_port 3306 15 && (
        echo   -^> MySQL demarre avec succes sur le port 3306.
        goto :backend
    )
)

echo   -^> Attention : MySQL ne repond pas sur le port 3306.
echo       Demarrez WampServer si la connexion echoue.

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
echo En attente du backend (port 8081, max 90 s)...
call :wait_port 8081 90 && (
    echo   -^> Backend pret sur http://localhost:8081 !
) || (
    echo   -^> Le backend n'a pas encore fini de demarrer. Verifiez la fenetre 'Smart Wallet - Backend API'.
)

echo.
echo ===================================================
echo  Services prets :
echo   - Base de donnees : MySQL (port 3306)
echo   - Backend API    : http://localhost:8081
echo   - Frontend UI    : http://localhost:5173
echo ===================================================
echo.
echo Ouverture automatique dans votre navigateur...
start http://localhost:5173
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
