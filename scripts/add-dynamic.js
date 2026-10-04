/**
 * add-dynamic.js
 * Prepends `export const dynamic = 'force-dynamic';` to every API route
 * that calls getCurrentUser() but doesn't already have the export.
 * Run with: node scripts/add-dynamic.js
 */

const fs = require('fs');
const path = require('path');

const DYNAMIC_EXPORT = "export const dynamic = 'force-dynamic';\n\n";

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(fullPath));
    } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
      results.push(fullPath);
    }
  }
  return results;
}

const apiDir = path.join(__dirname, '..', 'src', 'app', 'api');
const routes = walk(apiDir);

let patched = 0;
let skipped = 0;

for (const file of routes) {
  const content = fs.readFileSync(file, 'utf-8');
  const needsDynamic = content.includes('getCurrentUser') || content.includes("requireRole") || content.includes('cookies(');
  const alreadyHas = content.includes("force-dynamic");

  if (needsDynamic && !alreadyHas) {
    fs.writeFileSync(file, DYNAMIC_EXPORT + content, 'utf-8');
    console.log(`  ✓ Patched: ${path.relative(process.cwd(), file)}`);
    patched++;
  } else {
    skipped++;
  }
}

console.log(`\nDone. Patched ${patched} files, skipped ${skipped}.`);
