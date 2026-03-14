const { Client } = require('pg');
const fs = require('fs');

async function run() {
    const client = new Client({
        connectionString: 'postgresql://upgrade_crm:upgrade_pass@devupgrade.space4you.ru:5433/upgrade_crm'
    });
    
    await client.connect();
    console.log("Connected to devupgrade.space4you.ru:5433");
    
    const data = JSON.parse(fs.readFileSync('scripts/scraped_speakers.json', 'utf8'));
    let added = 0;
    let skipped = 0;
    let lastError = null;
    
    for (const ls of data) {
        const email = ls.email ? ls.email.substring(0, 255) : null;
        const phone = ls.phone ? ls.phone.substring(0, 50) : null;
        const fName = ls.name;
        const lName = ls.surname || '';
        const pos = ls.details ? ls.details.substring(0, 255) : null;
        const tg = ls.telegram ? ls.telegram.substring(0, 100) : null;
        
        try {
            const res = await client.query('SELECT id FROM "Speaker" WHERE (email IS NOT NULL AND email = $1) OR (phone IS NOT NULL AND phone = $2) OR (first_name = $3 AND last_name = $4) LIMIT 1', [email, phone, fName, lName]);
            
            if (res.rows.length === 0) {
                await client.query('INSERT INTO "Speaker" (first_name, last_name, position, email, phone, telegram, is_sponsor, has_assistant) VALUES ($1, $2, $3, $4, $5, $6, false, false)', [fName, lName, pos, email, phone, tg]);
                added++;
            } else {
                skipped++;
            }
        } catch (e) {
            lastError = e;
        }
    }
    
    if (lastError) console.error("Last error:", lastError.message);
    console.log(`Inserted ${added} speakers, bypassed ${skipped} duplicates`);
    
    await client.end();
}

run().catch(console.error);
