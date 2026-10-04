@echo off
cls
echo.
echo ========================================
echo   Environment Configuration Helper
echo ========================================
echo.
echo This script will help you configure your .env file for Supabase.
echo.
echo Please enter your Supabase Database Password:
echo (You can find this at: https://supabase.com/dashboard/project/jnrvgijliksjohvkwkgg/settings/database)
echo.

set /p DB_PASSWORD="Database Password: "

echo.
echo Generating secure secrets...
set /a RAND=%random% * 32768 + %random%
set JWT_SECRET=jwt-secret-%RAND%-change-in-production
set /a RAND2=%random% * 32768 + %random%
set OTP_SECRET=otp-secret-%RAND2%-change-in-production
set /a RAND3=%random% * 32768 + %random%
set ADMIN_SECRET=admin-secret-%RAND3%-keep-secure

echo.
echo Creating .env file...
(
echo # Supabase PostgreSQL Database
echo DATABASE_URL="postgresql://postgres.jnrvgijliksjohvkwkgg:%DB_PASSWORD%@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
echo.
echo # Security Secrets
echo JWT_SECRET="%JWT_SECRET%"
echo OTP_SECRET="%OTP_SECRET%"
echo ADMIN_SECRET_KEY="%ADMIN_SECRET%"
echo.
echo # App Configuration
echo NEXT_PUBLIC_APP_URL="http://localhost:3000"
) > .env

echo.
echo ========================================
echo   .env file created successfully!
echo ========================================
echo.
echo Your secrets have been generated securely.
echo Keep this file private and never commit it to git.
echo.
echo Next step: Run .\setup-supabase.bat to initialize your database
echo.
pause
