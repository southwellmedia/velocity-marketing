/**
 * Showcase Image Capture Script
 *
 * Captures screenshots of showcase sites and composites them into
 * polished card images with a browser frame, gradient background,
 * rounded corners, and drop shadow.
 *
 * Usage:
 *   pnpm run showcase:capture           # Skip existing images
 *   pnpm run showcase:capture --force   # Regenerate all images
 */

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SHOWCASE_DIR = path.resolve(import.meta.dirname, '../src/content/showcase');
const OUTPUT_DIR = path.resolve(import.meta.dirname, '../src/assets/showcase');

const VIEWPORT = { width: 1280, height: 800 };
const CARD = { width: 1200, height: 900 };
const SCREENSHOT = { width: 1120, height: 700 };
const FRAME = { x: 40, y: 80, width: 1120, height: 780, chromeHeight: 40, radius: 12 };

const force = process.argv.includes('--force');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface ShowcaseEntry {
  slug: string;
  url: string;
  title: string;
}

function loadEntries(): ShowcaseEntry[] {
  const files = fs.readdirSync(SHOWCASE_DIR).filter((f) => f.endsWith('.json'));
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(SHOWCASE_DIR, file), 'utf-8');
    const data = JSON.parse(raw) as { url: string; title: string };
    return { slug: path.basename(file, '.json'), url: data.url, title: data.title };
  });
}

function truncateUrl(url: string, maxLen = 50): string {
  const display = url.replace(/^https?:\/\//, '');
  return display.length > maxLen ? display.slice(0, maxLen) + '...' : display;
}

// ---------------------------------------------------------------------------
// SVG builders
// ---------------------------------------------------------------------------

function buildGradientBg(): Buffer {
  const svg = `<svg width="${CARD.width}" height="${CARD.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18181b"/>
      <stop offset="50%" stop-color="#1f1f23"/>
      <stop offset="100%" stop-color="#18181b"/>
    </linearGradient>
  </defs>
  <rect width="${CARD.width}" height="${CARD.height}" fill="url(#bg)"/>
</svg>`;
  return Buffer.from(svg);
}

function buildDropShadow(): Buffer {
  const svg = `<svg width="${CARD.width}" height="${CARD.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>
  <rect x="${FRAME.x}" y="${FRAME.y}" width="${FRAME.width}" height="${FRAME.height}"
        rx="${FRAME.radius}" ry="${FRAME.radius}"
        fill="#1e1e1e" filter="url(#shadow)"/>
</svg>`;
  return Buffer.from(svg);
}

function buildBrowserFrame(url: string): Buffer {
  const truncated = truncateUrl(url);
  const safeUrl = truncated
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const fx = FRAME.x;
  const fy = FRAME.y;
  const fw = FRAME.width;
  const fh = FRAME.height;
  const r = FRAME.radius;
  const ch = FRAME.chromeHeight;

  const tlY = fy + ch / 2;
  const tlR = 6;

  const barX = fx + 80;
  const barY = fy + 10;
  const barW = fw - 100;
  const barH = 20;
  const barR = 6;

  const svg = `<svg width="${CARD.width}" height="${CARD.height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Frame border -->
  <rect x="${fx}" y="${fy}" width="${fw}" height="${fh}"
        rx="${r}" ry="${r}" fill="none" stroke="#333" stroke-width="1"/>

  <!-- Chrome bar background -->
  <clipPath id="chrome-clip">
    <path d="M${fx + r},${fy} h${fw - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${ch - r} h-${fw} v-${ch - r} a${r},${r} 0 0 1 ${r},-${r}z"/>
  </clipPath>
  <rect x="${fx}" y="${fy}" width="${fw}" height="${ch}" fill="#1e1e1e" clip-path="url(#chrome-clip)"/>

  <!-- Divider line between chrome and content -->
  <line x1="${fx}" y1="${fy + ch}" x2="${fx + fw}" y2="${fy + ch}" stroke="#333" stroke-width="1"/>

  <!-- Traffic lights -->
  <circle cx="${fx + 20}" cy="${tlY}" r="${tlR}" fill="#FF5F57"/>
  <circle cx="${fx + 38}" cy="${tlY}" r="${tlR}" fill="#FEBC2E"/>
  <circle cx="${fx + 56}" cy="${tlY}" r="${tlR}" fill="#28C840"/>

  <!-- URL bar -->
  <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="${barR}" ry="${barR}" fill="#2a2a2a"/>
  <text x="${barX + 12}" y="${barY + 14}" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="#999">${safeUrl}</text>
</svg>`;
  return Buffer.from(svg);
}

// ---------------------------------------------------------------------------
// Composite pipeline
// ---------------------------------------------------------------------------

async function compositeCard(screenshot: Buffer, url: string): Promise<Buffer> {
  const resized = await sharp(screenshot)
    .resize(SCREENSHOT.width, SCREENSHOT.height, { fit: 'cover' })
    .toBuffer();

  const composite = await sharp(buildGradientBg())
    .composite([
      { input: buildDropShadow(), top: 0, left: 0 },
      { input: resized, top: FRAME.y + FRAME.chromeHeight, left: FRAME.x },
      { input: buildBrowserFrame(url), top: 0, left: 0 },
    ])
    .png()
    .toBuffer();

  return composite;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const entries = loadEntries();
  if (entries.length === 0) {
    console.log('No showcase entries found.');
    return;
  }

  // Determine which entries need captures
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const toCapture = entries.filter((entry) => {
    const outPath = path.join(OUTPUT_DIR, `${entry.slug}.png`);
    if (!force && fs.existsSync(outPath)) {
      console.log(`  ✓ ${entry.slug} (exists, skipping)`);
      return false;
    }
    return true;
  });

  if (toCapture.length === 0) {
    console.log('All images up to date. Use --force to regenerate.');
    return;
  }

  console.log(`Capturing ${toCapture.length} showcase site(s)...\n`);

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: VIEWPORT });

  for (const entry of toCapture) {
    const outPath = path.join(OUTPUT_DIR, `${entry.slug}.png`);
    console.log(`  → ${entry.title} (${entry.url})`);

    try {
      const page = await context.newPage();
      await page.goto(entry.url, { waitUntil: 'networkidle', timeout: 30_000 });
      // Allow animations and lazy-loaded content to settle
      await page.waitForTimeout(1000);

      const screenshot = await page.screenshot({ type: 'png' });
      await page.close();

      const card = await compositeCard(screenshot, entry.url);
      fs.writeFileSync(outPath, card);
      console.log(`    ✓ saved ${entry.slug}.png`);
    } catch (err) {
      console.error(`    ✗ failed: ${(err as Error).message}`);
    }
  }

  await browser.close();
  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
