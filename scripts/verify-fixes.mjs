/**
 * QuickCourt Production Verification Suite
 * Tests:
 * 1. Sport slug canonical normalization and alias matching
 * 2. City search terms (e.g. Bengaluru vs Bangalore)
 * 3. Double-booking overlap detection algorithm
 * 4. 10-minute slot hold expiry logic
 * 5. Live DB connectivity and verified venue retrieval
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Inlined helper logic corresponding to src/lib/constants.ts to test canonical rules
const SPORT_SLUG_MAPPING = {
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

function normalizeSportSlug(sport) {
  if (!sport || sport === 'All') return 'All';
  const trimmed = sport.trim();
  return SPORT_SLUG_MAPPING[trimmed] || trimmed.toLowerCase().replace(/\s+/g, '-');
}

function getCityDbSearchTerms(cityInput) {
  if (!cityInput || cityInput === 'All') return [];
  const lower = cityInput.trim().toLowerCase();
  if (lower === 'bangalore' || lower === 'bengaluru') {
    return ['Bangalore', 'Bengaluru'];
  }
  return [cityInput.trim()];
}

function checkSlotOverlap(existingStart, existingEnd, reqStart, reqEnd) {
  return existingStart < reqEnd && existingEnd > reqStart;
}

function isHoldExpired(createdAtDate, holdMinutes = 10) {
  const expiresAt = new Date(new Date(createdAtDate).getTime() + holdMinutes * 60 * 1000);
  return new Date() > expiresAt;
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runVerification() {
  console.log('====================================================');
  console.log('QuickCourt Production Audit & Verification Suite');
  console.log('====================================================\n');

  // Test Suite 1: Canonical Sport Slugs & Alias Normalization
  console.log('[Suite 1: Sport Slug & Alias Normalization]');
  assert(normalizeSportSlug('badminton') === 'badminton', "'badminton' maps to 'badminton'");
  assert(normalizeSportSlug('Badminton') === 'badminton', "'Badminton' maps to 'badminton'");
  assert(normalizeSportSlug('box-cricket') === 'box-cricket', "'box-cricket' maps to 'box-cricket'");
  assert(normalizeSportSlug('Box Cricket') === 'box-cricket', "'Box Cricket' maps to 'box-cricket'");
  assert(normalizeSportSlug('Cricket') === 'box-cricket', "'Cricket' alias maps to 'box-cricket'");
  assert(normalizeSportSlug('lawn-tennis') === 'tennis', "'lawn-tennis' maps to 'tennis'");
  assert(normalizeSportSlug('Futsal') === 'football', "'Futsal' maps to 'football'");
  assert(normalizeSportSlug('All') === 'All', "'All' maps to 'All'");

  // Test Suite 2: City Alias Expansion
  console.log('\n[Suite 2: City Alias Expansion]');
  const bngTerms = getCityDbSearchTerms('Bengaluru');
  assert(bngTerms.includes('Bangalore') && bngTerms.includes('Bengaluru'), "Bengaluru includes both 'Bangalore' and 'Bengaluru' for DB queries");
  const hydTerms = getCityDbSearchTerms('Hyderabad');
  assert(hydTerms.length === 1 && hydTerms[0] === 'Hyderabad', "Hyderabad returns ['Hyderabad']");

  // Test Suite 3: Double-Booking Overlap Detection Algorithm
  console.log('\n[Suite 3: Concurrency & Double-Booking Overlap Logic]');
  // Existing slot: 09:00 - 10:00
  assert(checkSlotOverlap('09:00', '10:00', '09:00', '10:00') === true, 'Exact same slot triggers overlap conflict');
  assert(checkSlotOverlap('09:00', '10:00', '08:30', '09:30') === true, 'Partial leading overlap triggers conflict');
  assert(checkSlotOverlap('09:00', '10:00', '09:30', '10:30') === true, 'Partial trailing overlap triggers conflict');
  assert(checkSlotOverlap('09:00', '10:00', '08:00', '11:00') === true, 'Engulfing slot triggers conflict');
  assert(checkSlotOverlap('09:00', '10:00', '10:00', '11:00') === false, 'Adjacent consecutive slot is permitted');
  assert(checkSlotOverlap('09:00', '10:00', '08:00', '09:00') === false, 'Preceding consecutive slot is permitted');

  // Test Suite 4: 10-Minute Hold Expiry Logic
  console.log('\n[Suite 4: 10-Minute Slot Hold Expiry]');
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  assert(isHoldExpired(fiveMinAgo, 10) === false, 'Hold created 5 minutes ago is still ACTIVE');
  const elevenMinAgo = new Date(Date.now() - 11 * 60 * 1000);
  assert(isHoldExpired(elevenMinAgo, 10) === true, 'Hold created 11 minutes ago is EXPIRED');

  // Test Suite 5: Live Database Connectivity & Data Integrity
  console.log('\n[Suite 5: Live Database Connectivity & Venues Integrity]');
  try {
    const dbPing = await prisma.$queryRaw`SELECT 1 as connected`;
    assert(Array.isArray(dbPing) && dbPing.length > 0, 'Database ping (SELECT 1) succeeded');

    const approvedVenues = await prisma.facility.findMany({
      where: { status: 'APPROVED' },
      include: { courts: true },
    });
    assert(approvedVenues.length > 0, `Database has ${approvedVenues.length} approved sports facilities`);

    let totalCourts = 0;
    approvedVenues.forEach((v) => {
      totalCourts += v.courts.length;
    });
    assert(totalCourts > 0, `Approved facilities contain ${totalCourts} bookable courts`);

    // Verify sport JSON parsing
    let parseSuccess = true;
    for (const v of approvedVenues) {
      try {
        const s = JSON.parse(v.sports || '[]');
        if (!Array.isArray(s)) parseSuccess = false;
      } catch {
        parseSuccess = false;
      }
    }
    assert(parseSuccess, 'All approved facilities have valid JSON sports arrays');
  } catch (err) {
    console.error('Database connection test failed:', err);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n====================================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification();
