/**
 * scripts/open-portal.js
 * 
 * Starts the Next.js dev server and automatically opens the specified
 * portal route (e.g. /owner/signup, /admin/signup, /player/signup)
 * in the default browser as soon as the server is ready.
 *
 * Usage: node scripts/open-portal.js [/path]
 */

const { spawn, exec } = require('child_process');
const http = require('http');

const targetPath = process.argv[2] || '/';
const targetUrl = `http://localhost:3000${targetPath}`;

console.log(`\x1b[36m🚀 Starting Next.js dev server...\x1b[0m`);
console.log(`\x1b[35m🎯 Target portal: ${targetUrl}\x1b[0m\n`);

// Resolve Next.js binary directly using Node to ensure it runs on all systems without PATH issues
const nextBin = require.resolve('next/dist/bin/next');
const nextDev = spawn(process.execPath, [nextBin, 'dev'], {
  stdio: 'inherit',
  cwd: process.cwd(),
});

let opened = false;
let checkCount = 0;
const MAX_CHECKS = 60; // 30 seconds

function checkServerReady() {
  if (opened) return;
  checkCount++;

  const req = http.get('http://localhost:3000', (res) => {
    if (!opened) {
      opened = true;
      console.log(`\n\x1b[32m✔ Server is ready! Opening ${targetUrl} in your default browser...\x1b[0m\n`);

      const openCmd =
        process.platform === 'win32'
          ? `start "" "${targetUrl}"`
          : process.platform === 'darwin'
          ? `open "${targetUrl}"`
          : `xdg-open "${targetUrl}"`;

      exec(openCmd, (err) => {
        if (err) {
          console.log(`\x1b[33m⚠️ Could not auto-open browser. Please open: ${targetUrl}\x1b[0m`);
        }
      });
    }
  });

  req.on('error', () => {
    if (checkCount < MAX_CHECKS && !opened) {
      setTimeout(checkServerReady, 500);
    } else if (!opened) {
      console.log(`\x1b[33m⚠️ Dev server taking longer to start. You can open: ${targetUrl}\x1b[0m`);
    }
  });

  req.end();
}

// Start polling after 1s
setTimeout(checkServerReady, 1000);

// Forward termination signals to Next.js child process
process.on('SIGINT', () => {
  nextDev.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  nextDev.kill('SIGTERM');
  process.exit(0);
});

nextDev.on('close', (code) => {
  process.exit(code || 0);
});
