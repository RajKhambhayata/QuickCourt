const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🏁 Seeding QuickCourt Engagement, Rewards & Racing data...');

  // 1. Seed Food Court Partners
  const partners = [
    {
      name: 'Circuit Cafe & Grill',
      category: 'Sports Cafe & Grill',
      address: 'Courtside Terrace, 12th Main Road, Indiranagar',
      city: 'Bangalore',
      phone: '+91 98450 11223',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=60',
      menuItems: JSON.stringify([
        { id: 'm1', name: 'Fresh Mint Lime Soda', price: 60, category: 'Beverages', tag: 'Popular' },
        { id: 'm2', name: 'Peri Peri Crispy French Fries', price: 120, category: 'Snacks', tag: 'Crunchy' },
        { id: 'm3', name: 'Herb Grilled Chicken Sandwich', price: 180, category: 'Mains', tag: 'High Protein' },
        { id: 'm4', name: 'Champion Power Combo (Burger + Fries + Beverage)', price: 260, category: 'Combos', tag: 'Best Value' },
      ]),
      offerRules: JSON.stringify({
        minBill: 0,
        acceptedCoupons: ['FOOD_ITEM', 'FIXED', 'PERCENTAGE'],
      }),
      active: true,
    },
    {
      name: 'Green Fuel Smoothie & Protein Bar',
      category: 'Nutrition & Health',
      address: 'Gate 2, Koramangala Sports Arena',
      city: 'Bangalore',
      phone: '+91 98765 44332',
      image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800&auto=format&fit=crop&q=60',
      menuItems: JSON.stringify([
        { id: 'g1', name: 'Electrolyte Coconut Refresher', price: 70, category: 'Beverages', tag: 'Hydration' },
        { id: 'g2', name: 'Whey Protein Berry Blast', price: 160, category: 'Shakes', tag: '30g Protein' },
        { id: 'g3', name: 'Avocado Toast with Roasted Seeds', price: 190, category: 'Healthy Bites', tag: 'Keto Friendly' },
      ]),
      offerRules: JSON.stringify({
        minBill: 0,
        acceptedCoupons: ['FOOD_ITEM', 'FIXED'],
      }),
      active: true,
    },
    {
      name: 'Paddock Pizza & Brews',
      category: 'Casual Dining',
      address: 'Sector 3, HSR Club Road',
      city: 'Bangalore',
      phone: '+91 97112 88990',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=60',
      menuItems: JSON.stringify([
        { id: 'p1', name: 'Iced Lemon Peach Tea', price: 80, category: 'Beverages', tag: 'Chilled' },
        { id: 'p2', name: 'Cheesy Garlic Bread Sticks', price: 140, category: 'Snacks', tag: 'Cheesy' },
        { id: 'p3', name: '10" Farmhouse Woodfired Pizza', price: 340, category: 'Pizza', tag: 'Hand Tossed' },
        { id: 'p4', name: 'Race Day Platter', price: 420, category: 'Combos', tag: 'Feast' },
      ]),
      offerRules: JSON.stringify({
        minBill: 0,
        acceptedCoupons: ['FOOD_ITEM', 'FIXED', 'PERCENTAGE'],
      }),
      active: true,
    },
  ];

  for (const p of partners) {
    const existing = await prisma.partnerOutlet.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.partnerOutlet.create({ data: p });
      console.log(`✅ Created Partner: ${p.name}`);
    }
  }

  // 2. Seed F1 Championship Season
  const existingSeason = await prisma.season.findFirst({ where: { name: 'QuickCourt SuperCup 2026' } });
  let seasonId;
  if (!existingSeason) {
    const season = await prisma.season.create({
      data: {
        name: 'QuickCourt SuperCup 2026',
        sport: 'KARTING',
        startDate: new Date('2026-09-01'),
        pointsRule: 'F1',
        status: 'ACTIVE',
        rounds: JSON.stringify([
          { round: 1, name: 'Bangalore Speed Sprint', track: 'Torq Karting Track', status: 'COMPLETED', winner: 'Vikram "Apex" Rao' },
          { round: 2, name: 'Indiranagar Night Prix', track: 'Circuit X Stadium', status: 'COMPLETED', winner: 'Anya Sharma' },
          { round: 3, name: 'Koramangala Street Heats', track: 'Velocity Arena', status: 'UPCOMING', date: 'Oct 12, 2026' },
          { round: 4, name: 'Whitefield Grand Prix', track: 'Speedsters Park', status: 'UPCOMING', date: 'Nov 02, 2026' },
          { round: 5, name: 'SuperCup Championship Finale', track: 'International Kartway', status: 'UPCOMING', date: 'Nov 28, 2026' },
        ]),
      },
    });
    seasonId = season.id;
    console.log('✅ Created Season: QuickCourt SuperCup 2026');

    // Create Standings
    const driverStandings = [
      { teamName: 'Redline Scuderia', points: 43, podiums: 2, fastestLaps: 1, rank: 1 },
      { teamName: 'Silver Arrow Racing', points: 37, podiums: 2, fastestLaps: 1, rank: 2 },
      { teamName: 'Apex Predators GP', points: 25, podiums: 1, fastestLaps: 0, rank: 3 },
      { teamName: 'Lightning Veloce', points: 18, podiums: 1, fastestLaps: 0, rank: 4 },
      { teamName: 'Torque Dynamics', points: 12, podiums: 0, fastestLaps: 0, rank: 5 },
    ];

    for (const d of driverStandings) {
      await prisma.standing.create({
        data: {
          seasonId: season.id,
          teamName: d.teamName,
          points: d.points,
          podiums: d.podiums,
          fastestLaps: d.fastestLaps,
          rank: d.rank,
        },
      });
    }
    console.log('✅ Created F1 Season Standings');
  }

  // 3. Seed Karting Heats
  const existingHeats = await prisma.kartHeat.count();
  if (existingHeats === 0) {
    const today = new Date().toISOString().slice(0, 10);
    const heats = [
      { trackName: 'Torq Arena Speed Circuit (Indiranagar)', date: today, startTime: '18:00', endTime: '18:15', capacity: 10, seatsTaken: 6, kartClass: 'ADULT', pricePerSeat: 650 },
      { trackName: 'Torq Arena Speed Circuit (Indiranagar)', date: today, startTime: '18:30', endTime: '18:45', capacity: 10, seatsTaken: 9, kartClass: 'PRO', pricePerSeat: 800 },
      { trackName: 'Torq Arena Speed Circuit (Indiranagar)', date: today, startTime: '19:00', endTime: '19:15', capacity: 10, seatsTaken: 3, kartClass: 'ADULT', pricePerSeat: 650 },
      { trackName: 'Torq Arena Speed Circuit (Indiranagar)', date: today, startTime: '19:30', endTime: '19:45', capacity: 10, seatsTaken: 10, kartClass: 'PRO', pricePerSeat: 800, status: 'FULL' },
      { trackName: 'Velocity Speedway (Koramangala)', date: today, startTime: '20:00', endTime: '20:15', capacity: 12, seatsTaken: 4, kartClass: 'ADULT', pricePerSeat: 700 },
      { trackName: 'Velocity Speedway (Koramangala)', date: today, startTime: '20:30', endTime: '20:45', capacity: 12, seatsTaken: 2, kartClass: 'PRO', pricePerSeat: 850 },
    ];

    for (const h of heats) {
      await prisma.kartHeat.create({ data: h });
    }
    console.log('✅ Seeded 6 Karting Heats');
  }

  console.log('🎉 Rewards, Partner Outlets & Racing seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
