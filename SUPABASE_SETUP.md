# Supabase Database Setup Guide

## 1. Get Your Database Password

1. Go to your Supabase project: https://supabase.com/dashboard/project/jnrvgijliksjohvkwkgg
2. Navigate to **Settings** → **Database**
3. Copy your **Database Password** (you may need to reset it if you don't know it)

## 2. Update Your .env File

Update your `.env` file with the Supabase connection string:

```env
DATABASE_URL="postgresql://postgres.jnrvgijliksjohvkwkgg:YOUR-DATABASE-PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
JWT_SECRET="your-secure-jwt-secret-min-32-chars"
OTP_SECRET="your-secure-otp-secret-min-32-chars"
ADMIN_SECRET_KEY="your-secure-admin-secret-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Important:** Replace `YOUR-DATABASE-PASSWORD` with your actual Supabase database password.

## 3. Generate Prisma Client

```bash
npm run prisma:generate
```

## 4. Push Schema to Supabase

```bash
npm run prisma:push
```

This will create all tables in your Supabase PostgreSQL database.

## 5. Seed Database with Test Accounts

```bash
npm run prisma:seed
```

This will create 3 test accounts:
- **Admin**: admin@quickcourt.com (ADMIN role)
- **Owner**: owner@quickcourt.com (OWNER role)
- **Player**: player@quickcourt.com (USER role)

The script will output secure random passwords for each account. **Save these passwords securely.**

## 6. Start Development Server

```bash
npm run dev
```

## 7. Test Each Role

### Admin Login
- URL: http://localhost:3000/admin/login
- Email: admin@quickcourt.com
- Password: (from seed output)
- Should access: /admin/dashboard

### Owner Login
- URL: http://localhost:3000/owner/login
- Email: owner@quickcourt.com
- Password: (from seed output)
- Should access: /owner/dashboard, /owner/facility

### Player Login
- URL: http://localhost:3000/player/login
- Email: player@quickcourt.com
- Password: (from seed output)
- Should access: /venues, /my-bookings, /profile

## Security Features Implemented

✅ **Middleware Protection**: Routes are protected by role at the middleware level
✅ **API Authorization**: All API routes verify user role before processing
✅ **Client-Side Checks**: Pages verify user role before loading data
✅ **Role Separation**: Each role (USER, OWNER, ADMIN) has isolated access
✅ **Unauthorized Page**: Custom unauthorized page for access denied scenarios

## Troubleshooting

### Connection Issues
If you get connection errors:
1. Verify your DATABASE_URL is correct
2. Check that Supabase project is active
3. Ensure you're using the pooler URL (port 6543)

### Admin Panel Not Opening
1. Verify you're logged in as admin@quickcourt.com
2. Check browser console for errors
3. Clear cookies and try logging in again

### Cross-Role Access Issues
If a user can access wrong role pages:
1. Clear browser cookies (cookie name: qc_token)
2. Log out completely
3. Log in with correct role
