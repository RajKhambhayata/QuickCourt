@echo off
set PATH=C:\Users\rajkh\AppData\Local\OpenAI\Codex\runtimes\cua_node\cd454f7c85348168\bin;%PATH%
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
npm run dev
pause
