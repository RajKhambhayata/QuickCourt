Clear-Host
Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       QuickCourt  ·  Development Server       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Portal Login Links:" -ForegroundColor White
Write-Host ""
Write-Host "  [ADMIN] " -ForegroundColor Magenta -NoNewline
Write-Host "  http://localhost:3000/admin/login"
Write-Host "  [OWNER] " -ForegroundColor Green -NoNewline
Write-Host "  http://localhost:3000/owner/login"
Write-Host "  [USER]  " -ForegroundColor Blue -NoNewline
Write-Host "  http://localhost:3000/player/login"
Write-Host ""
Write-Host "──────────────────────────────────────────────" -ForegroundColor Cyan
Write-Host "  Starting Next.js …" -ForegroundColor Yellow
Write-Host "──────────────────────────────────────────────" -ForegroundColor Cyan
Write-Host ""

npm run dev
