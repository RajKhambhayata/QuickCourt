export const sports = ['Badminton', 'Cricket', 'Football', 'Tennis', 'Pickleball', 'Go-Karting'] as const;

export type SportType = typeof sports[number];

export interface VenueData {
  id: string;
  name: string;
  area: string;
  city: string;
  sports: string[];
  price: number;
  rating: number;
  reviews: number;
  tag: string;
  image: string;
  surface: string;
  courts: number;
  amenities: string[];
  description: string;
}

export const venues: VenueData[] = [
  {
    id: 'smash',
    name: 'Smash Arena',
    area: 'Koramangala',
    city: 'Bengaluru',
    sports: ['Badminton', 'Pickleball', 'Tennis'],
    price: 600,
    rating: 4.8,
    reviews: 234,
    tag: 'Club favourite',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1000&q=85',
    surface: 'Synthetic court',
    courts: 4,
    amenities: ['Showers', 'Parking', 'Cafe', 'Equipment rental'],
    description: 'A considered, light-filled racquet club for early starts and after-work rallies.'
  },
  {
    id: 'turf',
    name: 'The Turf Club',
    area: 'HSR Layout',
    city: 'Bengaluru',
    sports: ['Football', 'Cricket'],
    price: 1200,
    rating: 4.7,
    reviews: 182,
    tag: 'Great for groups',
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1000&q=85',
    surface: 'Natural grass',
    courts: 2,
    amenities: ['Floodlights', 'Parking', 'Changing rooms'],
    description: 'Open skies, clean lines and enough room to make a proper match of it.'
  },
  {
    id: 'racket',
    name: 'Racket Empire',
    area: 'Indiranagar',
    city: 'Bengaluru',
    sports: ['Badminton', 'Tennis'],
    price: 700,
    rating: 4.6,
    reviews: 141,
    tag: 'New on QuickCourt',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1000&q=85',
    surface: 'Hard court',
    courts: 3,
    amenities: ['Parking', 'Pro shop', 'Water station'],
    description: 'Well-kept courts, a welcoming front desk and a little friendly competition.'
  },
  {
    id: 'velocity',
    name: 'Velocity Go-Karting',
    area: 'Whitefield',
    city: 'Bengaluru',
    sports: ['Go-Karting'],
    price: 1500,
    rating: 4.9,
    reviews: 96,
    tag: 'Weekend pick',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1000&q=85',
    surface: 'Outdoor track',
    courts: 1,
    amenities: ['Helmet included', 'Cafe', 'Parking'],
    description: 'A fast, well-run track for first-timers, friendly rivalries and personal bests.'
  },
  {
    id: 'baseline',
    name: 'Baseline Courts',
    area: 'Jubilee Hills',
    city: 'Hyderabad',
    sports: ['Tennis', 'Pickleball'],
    price: 850,
    rating: 4.7,
    reviews: 118,
    tag: 'Quiet mornings',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1000&q=85',
    surface: 'Acrylic hard court',
    courts: 3,
    amenities: ['Showers', 'Parking', 'Coaching'],
    description: 'A neighbourhood court house built around long rallies and better habits.'
  },
  {
    id: 'northside',
    name: 'Northside Cricket Nets',
    area: 'Baner',
    city: 'Pune',
    sports: ['Cricket'],
    price: 500,
    rating: 4.5,
    reviews: 83,
    tag: 'Practice ready',
    image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1000&q=85',
    surface: 'AstroTurf',
    courts: 5,
    amenities: ['Bowling machine', 'Parking', 'Equipment rental'],
    description: 'Book a lane, get your reps in and leave a little better than you arrived.'
  }
];

export interface StarterBooking {
  id: string;
  venue: string;
  court: string;
  date: string;
  time: string;
  amount: number;
  status: string;
  sport: string;
}

export const starterBookings: StarterBooking[] = [
  {
    id: 'QC-2026-AB12CD34',
    venue: 'Smash Arena',
    court: 'Court 1 · Indoor',
    date: '2026-10-16',
    time: '19:00',
    amount: 600,
    status: 'Confirmed',
    sport: 'Badminton'
  },
  {
    id: 'QC-2026-EF56GH78',
    venue: 'The Turf Club',
    court: 'Pitch A',
    date: '2026-10-18',
    time: '17:00',
    amount: 2400,
    status: 'Pending',
    sport: 'Football'
  }
];

export interface FoodOutlet {
  id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  phone?: string;
  image?: string;
  menuItems: { id: string; name: string; price: number; tag?: string }[];
}

export const starterOutlets: FoodOutlet[] = [
  {
    id: 'out_1',
    name: 'CourtSide Brew & Bowls',
    category: 'Healthy Cafe',
    address: 'Smash Arena, Koramangala 4th Block',
    city: 'Bengaluru',
    phone: '+91 98765 43210',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    menuItems: [
      { id: 'm1', name: 'Cold Pressed Recovery Juice', price: 149, tag: 'Bestseller' },
      { id: 'm2', name: 'Grilled Paneer Protein Bowl', price: 229, tag: 'Post-workout' },
      { id: 'm3', name: 'Classic Iced Americano', price: 119 },
      { id: 'm4', name: 'Avocado Toast & Poached Egg', price: 199 },
    ],
  },
  {
    id: 'out_2',
    name: 'Turfside Pizzeria & Shakes',
    category: 'Quick Bites',
    address: 'The Turf Club, 27th Main HSR Layout',
    city: 'Bengaluru',
    phone: '+91 98765 87654',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    menuItems: [
      { id: 'm5', name: 'Wood-fired Margherita Slice', price: 179, tag: 'Match snack' },
      { id: 'm6', name: 'Dark Chocolate Whey Shake', price: 159, tag: 'High Protein' },
      { id: 'm7', name: 'Garlic Herb Breadsticks', price: 129 },
    ],
  },
  {
    id: 'out_3',
    name: 'Racquet Club Grillhouse',
    category: 'Sports Diner',
    address: 'Racket Empire, Indiranagar 100ft Rd',
    city: 'Bengaluru',
    phone: '+91 98765 11223',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    menuItems: [
      { id: 'm8', name: 'Smoked Chicken & Herb Wrap', price: 219, tag: 'Chef pick' },
      { id: 'm9', name: 'Electrolyte Citrus Slush', price: 99 },
      { id: 'm10', name: 'Quinoa & Mediterranean Salad', price: 189 },
    ],
  },
];

export interface KartHeatData {
  id: string;
  trackName: string;
  startTime: string;
  endTime: string;
  pricePerSeat: number;
  capacity: number;
  seatsTaken: number;
  seatsRemaining: number;
  kartClass: 'CADET' | 'SENIOR' | 'PRO';
  isFull: boolean;
  lapRecords: { lapNo: number; timeMs: number; user?: { name: string } }[];
}

export const starterHeats: KartHeatData[] = [
  {
    id: 'heat_101',
    trackName: 'Velocity Grand Prix Track A',
    startTime: '17:00',
    endTime: '17:15',
    pricePerSeat: 750,
    capacity: 10,
    seatsTaken: 4,
    seatsRemaining: 6,
    kartClass: 'SENIOR',
    isFull: false,
    lapRecords: [
      { lapNo: 1, timeMs: 44210, user: { name: 'Arjun K.' } },
      { lapNo: 2, timeMs: 45890, user: { name: 'Vikram S.' } },
    ],
  },
  {
    id: 'heat_102',
    trackName: 'Velocity Grand Prix Track A',
    startTime: '17:30',
    endTime: '17:45',
    pricePerSeat: 850,
    capacity: 10,
    seatsTaken: 8,
    seatsRemaining: 2,
    kartClass: 'PRO',
    isFull: false,
    lapRecords: [
      { lapNo: 1, timeMs: 42150, user: { name: 'Rohan M.' } },
      { lapNo: 2, timeMs: 43020, user: { name: 'Priya D.' } },
    ],
  },
  {
    id: 'heat_103',
    trackName: 'Velocity SuperSprint Indoor',
    startTime: '18:00',
    endTime: '18:15',
    pricePerSeat: 650,
    capacity: 8,
    seatsTaken: 8,
    seatsRemaining: 0,
    kartClass: 'CADET',
    isFull: true,
    lapRecords: [
      { lapNo: 1, timeMs: 48900, user: { name: 'Sameer P.' } },
    ],
  },
];

export interface StandingData {
  rank: number;
  name: string;
  points: number;
  bestLap: string;
  races: number;
  podiums: number;
}

export const starterStandings: StandingData[] = [
  { rank: 1, name: 'Arjun Kumar', points: 148, bestLap: '0:41.820', races: 8, podiums: 7 },
  { rank: 2, name: 'Rohan Mehta', points: 132, bestLap: '0:42.150', races: 8, podiums: 5 },
  { rank: 3, name: 'Priya Deshmukh', points: 115, bestLap: '0:43.020', races: 7, podiums: 4 },
  { rank: 4, name: 'Vikram Sharma', points: 94, bestLap: '0:44.210', races: 6, podiums: 2 },
  { rank: 5, name: 'Neha Reddy', points: 81, bestLap: '0:44.890', races: 6, podiums: 1 },
];

export interface RewardCoupon {
  id: string;
  code: string;
  title: string;
  description: string;
  type: 'DISCOUNT' | 'FOOD_ITEM';
  value: number;
  expiresInDays: number;
  outletName?: string;
}

export const starterCoupons: RewardCoupon[] = [
  {
    id: 'c1',
    code: 'FOOD-SMASH50',
    title: '50% Off CourtSide Juice or Shake',
    description: 'Valid at CourtSide Brew & Bowls on orders above ₹200',
    type: 'FOOD_ITEM',
    value: 50,
    expiresInDays: 14,
    outletName: 'CourtSide Brew & Bowls',
  },
  {
    id: 'c2',
    code: 'COURT-COIN150',
    title: '₹150 Off Any Badminton Court',
    description: 'Instant discount on your next court booking',
    type: 'DISCOUNT',
    value: 150,
    expiresInDays: 7,
  },
];
