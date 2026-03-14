import * as fs from 'fs';
import * as path from 'path';

const dataDir = path.resolve(__dirname, '../data');
const configBuffer = fs.readFileSync(path.join(dataDir, 'api-config.json'), 'utf8');
const config = JSON.parse(configBuffer);

const headers = {
    'Accept': 'application/json, text/plain, */*',
    'Cookie': config.cookies,
    'X-Inertia': 'true',
    'X-Inertia-Version': config.inertiaVersion,
    'X-CSRF-TOKEN': config.csrfToken,
    'X-Requested-With': 'XMLHttpRequest'
};

async function fetchSpeakers() {
    try {
        console.log('🔗 Fetching /dashboard/session_content/speakers...');
        const response = await fetch('https://sales.upgradecrm.ru/dashboard/session_content/speakers', { headers });
        console.log('HTTP Status:', response.status);
        const text = await response.text();
        fs.writeFileSync(path.join(dataDir, 'session_content_speakers.json'), text);
        try {
            const json = JSON.parse(text);
            console.log('✅ Success! Keys:', Object.keys(json));
            if (json.props) console.log('Props keys:', Object.keys(json.props));
        } catch (e) {
            console.log('Result is not a raw JSON. Snippet:', text.substring(0, 200));
        }
    } catch (e: any) {
        console.error('Fetch error:', e.message);
    }
}

fetchSpeakers();
