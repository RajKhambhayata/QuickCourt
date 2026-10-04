# Authorization & Role Separation Fix

## Problem Statement

The application had security vulnerabilities where:
1. A logged-in USER (player) could access OWNER features (add facilities)
2. Admin panel was not opening properly
3. Role-based access control was inconsistent between middleware, API, and client-side

## Root Causes

1. **Missing client-side role verification**: Pages loaded data without checking user role first
2. **Incomplete middleware protection**: Player routes weren't covered in middleware
3. **No unauthorized redirect handling**: Users could stay on wrong-role pages

## Solutions Implemented

### 1. Database Migration to Supabase
- Changed Prisma schema from SQLite to PostgreSQL
- Updated `.env.example` with Supabase connection string format
- Added PostgreSQL driver (`pg` package)

### 2. Enhanced Middleware (`src/middleware.ts`)
- Added `/player/:path*` to protected routes
- Ensures all three roles (ADMIN, OWNER, USER) have middleware protection
- Blocks cross-role access at the edge level

### 3. Client-Side Auth Hook (`src/lib/useAuth.ts`)
- Created reusable `useAuth()` hook for fetching current user
- Added `requireRole()` helper for role checking
- Added `redirectIfWrongRole()` for automatic redirects
- Pages now verify role before loading data

### 4. Updated Protected Pages
- **Admin Dashboard** (`src/app/admin/dashboard/page.tsx`):
  - Added role check before loading data
  - Redirects to `/unauthorized` if not ADMIN
- **Owner Facility** (`src/app/owner/facility/page.tsx`):
  - Added role check before loading facilities
  - Only allows OWNER or ADMIN roles

### 5. Unauthorized Page (`src/app/unauthorized/page.tsx`)
- Created dedicated unauthorized access page
- Provides clear messaging and navigation options
- Prevents users from staying on blocked pages

### 6. Setup Automation
- Created `setup-supabase.bat` for easy database setup
- Created `SUPABASE_SETUP.md` with detailed instructions
- Documented all security features

## Security Architecture

### Three-Layer Protection

1. **Middleware Layer** (Edge)
   - Intercepts requests before they reach pages
   - Verifies JWT token
   - Checks role against route requirements
   - Redirects unauthorized users

2. **API Layer** (Server)
   - All API routes use `getCurrentUser()` or `createApiPipeline()`
   - Pipeline enforces role requirements
   - Facility ownership assertions for owners
   - Audit logging for sensitive actions

3. **Client Layer** (Browser)
   - Pages use `useAuth()` hook to fetch current user
   - `requireRole()` checks before loading data
   - Automatic redirect to `/unauthorized` if wrong role
   - Better UX with loading states

## Role Access Matrix

| Route | USER | OWNER | ADMIN |
|-------|------|-------|-------|
| `/venues` | ✅ | ✅ | ✅ |
| `/my-bookings` | ✅ | ❌ | ✅ |
| `/profile` | ✅ | ❌ | ✅ |
| `/owner/dashboard` | ❌ | ✅ | ✅ |
| `/owner/facility` | ❌ | ✅ | ✅ |
| `/owner/courts` | ❌ | ✅ | ✅ |
| `/admin/dashboard` | ❌ | ❌ | ✅ |
| `/admin/owners` | ❌ | ❌ | ✅ |
| `/admin/facilities` | ❌ | ❌ | ✅ |

## Testing Checklist

- [ ] User cannot access owner routes
- [ ] User cannot access admin routes
- [ ] Owner cannot access admin routes
- [ ] Admin can access all routes
- [ ] Logout clears session properly
- [ ] Login with correct role works
- [ ] Unauthorized page displays correctly
- [ ] Middleware redirects work properly

## Files Modified

1. `prisma/schema.prisma` - Changed to PostgreSQL
2. `.env.example` - Added Supabase connection string
3. `src/middleware.ts` - Added player route protection
4. `src/lib/useAuth.ts` - NEW: Auth hook
5. `src/app/admin/dashboard/page.tsx` - Added role check
6. `src/app/owner/facility/page.tsx` - Added role check
7. `src/app/unauthorized/page.tsx` - NEW: Unauthorized page
8. `SUPABASE_SETUP.md` - NEW: Setup guide
9. `setup-supabase.bat` - NEW: Setup script

## Next Steps

1. Update your `.env` file with Supabase credentials
2. Run `setup-supabase.bat` to initialize database
3. Save the generated passwords from seed script
4. Test each role's login and access
5. Verify cross-role access is blocked
