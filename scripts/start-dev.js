/**
 * scripts/start-dev.js
 *
 * Starts the Next.js dev server and prints the 3 portal access links
 * in the terminal. Run via: npm run dev
 */

'use strict';

const { spawn } = require('child_process');

/* ─── Banner ──────────────────────────────────────────────────────── */
console.log('');
console.log('\x1b[36m╔══════════════════════════════════════════════╗\x1b[0m');
console.log('\x1b[36m║       QuickCourt  ·  Development Server       ║\x1b[0m');
console.log('\x1b[36m╚══════════════════════════════════════════════╝\x1b[0m');
console.log('');
console.log('  \x1b[1mPortal Login Links:\x1b[0m');
console.log('');
console.log('  \x1b[35m[ADMIN] \x1b[0m  \x1b[4mhttp://localhost:3000/admin/login\x1b[0m');
console.log('  \x1b[32m[OWNER] \x1b[0m  \x1b[4mhttp://localhost:3000/owner/login\x1b[0m');
console.log('  \x1b[34m[USER]  \x1b[0m  \x1b[4mhttp://localhost:3000/player/login\x1b[0m');
console.log('');
console.log('\x1b[36m──────────────────────────────────────────────\x1b[0m');
console.log('\x1b[33m  Starting Next.js …\x1b[0m');
console.log('\x1b[36m──────────────────────────────────────────────\x1b[0m');
console.log('');

/* ─── Start Next.js dev server ────────────────────────────────────── */
const nextBin = require.resolve('next/dist/bin/next');
const child = spawn(process.execPath, [nextBin, 'dev'], {
  stdio: 'inherit',
  cwd: process.cwd(),
});

child.on('close', (code) => process.exit(code || 0));
process.on('SIGINT',  () => { child.kill('SIGINT');  process.exit(0); });
process.on('SIGTERM', () => { child.kill('SIGTERM'); process.exit(0); });
