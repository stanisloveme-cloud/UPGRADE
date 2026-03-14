import * as fs from 'fs';
import * as path from 'path';

const url = 'https://sales.upgradecrm.ru/dashboard/program/event/16';

async function run() {
    console.log('🚀 Запускаем API парсер программы...');
    
    const cookiePath = path.resolve(__dirname, '../data/api-config.json');
    if (!fs.existsSync(cookiePath)) {
        console.error('❌ Файл data/api-config.json не найден! Запустите сначала скрипт авторизации.');
        return;
    }
    
    const configStr = fs.readFileSync(cookiePath, 'utf8');
    const config = JSON.parse(configStr);
    console.log('🔗 Конфиг загружен. Отправляем запрос к:', url);

    const headers = {
        'Accept': 'application/json, text/plain, */*',
        'Cookie': config.cookies,
        'X-Inertia': 'true',
        'X-Inertia-Version': config.inertiaVersion,
        'X-CSRF-TOKEN': config.csrfToken,
        'X-Requested-With': 'XMLHttpRequest'
    };

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            console.error(`❌ Ошибка HTTP: ${response.status} ${response.statusText}`);
            return;
        }

        const data = await response.json();
        const dataDir = path.resolve(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }

        fs.writeFileSync(path.join(dataDir, 'urspring25_inertia_api.json'), JSON.stringify(data, null, 2));
        console.log('✅ Исходный JSON получен и сохранен в data/urspring25_inertia_api.json');

        // Extract session IDs
        const sessionIds: number[] = [];
        
        function findSess(obj: any) {
            if (!obj || typeof obj !== 'object') return;
            
            Object.keys(obj).forEach(key => {
                if (key === 'sessions' && Array.isArray(obj[key])) {
                    obj[key].forEach((s: any) => {
                        if (s && s.id) sessionIds.push(s.id);
                    });
                } else if (key === 'session' && obj[key] && obj[key].id) {
                    sessionIds.push(obj[key].id);
                }
                
                if (typeof obj[key] === 'object') {
                    findSess(obj[key]);
                }
            });
        }
        
        findSess(data);
        const uniqueIds = Array.from(new Set(sessionIds));
        console.log(`🔍 Найдено уникальных сессий: ${uniqueIds.length}`);

        if (uniqueIds.length === 0) {
           console.log('⚠️ Сессии не найдены в JSON. Возможно сервер присылает их отдельно.');
        } else {
           fs.writeFileSync(path.join(dataDir, 'urspring25_session_ids.json'), JSON.stringify(uniqueIds, null, 2));
           console.log('✅ ID сессий сохранены.');
        }

    } catch (e) {
        console.error('❌ Ошибка выполнения:', (e as Error).message);
    }
}

run();
