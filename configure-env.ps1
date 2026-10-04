Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Environment Configuration Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will help you configure your .env file for Supabase."
Write-Host ""
Write-Host "Please enter your Supabase Database Password:"
Write-Host "(You can find this at: https://supabase.com/dashboard/project/jnrvgijliksjohvkwkgg/settings/database)"
Write-Host ""

$dbPassword = Read-Host "Database Password"

Write-Host ""
Write-Host "Generating secure secrets..." -ForegroundColor Yellow

$rand = Get-Random -Minimum 100000 -Maximum 999999
$jwtSecret = "jwt-secret-$rand-change-in-production"
$rand2 = Get-Random -Minimum 100000 -Maximum 999999
$otpSecret = "otp-secret-$rand2-change-in-production"
$rand3 = Get-Random -Minimum 100000 -Maximum 999999
$adminSecret = "admin-secret-$rand3-keep-secure"

Write-Host ""
Write-Host "Creating .env file..." -ForegroundColor Yellow

$envContent = @"
# Supabase PostgreSQL Database
DATABASE_URL="postgresql://postgres.jnrvgijliksjohvkwkgg:$dbPassword@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"

# Security Secrets
JWT_SECRET="$jwtSecret"
OTP_SECRET="$otpSecret"
ADMIN_SECRET_KEY="$adminSecret"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
"@

$envContent | Out-File -FilePath ".env" -Encoding utf8

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  .env file created successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your secrets have been generated securely."
Write-Host "Keep this file private and never commit it to git."
Write-Host ""
Write-Host "Next step: Run .\setup-supabase.ps1 to initialize your database"
Write-Host ""
