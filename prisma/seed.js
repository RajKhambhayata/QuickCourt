const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Security check: prevent running in production
if (process.env.NODE_ENV === 'production') {
  console.error('❌ ERROR: Seed script cannot run in production environment');
  console.error('This script is for development purposes only and will destroy all data.');
  process.exit(1);
}

// Security check: require explicit confirmation
const args = process.argv.slice(2);
if (args[0] !== '--confirm-destructive') {
  console.error('❌ ERROR: Seed script requires explicit confirmation');
  console.error('This script will DELETE ALL existing data in the database.');
  console.error('To proceed, run: node prisma/seed.js --confirm-destructive');
  process.exit(1);
}

function generateSecurePassword() {
  return crypto.randomBytes(16).toString('hex').slice(0, 16);
}

async function main() {
  console.log('🧹 Purging all data (reports, reviews, bookings, courts, facilities, users)...');
  console.log('⚠️  WARNING: This is a destructive operation!');

  // Purge all existing data from tables
  await prisma.report.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.blockedSlot.deleteMany();
  await prisma.court.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.user.deleteMany();

  console.log('✨ Database cleared.');

  // Generate secure random passwords
  const adminPassword = generateSecurePassword();
  const ownerPassword = generateSecurePassword();
  const playerPassword = generateSecurePassword();

  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
  const hashedOwnerPassword = await bcrypt.hash(ownerPassword, 10);
  const hashedPlayerPassword = await bcrypt.hash(playerPassword, 10);

  console.log('👤 Initializing 3 accounts with secure random passwords...');

  // 1. Super Admin Account
  const admin = await prisma.user.create({
    data: {
      name: 'Platform Administrator',
      email: 'admin@quickcourt.com',
      password: hashedAdminPassword,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      phone: '+919876543210',
      status: 'ACTIVE',
      isVerified: true,
    },
  });

  // 2. Facility Owner Account
  const owner = await prisma.user.create({
    data: {
      name: 'Facility Owner',
      email: 'owner@quickcourt.com',
      password: hashedOwnerPassword,
      role: 'OWNER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      phone: '+919845011223',
      status: 'ACTIVE',
      isVerified: true,
    },
  });

  // 3. Player / Customer Account
  const player = await prisma.user.create({
    data: {
      name: 'Sports Player',
      email: 'player@quickcourt.com',
      password: hashedPlayerPassword,
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      phone: '+919742055667',
      status: 'ACTIVE',
      isVerified: true,
    },
  });

  console.log('✅ Created 3 accounts with secure random passwords:');
  console.log('   ===============================================');
  console.log('   1. Super Admin  -> admin@quickcourt.com   |', adminPassword);
  console.log('   2. Facility Owner -> owner@quickcourt.com  |', ownerPassword);
  console.log('   3. Player / User  -> player@quickcourt.com |', playerPassword);
  console.log('   ===============================================');
  console.log('⚠️  IMPORTANT: Save these passwords securely. They will not be shown again.');
  console.log('🚀 Ready for you to add real facilities, courts, and bookings!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
