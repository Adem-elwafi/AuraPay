@echo off
setlocal
title Smart Wallet - Backend API (Port 8081)
color 0B

echo ========================================================
echo       SMART WALLET - BACKEND API (PORT 8081)
echo ========================================================
echo.

REM 1. Detection Java 21 (requis pour Spring Boot 3 / 4)
if exist "%USERPROFILE%\.jdks\ms-21.0.10\bin\java.exe" (
    set "JAVA_HOME=%USERPROFILE%\.jdks\ms-21.0.10"
) else if exist "C:\Program Files\Java\jdk-21\bin\java.exe" (
    set "JAVA_HOME=C:\Program Files\Java\jdk-21"
) else if exist "%USERPROFILE%\.jdks\openjdk-25.0.2\bin\java.exe" (
    set "JAVA_HOME=%USERPROFILE%\.jdks\openjdk-25.0.2"
) else if defined JAVA_HOME (
    echo Using existing JAVA_HOME: %JAVA_HOME%
)

if not defined JAVA_HOME (
    echo [ERREUR] Impossible de trouver un JDK 21.
    echo          Verifiez son installation dans %%USERPROFILE%%\.jdks\ms-21.0.10
    pause
    exit /b 1
)

set "PATH=%JAVA_HOME%\bin;%PATH%"
cd /d "%~dp0"

echo [OK] Utilisation de Java : %JAVA_HOME%
echo.
echo Demarrage de Spring Boot via Maven Wrapper...
echo.

call .\mvnw.cmd spring-boot:run
if %errorlevel% neq 0 (
    echo.
    echo [ERREUR] Le backend s'est arrete avec une erreur.
    echo Verifiez les messages ci-dessus.
    pause
)
