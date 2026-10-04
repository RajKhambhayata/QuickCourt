@echo off
cls
echo.
echo ========================================
echo   QuickCourt Development Server
echo ========================================
echo.
echo   Portal Access Links:
echo.
echo   [ADMIN]   http://localhost:3000/admin/login
echo   [OWNER]   http://localhost:3000/owner/login
echo   [PLAYER]  http://localhost:3000/player/login
echo.
echo ========================================
echo   Starting server...
echo ========================================
echo.
call pnpm run dev
