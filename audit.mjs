import { chromium } from 'playwright';

const pages = [
  { path: '/', name: 'home' },
  { path: '/products', name: 'products' },
  { path: '/order', name: 'order' },
];

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

const browser = await chromium.launch();
for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  for (const pg of pages) {
    await page.goto(`http://localhost:3000${pg.path}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `/tmp/audit/${vp.name}-${pg.name}.png`, fullPage: true });
    console.log(`captured ${vp.name}-${pg.name}`);
  }
  await ctx.close();
}
await browser.close();
