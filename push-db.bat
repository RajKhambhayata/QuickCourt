@echo off
set PATH=C:\Users\rajkh\AppData\Local\OpenAI\Codex\runtimes\cua_node\cd454f7c85348168\bin;%PATH%
echo Pushing schema tables to database...
npx prisma db push
pause
