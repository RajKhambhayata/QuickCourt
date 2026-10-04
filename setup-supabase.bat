@echo off
cls
echo.
echo ========================================
echo   Supabase Database Setup Script
echo ========================================
echo.

echo Step 1: Checking for .env file...
if not exist .env (
    echo ERROR: .env file not found!
    echo Please create a .env file with your Supabase credentials.
    echo Run .\configure-env.bat first.
    pause
    exit /b 1
)

echo Found .env file
echo.

echo Step 2: Generating Prisma Client...
call npm run prisma:generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Prisma client
    pause
    exit /b 1
)

echo Prisma client generated successfully
echo.

echo Step 3: Pushing schema to Supabase...
call npm run prisma:push
if %errorlevel% neq 0 (
    echo ERROR: Failed to push schema to Supabase
    echo Please check your DATABASE_URL in .env file
    pause
    exit /b 1
)

echo Schema pushed to Supabase successfully
echo.

echo Step 4: Seeding database with test accounts...
call npm run prisma:seed
if %errorlevel% neq 0 (
    echo ERROR: Failed to seed database
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo IMPORTANT: Save the passwords displayed above!
echo They will not be shown again.
echo.
echo Next steps:
echo 1. Start dev server: .\dev.bat
echo 2. Test login at:
echo    - Admin:   http://localhost:3000/admin/login
echo    - Owner:   http://localhost:3000/owner/login
echo    - Player:  http://localhost:3000/player/login
echo.
pause
