const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const owner = await prisma.user.findUnique({
    where: { email: 'owner@quickcourt.com' },
  });

  if (!owner) {
    console.error('Owner user owner@quickcourt.com not found. Please run seed script first.');
    return;
  }

  console.log('Seeding sample sports facilities and courts for owner:', owner.email);

  const venues = [
    {
      name: 'Indiranagar Arena Club',
      description: 'Premier floodlit multi-sports arena featuring BWF standard wooden badminton courts and ITF certified tennis courts.',
      address: '100 Feet Road, HAL 2nd Stage, Indiranagar',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560038',
      venueType: 'Indoor & Outdoor',
      status: 'APPROVED',
      ownerId: owner.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=60',
      ]),
      sports: JSON.stringify(['Badminton', 'Tennis', 'Pickleball']),
      amenities: JSON.stringify(['Locker Rooms', 'Showers', 'Equipment Rental', 'Pro Shop', 'Parking', 'Cafeteria']),
      courts: [
        { name: 'Badminton Court 1 (Teak Wood)', sportType: 'Badminton', surfaceType: 'Wooden', pricePerHour: 450, operatingStartHour: 6, operatingEndHour: 23 },
        { name: 'Badminton Court 2 (Synthetic Mat)', sportType: 'Badminton', surfaceType: 'Synthetic', pricePerHour: 400, operatingStartHour: 6, operatingEndHour: 23 },
        { name: 'Clay Tennis Court A', sportType: 'Tennis', surfaceType: 'Clay', pricePerHour: 800, operatingStartHour: 6, operatingEndHour: 22 },
        { name: 'Pickleball Arena 1', sportType: 'Pickleball', surfaceType: 'Cushioned Acrylic', pricePerHour: 500, operatingStartHour: 6, operatingEndHour: 23 },
      ],
    },
    {
      name: 'HSR Turf & Sports Hub',
      description: 'FIFA quality astroturf suitable for 5v5 & 7v7 football, plus all-weather enclosed Box Cricket with LED floodlights.',
      address: '27th Main Road, Sector 1, HSR Layout',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560102',
      venueType: 'Outdoor',
      status: 'APPROVED',
      ownerId: owner.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1529900240041-22f1df4d0f11?w=800&auto=format&fit=crop&q=60',
      ]),
      sports: JSON.stringify(['Football', 'Box Cricket']),
      amenities: JSON.stringify(['Floodlights', 'Bibs & Balls Included', 'Changing Rooms', 'Drinking Water', 'Parking']),
      courts: [
        { name: 'FIFA 5v5 AstroTurf Pitch 1', sportType: 'Football', surfaceType: 'Astroturf', pricePerHour: 1200, operatingStartHour: 6, operatingEndHour: 24 },
        { name: 'Box Cricket Arena Alpha', sportType: 'Box Cricket', surfaceType: 'Synthetic Turf', pricePerHour: 900, operatingStartHour: 6, operatingEndHour: 24 },
      ],
    },
    {
      name: 'Koramangala Pro Court',
      description: 'Centrally located sports complex featuring FIBA grade maple wood basketball courts and Olympic standard badminton arenas.',
      address: '80 Feet Road, 4th Block, Koramangala',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560034',
      venueType: 'Indoor',
      status: 'APPROVED',
      ownerId: owner.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=800&auto=format&fit=crop&q=60',
      ]),
      sports: JSON.stringify(['Basketball', 'Badminton', 'Table Tennis']),
      amenities: JSON.stringify(['Air Conditioned', 'Scoreboards', 'Coaching Available', 'Spectator Seating', 'Restrooms']),
      courts: [
        { name: 'FIBA Basketball Court', sportType: 'Basketball', surfaceType: 'Hardwood Maple', pricePerHour: 1400, operatingStartHour: 6, operatingEndHour: 23 },
        { name: 'Badminton Court 1', sportType: 'Badminton', surfaceType: 'Synthetic', pricePerHour: 450, operatingStartHour: 6, operatingEndHour: 23 },
      ],
    },
    {
      name: 'Apex Speed Karting Arena',
      description: 'State-of-the-art 650m asphalt indoor Go-Kart track with electric karts, digital lap timing, and paddock cafe.',
      address: 'Sarjapur Main Road, Near Bellandur Gate',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560103',
      venueType: 'Indoor',
      status: 'APPROVED',
      ownerId: owner.id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=60',
      ]),
      sports: JSON.stringify(['Karting']),
      amenities: JSON.stringify(['Helmets & Suits Provided', 'Telemetry Timing', 'Observation Lounge', 'Paddock Cafe']),
      courts: [
        { name: 'Grand Prix Kart Circuit', sportType: 'Karting', surfaceType: 'Polished Asphalt', pricePerHour: 750, operatingStartHour: 10, operatingEndHour: 23 },
      ],
    },
  ];

  for (const v of venues) {
    const { courts, ...facilityData } = v;
    const facility = await prisma.facility.create({
      data: {
        ...facilityData,
        courts: {
          create: courts,
        },
      },
    });
    console.log(`Created facility: ${facility.name} with ${courts.length} courts`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed venues error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
