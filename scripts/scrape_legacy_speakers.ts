import { chromium } from 'playwright';
import * as fs from 'fs';
import * as url from 'url';


async function run() {
    console.log('🚀 Starting Legacy Speakers Extraction (DOM Parser v2)...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('1️⃣ Navigating to login...');
    await page.goto('https://sales.upgradecrm.ru/login');
    
    if ((await page.locator('input[type="password"]').count()) > 0) {
        console.log('2️⃣ Authenticating...');
        const emailInput = await page.locator('input[type="email"], input[name="email"], input[name="login"]').first();
        const passInput = await page.locator('input[type="password"], input[name="password"]').first();

        await emailInput.fill('vladislav.shirobokov@gmail.com');
        await passInput.fill('vladislav456');

        await page.click('button[type="submit"], button:has-text("Войти"), button:has-text("Login")');

        console.log('⏳ Waiting for dashboard to load...');
        await page.waitForTimeout(5000);
    }

    console.log('3️⃣ Navigating to the Target Program Page...');
    // We go to a single event for now (ID: 16)
    await page.goto('https://sales.upgradecrm.ru/dashboard/program/event/16#conference-id-92');
    
    console.log('⏳ Waiting for Vue to mount the Grid...');
    await page.waitForTimeout(5000); 

    console.log('4️⃣ Extracting Speakers directly from DOM tooltips...');
    
    const speakers = await page.evaluate(() => {
        const results: any[] = [];
        
        // Find all rows representing a speaker block
        // They typically have the contact icons `.bi-telephone-fill`, etc.
        const contactContainers = document.querySelectorAll('.hstack.ms-auto.gap-3');
        
        contactContainers.forEach(container => {
            // Find the closest parent row
            const row = container.closest('.row, .speaker-row') || container.parentElement?.parentElement;
            if (!row) return;

            // Extract Name
            const nameEl = row.querySelector('.fw-medium');
            let nameText = nameEl ? (nameEl.textContent || '').trim() : '';
            if (nameText.endsWith(',')) nameText = nameText.slice(0, -1);
            
            // Extract Job/Company
            let detailsText = '';
            if (nameEl && nameEl.nextSibling) {
                detailsText = (nameEl.nextSibling.textContent || '').trim();
            }

            // Fallback for names if not found in fw-medium
            if (!nameText && row.textContent) {
                 // skip empty generic rows
                 return;
            }

            // Extract Contacts
            const phoneEl = container.querySelector('.bi-telephone-fill');
            const emailEl = container.querySelector('.bi-envelope-at-fill');
            const tgEl = container.querySelector('.bi-telegram');

            const phone = phoneEl ? phoneEl.getAttribute('title') : null;
            const email = emailEl ? emailEl.getAttribute('title') : null;
            const telegram = tgEl ? tgEl.getAttribute('title') : null;
            
            // Split name into First Last
            const nameParts = nameText.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ');

            // Validation: Only keep objects that look like speakers and have some contact info
            if (nameText && (phone || email || telegram)) {
                results.push({
                    name: firstName,
                    surname: lastName,
                    details: detailsText, // Can contain job title / company combined
                    phone: phone,
                    email: email,
                    telegram: telegram
                });
            }
        });
        
        return results;
    });

    console.log(`✅ Extracted ${speakers.length} usable speakers.`);
    
    // Deduplication by email or name+surname
    const unique = new Map();
    speakers.forEach(s => {
        const key = s.email ? s.email.toLowerCase() : `${s.name} ${s.surname}`.toLowerCase();
        if(!unique.has(key)) {
            unique.set(key, s);
        } else {
            // Merge contact info if missing
            const ex = unique.get(key);
            if (!ex.phone && s.phone) ex.phone = s.phone;
            if (!ex.telegram && s.telegram) ex.telegram = s.telegram;
        }
    });

    const finalSpeakers = Array.from(unique.values());
    console.log(`🧹 After deduplication: ${finalSpeakers.length} unique speakers.`);

    const outPath = 'scripts/scraped_speakers.json';
    fs.writeFileSync(outPath, JSON.stringify(finalSpeakers, null, 2));
    console.log(`💾 Saved to ${outPath}`);

    await browser.close();
}

run().catch(console.error);
