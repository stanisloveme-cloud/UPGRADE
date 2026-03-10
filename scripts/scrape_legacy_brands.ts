import { chromium } from 'playwright';
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'legacy_brands');

async function downloadImage(url: string, prefix: string): Promise<string | null> {
    try {
        if (!url || url.includes('no-image') || url.includes('placeholder')) return null;

        // Ensure uploads dir
        if (!fs.existsSync(UPLOADS_DIR)) {
            fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);

        const buffer = await res.buffer();

        // Determine extension
        const type = res.headers.get('content-type') || '';
        let ext = '.png';
        if (type.includes('svg')) ext = '.svg';
        else if (type.includes('jpeg') || type.includes('jpg')) ext = '.jpg';
        else if (type.includes('webp')) ext = '.webp';

        const filename = `${prefix}_${crypto.randomUUID()}${ext}`;
        const filepath = path.join(UPLOADS_DIR, filename);

        fs.writeFileSync(filepath, buffer);
        console.log(`✅ Downloaded: ${filename}`);

        // The frontend expects the backend to serve it via /uploads/legacy_brands/:filename
        return `/uploads/legacy_brands/${filename}`;
    } catch (e) {
        console.error(`❌ Failed to download image ${url}:`, e.message);
        return null;
    }
}

async function run() {
    console.log('🚀 Starting Legacy Brands Migration Scraper...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {

        console.log('1️⃣ Navigating to Target URL (expecting auth redirect)...');
        await page.goto('https://sales.upgradecrm.ru/dashboard/program/event/16#program-container');
        await page.waitForTimeout(3000);

        console.log('Current URL after redirect:', page.url());

        // Take a screenshot to see what page we are on
        await page.screenshot({ path: 'scraper_debug.png' });
        fs.writeFileSync('scraper_debug.html', await page.content());

        // Attempt login if we are actually on a login page
        if (page.url().includes('login') || (await page.locator('input[type="email"], input[name="email"], input[name="login"]').count()) > 0) {
            console.log('Detected login page, attempting to auth...');
            const emailInput = await page.locator('input[type="email"], input[name="email"], input[name="login"]').first();
            const passInput = await page.locator('input[type="password"], input[name="password"]').first();

            await emailInput.fill('vladislav.shirobokov@gmail.com');
            await passInput.fill('vladislav456');

            await page.click('button[type="submit"], button:has-text("Войти"), button:has-text("Login")');

            console.log('⏳ Waiting for dashboard to load...');
            await page.waitForTimeout(5000);
            await page.goto('https://sales.upgradecrm.ru/dashboard/program/event/16#program-container');
        }

        console.log('⏳ Waiting for dashboard to load...');
        await page.waitForTimeout(5000); // Wait for auth redirect and hydration

        console.log('2️⃣ Navigating to the Target Brands Administration Page (Frontend Dashboard)...');
        await page.goto('https://sales.upgradecrm.ru/dashboard/production/event/16/view-generator/logotypes/list');

        // Wait for brands table to render
        await page.waitForTimeout(5000);

        console.log('📸 Taking post-login snapshot for DOM analysis...');
        await page.screenshot({ path: 'scraper_after_login.png', fullPage: true });
        fs.writeFileSync('scraper_after_login.html', await page.content());

        console.log('📸 Taking post-login snapshot of Brands page...');
        await page.screenshot({ path: 'scraper_brands_admin.png', fullPage: true });
        fs.writeFileSync('scraper_brands_admin.html', await page.content());

        const brands = await page.evaluate(() => {
            const results: any[] = [];

            try {
                const app = document.getElementById('app');
                if (app && app.dataset.page) {
                    const data = JSON.parse(app.dataset.page);
                    if (data.props && data.props.logotypes) {
                        data.props.logotypes.forEach((l: any) => {
                            if (l.brand && l.brand.title) {
                                results.push({
                                    name: l.brand.title,
                                    description: l.brand.d_short || '',
                                    website: l.brand.site ? (l.brand.site.startsWith('http') ? l.brand.site : 'https://' + l.brand.site) : '',
                                    logoUrl: l.brand.logo_path ? `https://storage.yandexcloud.net/brand-logotypes.upgrade.st/${l.brand.logo_path}` : ''
                                });
                            }
                        });
                        return results;
                    }
                }
            } catch (e) {
                console.error('Failed to parse Inertia data:', e);
            }

            // Fallback (should not be needed)
            const rows = document.querySelectorAll('table tbody tr') as any;
            if (rows.length > 0) {
                rows.forEach((row: any) => {
                    const textCols = row.querySelectorAll('td');
                    if (textCols.length > 2) {
                        const name = textCols[2]?.textContent?.trim() || 'Brand';
                        const linkEl = row.querySelector('img');
                        results.push({
                            name,
                            logoUrl: linkEl?.src || '',
                            description: '',
                            website: ''
                        });
                    }
                });
            }
            return results;
        });

        console.log(`📊 Found ${brands.length} legacy brands from the server payload.`);

        // 4️⃣ Download Images and Prepare Final Data
        console.log('4️⃣ Downloading assets...');
        const finalBrands = [];
        let imported = 0;

        for (const brand of brands) {
            if (!brand.name || brand.name === 'Brand' || !brand.logoUrl) continue;

            const localLogoUrl = await downloadImage(brand.logoUrl, 'brand');

            finalBrands.push({
                name: brand.name,
                description: brand.description,
                websiteUrl: brand.website,
                logoFileUrl: localLogoUrl,
                status: 'approved',
                exportToWebsite: true
            });

            console.log(`💾 Processed brand: ${brand.name}`);
            imported++;
        }

        fs.writeFileSync(path.join(__dirname, 'scraped_brands.json'), JSON.stringify(finalBrands, null, 2));

        console.log(`🎉 Scraping complete! Successfully extracted ${imported} brands to scraped_brands.json.`);

    } catch (err) {
        console.error('❌ Scraper failed:', err);
    } finally {
        await browser.close();
    }
}

run();
