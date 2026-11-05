#!/usr/bin/env node
/**
 * Fails the build if any page's og:image points at a file that wasn't built.
 * A missing image is silent otherwise: the page works, and only shared links
 * look broken.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = ['.vercel/output/static', 'dist/client', 'dist'].find((dir) =>
  fs.existsSync(path.join(dir, 'index.html'))
);
if (!root) {
  console.error('No build output found. Run the build first.');
  process.exit(1);
}

const pages = fs
  .readdirSync(root, { recursive: true })
  .map(String)
  // The 404 page is never shared, and its URL isn't a real page
  .filter((file) => file.endsWith('.html') && path.basename(file) !== '404.html');

const missing = [];
for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  const image = html.match(/property="og:image" content="([^"]+)"/)?.[1];
  if (!image) {
    missing.push(`${page}: no og:image`);
    continue;
  }
  const { pathname } = new URL(image, 'https://example.com');
  if (!fs.existsSync(path.join(root, decodeURIComponent(pathname)))) {
    missing.push(`${page}: ${pathname}`);
  }
}

if (missing.length) {
  console.error(`Missing social images:\n${missing.map((line) => `  ${line}`).join('\n')}`);
  process.exit(1);
}
process.stdout.write(`Social images OK on ${pages.length} pages.\n`);
