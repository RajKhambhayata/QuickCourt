const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    console.log('\n📊 Checking facilities...');
    const totalFacilities = await prisma.facility.count();
    console.log(`Total facilities: ${totalFacilities}`);

    const approvedFacilities = await prisma.facility.count({ where: { status: 'APPROVED' } });
    console.log(`Approved facilities: ${approvedFacilities}`);

    const pendingFacilities = await prisma.facility.count({ where: { status: 'PENDING' } });
    console.log(`Pending facilities: ${pendingFacilities}`);

    const rejectedFacilities = await prisma.facility.count({ where: { status: 'REJECTED' } });
    console.log(`Rejected facilities: ${rejectedFacilities}`);

    if (approvedFacilities > 0) {
      console.log('\n📋 Sample approved facility:');
      const sample = await prisma.facility.findFirst({
        where: { status: 'APPROVED' },
        include: { courts: true }
      });
      console.log(JSON.stringify(sample, null, 2));
    }

    console.log('\n👥 Checking users...');
    const totalUsers = await prisma.user.count();
    console.log(`Total users: ${totalUsers}`);

    const admins = await prisma.user.count({ where: { role: 'ADMIN' } });
    console.log(`Admins: ${admins}`);

    const owners = await prisma.user.count({ where: { role: 'OWNER' } });
    console.log(`Owners: ${owners}`);

    const players = await prisma.user.count({ where: { role: 'USER' } });
    console.log(`Players: ${players}`);

  } catch (error) {
    console.error('❌ Database check failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
