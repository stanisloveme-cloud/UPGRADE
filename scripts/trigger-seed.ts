import * as fs from 'fs';

async function triggerSeedUrl() {
    console.log('Sending JSON payload to DevStand /api/seed-legacy...');
    
    // Read the raw JSON payload
    const rawData = fs.readFileSync('tmp/legacy_event_16.json', 'utf8');
    const legacyJson = JSON.parse(rawData);

    // Give the server time to come online if it just restarted, wait 3 seconds
    await new Promise(r => setTimeout(r, 3000));

    try {
        const response = await fetch('https://devupgrade.space4you.ru/api/seed-legacy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(legacyJson)
        });

        const data = await response.json();
        if (response.ok && data.success) {
            console.log('✅ DevStand Database Seeded Successfully!');
            console.log(data);
        } else {
            console.error('❌ Failed to seed sequence:');
            console.error(data);
        }
    } catch (e: any) {
         console.error('Network error reaching DevStand:', e.message);
    }
}

triggerSeedUrl().catch(console.error);
