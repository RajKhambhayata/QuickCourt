Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Supabase Database Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Checking for .env file..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file with your Supabase credentials."
    Write-Host "Run .\configure-env.ps1 first."
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Found .env file" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Generating Prisma Client..." -ForegroundColor Yellow
npm run prisma:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to generate Prisma client" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Prisma client generated successfully" -ForegroundColor Green
Write-Host ""

Write-Host "Step 3: Pushing schema to Supabase..." -ForegroundColor Yellow
npm run prisma:push
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to push schema to Supabase" -ForegroundColor Red
    Write-Host "Please check your DATABASE_URL in .env file"
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Schema pushed to Supabase successfully" -ForegroundColor Green
Write-Host ""

Write-Host "Step 4: Seeding database with test accounts..." -ForegroundColor Yellow
npm run prisma:seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to seed database" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Save the passwords displayed above!" -ForegroundColor Yellow
Write-Host "They will not be shown again."
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start dev server: .\dev.ps1"
Write-Host "2. Test login at:"
Write-Host "   - Admin:   http://localhost:3000/admin/login"
Write-Host "   - Owner:   http://localhost:3000/owner/login"
Write-Host "   - Player:  http://localhost:3000/player/login"
Write-Host ""
Read-Host "Press Enter to continue"
