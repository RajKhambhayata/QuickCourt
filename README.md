# QuickCourt ⚡

**QuickCourt** is a modern, full-stack sports facility and turf booking platform built with Next.js 14 (App Router), Prisma ORM, and Tailwind CSS. It provides end-to-end management for players, venue owners, and platform administrators.

---

## 🌟 Features

- **Multi-Role Experience**:
  - **Player Portal**: Discover venues, browse courts, book time slots, apply coupons, and manage reservations.
  - **Owner Portal**: Register venues, configure courts/pitches/heats, manage dynamic pricing, and monitor real-time bookings.
  - **Admin Portal**: Complete governance, user audits, venue approval workflows, and system-wide revenue analytics.
- **Dynamic Slot & Activity Management**:
  - Turf booking (Football, Cricket, Badminton, Tennis, etc.)
  - Go-Karting heat scheduling and capacity management
- **Discounts & Coupons**: Flexible promotional coupon validation and application engine.
- **Robust Security**: Role-based access control (RBAC), bcrypt-hashed passwords, JWT authentication, and secure session management.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components, Route Handlers)
- **Database & ORM**: [Prisma](https://www.prisma.io/) with SQLite (configurable to PostgreSQL)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons & Charts**: [Lucide React](https://lucide.dev/), [Recharts](https://recharts.org/)
- **Validation**: [Zod](https://zod.dev/)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18.17+ or v20+)
- npm / pnpm

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/RajKhambhayata/QuickCourt.git
cd QuickCourt

# Install dependencies
npm install
# or
pnpm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` and adjust the variables:
```bash
cp .env.example .env
```

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secure-jwt-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup
```bash
# Push Prisma schema to SQLite
npm run prisma:push

# (Optional) Seed initial data
npm run prisma:seed
```

### 5. Running the Application
```bash
npm run dev
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
