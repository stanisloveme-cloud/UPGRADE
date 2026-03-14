const { Client } = require('pg');
const fs = require('fs');

async function run() {
    console.log("Connecting to DB...");
    const client = new Client({
        connectionString: 'postgresql://postgres:postgres@localhost:5432/upgrade?schema=public'
    });
    
    // Fallback to 5433 if 5432 fails
    try {
        await client.connect();
    } catch(e) {
        console.log("5432 failed, trying 5433...");
        client.connectionParameters.port = 5433;
        await client.connect();
    }
    
    console.log("Connected!");
    const data = JSON.parse(fs.readFileSync('scripts/scraped_speakers.json', 'utf8'));
    
    let added = 0;
    
    for (const ls of data) {
        const email = ls.email ? ls.email.substring(0, 255) : null;
        const phone = ls.phone ? ls.phone.substring(0, 50) : null;
        const fName = ls.name;
        const lName = ls.surname || '';
        const pos = ls.details ? ls.details.substring(0, 255) : null;
        const tg = ls.telegram ? ls.telegram.substring(0, 100) : null;
        
        // check exist
        let res = await client.query('SELECT id FROM "Speaker" WHERE email = $1 OR phone = $2 OR (first_name = $3 AND last_name = $4) LIMIT 1', [email, phone, fName, lName]);
        
        if (res.rows.length === 0) {
            await client.query('INSERT INTO "Speaker" (first_name, last_name, position, email, phone, telegram) VALUES ($1, $2, $3, $4, $5, $6)', [fName, lName, pos, email, phone, tg]);
            added++;
        }
    }
    
    console.log(`Inserted ${added} new speakers.`);
    await client.end();
}

run().catch(console.error);
