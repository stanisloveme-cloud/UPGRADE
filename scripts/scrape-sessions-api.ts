import * as fs from 'fs';
import * as path from 'path';

// Load config and IDs
const dataDir = path.resolve(__dirname, '../data');
const configBuffer = fs.readFileSync(path.join(dataDir, 'api-config.json'), 'utf8');
const config = JSON.parse(configBuffer);
const sessionIdsBuffer = fs.readFileSync(path.join(dataDir, 'true_session_ids.json'), 'utf8');
const sessionIds: number[] = JSON.parse(sessionIdsBuffer);

console.log(`🚀 Начинаем парсинг ${sessionIds.length} сессий через API...`);

const headers = {
    'Accept': 'application/json, text/plain, */*',
    'Cookie': config.cookies,
    'X-Inertia': 'true',
    'X-Inertia-Version': config.inertiaVersion,
    'X-CSRF-TOKEN': config.csrfToken,
    'X-Requested-With': 'XMLHttpRequest'
};

const results: any[] = [];

async function scrapeSession(id: number, retries = 3): Promise<any> {
    const url = `https://sales.upgradecrm.ru/dashboard/program/session/${id}/edit`;
    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            if (retries > 0) {
               console.warn(`⚠️ Ошибка HTTP ${response.status} для ${id}. Повтор... (${retries} осталось)`);
               await new Promise(r => setTimeout(r, 2000));
               return scrapeSession(id, retries - 1);
            }
            throw new Error(`HTTP Error: ${response.status}`);
        }
        return await response.json();
    } catch (e) {
        if (retries > 0) {
           console.warn(`⚠️ Сетевая ошибка для ${id}: ${(e as Error).message}. Повтор...`);
           await new Promise(r => setTimeout(r, 2000));
           return scrapeSession(id, retries - 1);
        }
        console.error(`❌ Провален сбор сессии ${id}:`, (e as Error).message);
        return null;
    }
}

async function run() {
    for (let i = 0; i < sessionIds.length; i++) {
        const id = sessionIds[i];
        console.log(`[${i+1}/${sessionIds.length}] Тянем сессию ${id}...`);
        
        const data = await scrapeSession(id);
        results.push({ id, rawData: data });
        
        // Small delay to prevent rate-limiting
        await new Promise(r => setTimeout(r, 500));
    }
    
    fs.writeFileSync(path.join(dataDir, 'urspring25_sessions_full.json'), JSON.stringify(results, null, 2));
    console.log(`✅ Сбор завершен! Сохранено ${results.length} сессий в data/urspring25_sessions_full.json`);
}

run().catch(console.error);
