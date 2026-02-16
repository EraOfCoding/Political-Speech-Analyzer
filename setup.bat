@echo off
echo =============================================
echo Political Speech Analyzer - Setup Script
echo =============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    echo Minimum version: 18.0.0
    pause
    exit /b 1
)

node --version
npm --version
echo.

REM Install dependencies
echo Installing dependencies...
echo This may take 2-3 minutes...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Dependencies installed!
    echo.
) else (
    echo.
    echo [ERROR] Failed to install dependencies
    echo Please check the error messages above
    pause
    exit /b 1
)

REM Check if .env.local exists
if exist .env.local (
    findstr "your_openai_api_key_here" .env.local >nul
    if %ERRORLEVEL% EQU 0 (
        echo [WARNING] Please add your OpenAI API key to .env.local
        echo.
        echo Steps:
        echo 1. Open .env.local in Notepad
        echo 2. Replace 'your_openai_api_key_here' with your actual API key
        echo 3. Get your API key from: https://platform.openai.com/api-keys
        echo.
    ) else (
        echo [SUCCESS] OpenAI API key configured
        echo.
    )
) else (
    echo [ERROR] .env.local file not found
    pause
    exit /b 1
)

echo =============================================
echo Setup Complete!
echo =============================================
echo.
echo To start the app, run:
echo   npm run dev
echo.
echo Then open: http://localhost:3000
echo.
echo Need help? Read QUICKSTART.md
echo.
pause
