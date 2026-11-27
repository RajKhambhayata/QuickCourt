# QuickCourt ⚡

**QuickCourt: A Full-Stack Sports Venue, Turf & Go-Karting Booking Platform**

**QuickCourt** is a modern, full-stack sports facility discovery, court reservation, and gamified engagement platform built with Next.js 14 (App Router), React 18, TypeScript, Prisma ORM 5, PostgreSQL (Supabase), and Tailwind CSS. It provides end-to-end management for players, venue owners, and platform administrators.

---

## 👥 Team Members (B.Tech CSE — Semester VII, Division A, JG University)

| Sr. No. | Student Name | Enrolment Number |
| :---: | :--- | :---: |
| 1 | Bharagavi Chaudhary | 2301441004 |
| 2 | Jainisha Desai | 2401442033 |
| 3 | Raj Khambhayata | 2401442040 |
| 4 | Jesal Mistry | 2401442044 |
| 5 | Vaibhavi Gohel | 2401542018 |

- **Project Guide:** Brijesh Sir (Professor, Department of Computer Science and Engineering)

---

## 🌟 Features

- **Multi-Role Portals & Three-Layer RBAC**:
  - **Player Portal (`/player`, `/venues`)**: Discover venues with multi-facet filters, view live hourly availability, reserve courts with atomic overlap prevention, join waitlists, apply coupons/Court Coins, and manage bookings.
  - **Owner Portal (`/owner`)**: Register venues, configure courts/pitches/heats, set operating hours, block maintenance slots, and monitor real-time revenue & occupancy KPIs.
  - **Admin Portal (`/admin`)**: Owner and facility approval workflows, user moderation, abuse report resolution, and immutable audit log inspection.
- **Go-Karting & Championship Standings (`/karting`)**: Seat-capacity heat scheduling, millisecond lap records, and F1-style seasonal leaderboards.
- **Arcade Mini-Games, Loyalty Wallet & Food Court (`/games`, `/rewards`, `/food-court`)**: Smash Rally (with server-side tap-log anti-cheat verification), Daily Wheel, Scratch Card, Trivia, daily play streaks, Court Coins wallet, and partner food-court coupon redemptions.
- **Robust Security**: Role-based access control (Edge HMAC-SHA256 JWT middleware + shared `createApiPipeline` + client `useAuth` guards), `bcryptjs` password hashing, rate-limited 6-digit OTP verification, and Zod schema validation.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (`14.2.18`, App Router, Server & Client Components, Route Handlers, Edge Middleware)
- **Language & UI**: TypeScript `5.6.3`, React `18.3.1`, [Tailwind CSS](https://tailwindcss.com/) `3.4.15`
- **Database & ORM**: [Prisma](https://www.prisma.io/) `5.22.0` with PostgreSQL (Supabase / `pg`)
- **Validation & Security**: [Zod](https://zod.dev/) `4.6.5`, `jsonwebtoken`, `bcryptjs`
- **Icons & Charts**: [Lucide React](https://lucide.dev/), [Recharts](https://recharts.org/)
- **Testing**: [Vitest](https://vitest.dev/) `5.0.3` (Unit, API & RBAC Integration), [Playwright](https://playwright.dev/) `1.64.0` (End-to-End)

---

## 🚀 Steps to Run the Project

### 1. Prerequisites
- Node.js (v18.17+ or v20+)
- `pnpm` (recommended) or `npm`
- PostgreSQL / Supabase database connection string

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/RajKhambhayata/QuickCourt.git
cd QuickCourt

# Install dependencies
pnpm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` and configure your credentials:
```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://user:password@host:5432/quickcourt"
DIRECT_URL="postgresql://user:password@host:5432/quickcourt"
JWT_SECRET="your-secure-jwt-secret"
ADMIN_SECRET_KEY="your-admin-secret-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup
```bash
# Generate Prisma client and push schema to PostgreSQL
pnpm prisma:generate
pnpm prisma:push

# (Optional, development only) Seed initial sample data
pnpm prisma:seed
```

### 5. Running the Application & Tests
```bash
# Start development server
pnpm dev

# Run unit, API, and RBAC integration tests
pnpm test

# Run Playwright end-to-end tests
pnpm test:e2e
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📁 Project Structure

```text
src/
├── app/                  # Next.js App Router (pages and API routes)
│   ├── api/              # API Route Handlers (auth, bookings, venues, coupons, etc.)
│   ├── (auth)/           # Authentication pages
│   ├── player/           # Player dashboard & booking flows
│   ├── owner/            # Venue owner portal
│   └── admin/            # Administrator panel
├── components/           # Shared UI components
├── lib/                  # Database clients, utility helpers, auth libraries
└── modules/              # Core business logic and schemas
```

---

## 📄 License

This project is licensed under the MIT License.
