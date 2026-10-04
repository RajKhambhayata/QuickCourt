const fs = require('fs');
const files = [
  'src/app/api/games/spin/route.ts',
  'src/app/api/owner/courts/route.ts',
  'src/app/api/owner/facilities/route.ts',
  'src/app/api/owner/slots/block/route.ts',
  'src/app/api/owner/stats/route.ts',
  'src/app/api/partner/route.ts',
  'src/app/api/rewards/summary/route.ts',
  'src/app/api/karting/heats/route.ts',
  'src/app/api/venues/[id]/route.ts',
];
files.forEach(f => {
  try {
    const c = fs.readFileSync(f, 'utf-8');
    const has = c.includes('force-dynamic');
    console.log((has ? 'OK  ' : 'MISS') + ' ' + f);
  } catch(e) {
    console.log('ERR  ' + f + ' ' + e.message);
  }
});
