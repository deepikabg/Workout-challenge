// Renders the home-screen icons (192, 512, 180 apple-touch) from the custom kettlebell illustration.
// Usage: node scripts/make-icons.mjs   (needs the preinstalled Playwright)
import { createRequire } from 'node:module';
import { ICONS } from '../src/icons.js';
const { chromium } = createRequire(import.meta.url)('playwright');

const COLORS = { '--ill-ink': '#0f0f0f', '--ill-teal': '#4dd9b8', '--ill-teal-2': '#7de8cc', '--ill-coral': '#e8655a', '--ill-coral-2': '#ef8880', '--ill-cream': '#fef0ef', '--blush': '#f5b5b0' };
const art = ICONS.kettle.replace(/var\((--[a-z0-9-]+)\)/g, (_, v) => COLORS[v]);
const svg = size => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48">
  <rect width="48" height="48" fill="#0a0a0a"/><circle cx="24" cy="24" r="19" fill="#0d3d35"/>
  <g transform="translate(24 24.5) scale(.62) translate(-24 -24)">${art}</g></svg>`;

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [name, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0">${svg(size)}</body></html>`);
  await page.locator('svg').screenshot({ path: `icons/${name}` });
}
await browser.close();
console.log('icons written');
