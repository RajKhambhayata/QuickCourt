export interface SportDefinition {
  id: string; // Backward compatibility with existing components
  slug: string; // Canonical URL slug (e.g. 'box-cricket')
  name: string; // Display label
  dbNames: string[]; // Strings that may appear in DB JSON array (e.g. ['Box Cricket', 'Cricket'])
  icon: string; // Emoji
  materialIcon: string; // Material symbol icon
  color: string;
}

// Sport slug constants - single source of truth
export const SPORTS_LIST: SportDefinition[] = [
  {
    id: 'Badminton',
    slug: 'badminton',
    name: 'Badminton',
    dbNames: ['Badminton', 'badminton'],
    icon: '🏸',
    materialIcon: 'sports_tennis',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'Box Cricket',
    slug: 'box-cricket',
    name: 'Box Cricket / Turf',
    dbNames: ['Box Cricket', 'Cricket', 'box-cricket'],
    icon: '🏏',
    materialIcon: 'sports_cricket',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'Tennis',
    slug: 'tennis',
    name: 'Lawn Tennis',
    dbNames: ['Tennis', 'Lawn Tennis', 'tennis'],
    icon: '🎾',
    materialIcon: 'sports_tennis',
    color: 'from-lime-500 to-green-600',
  },
  {
    id: 'Pickleball',
    slug: 'pickleball',
    name: 'Pickleball',
    dbNames: ['Pickleball', 'pickleball'],
    icon: '🏓',
    materialIcon: 'sports_baseball',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'Football',
    slug: 'football',
    name: 'Football / Futsal',
    dbNames: ['Football', 'Futsal', 'football'],
    icon: '⚽',
    materialIcon: 'sports_soccer',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'Basketball',
    slug: 'basketball',
    name: 'Basketball',
    dbNames: ['Basketball', 'basketball'],
    icon: '🏀',
    materialIcon: 'sports_basketball',
    color: 'from-rose-500 to-red-600',
  },
  {
    id: 'Table Tennis',
    slug: 'table-tennis',
    name: 'Table Tennis',
    dbNames: ['Table Tennis', 'table-tennis'],
    icon: '🏓',
    materialIcon: 'sports_handball',
    color: 'from-pink-500 to-rose-600',
  },
  {
    id: 'Squash',
    slug: 'squash',
    name: 'Squash',
    dbNames: ['Squash', 'squash'],
    icon: '🎯',
    materialIcon: 'sports_volleyball',
    color: 'from-violet-500 to-purple-600',
  },
];

// Backward compatibility mapping for old URL parameters
export const SPORT_SLUG_MAPPING: Record<string, string> = {
  'Badminton': 'badminton',
  'badminton': 'badminton',
  'Cricket': 'box-cricket',
  'Box Cricket': 'box-cricket',
  'box-cricket': 'box-cricket',
  'box cricket': 'box-cricket',
  'Tennis': 'tennis',
  'tennis': 'tennis',
  'Lawn Tennis': 'tennis',
  'lawn-tennis': 'tennis',
  'Pickleball': 'pickleball',
  'pickleball': 'pickleball',
  'Football': 'football',
  'football': 'football',
  'Futsal': 'football',
  'futsal': 'football',
  'Basketball': 'basketball',
  'basketball': 'basketball',
  'Table Tennis': 'table-tennis',
  'table-tennis': 'table-tennis',
  'Squash': 'squash',
  'squash': 'squash',
};

// Convert old sport name/ID or slug to canonical slug
export function normalizeSportSlug(sport: string | null | undefined): string {
  if (!sport || sport === 'All') return 'All';
  const trimmed = sport.trim();
  return SPORT_SLUG_MAPPING[trimmed] || trimmed.toLowerCase().replace(/\s+/g, '-');
}

// Get all DB search strings for a sport (handles aliases like Cricket -> Box Cricket)
export function getSportDbSearchTerms(sportInput: string | null | undefined): string[] {
  const slug = normalizeSportSlug(sportInput);
  if (!slug || slug === 'All') return [];
  const found = SPORTS_LIST.find((s) => s.slug === slug);
  if (found) return found.dbNames;
  return [slug];
}

// Get sport display name from slug or ID
export function getSportName(slugOrId: string | null | undefined): string {
  if (!slugOrId || slugOrId === 'All') return 'All Sports';
  const slug = normalizeSportSlug(slugOrId);
  const sport = SPORTS_LIST.find((s) => s.slug === slug || s.id === slugOrId);
  return sport?.name || slugOrId;
}

// City normalization (e.g., Bengaluru vs Bangalore)
export function getCityDbSearchTerms(cityInput: string | null | undefined): string[] {
  if (!cityInput || cityInput === 'All') return [];
  const lower = cityInput.trim().toLowerCase();
  if (lower === 'bangalore' || lower === 'bengaluru') {
    return ['Bangalore', 'Bengaluru'];
  }
  return [cityInput.trim()];
}

export const AMENITIES_LIST = [
  'Floodlights',
  'Free Parking',
  'Changing Rooms',
  'Showers',
  'Equipment Rental',
  'Drinking Water',
  'Air Conditioning',
  'Cafeteria',
  'First Aid',
  'Lockers',
  'Spectator Seating',
  'Coaching Available',
];

export const CITIES_LIST = [
  'Bangalore',
  'Mumbai',
  'Delhi NCR',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Ahmedabad',
  'Kolkata',
];
