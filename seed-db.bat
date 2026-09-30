@echo off
set PATH=C:\Users\rajkh\AppData\Local\OpenAI\Codex\runtimes\cua_node\cd454f7c85348168\bin;%PATH%
echo Seeding database with initial venues and users...
echo WARNING: This will DELETE all existing data!
node prisma/seed.js --confirm-destructive
pause
