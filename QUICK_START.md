# Quick Start Guide

## For PowerShell Users

Since PowerShell has script execution restrictions by default, use the `.bat` files which work in both PowerShell and CMD:

### Step 1: Configure Environment
```powershell
.\configure-env.bat
```
This will ask for your Supabase database password and create the `.env` file.

### Step 2: Setup Supabase Database
```powershell
.\setup-supabase.bat
```
This will:
- Generate Prisma client
- Push schema to Supabase
- Seed database with test accounts (admin, owner, player)
- **Save the generated passwords!**

### Step 3: Start Dev Server
```powershell
.\dev.bat
```
This will show the 3 portal links and start the server.

## Portal Links

Once the server is running, access the portals at:

- **Admin**:   http://localhost:3000/admin/login
- **Owner**:   http://localhost:3000/owner/login
- **Player**:  http://localhost:3000/player/login

## Test Accounts

After running `setup-supabase.bat`, you'll have 3 test accounts:

- **Admin**:   admin@quickcourt.com
- **Owner**:   owner@quickcourt.com
- **Player**:  player@quickcourt.com

Use the passwords displayed during the seed process.

## Enable PowerShell Scripts (Optional)

If you prefer to use PowerShell scripts, you can enable them temporarily:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Then you can use:
- `.\configure-env.ps1`
- `.\setup-supabase.ps1`
- `.\dev.ps1`

Note: This only affects the current PowerShell session.
