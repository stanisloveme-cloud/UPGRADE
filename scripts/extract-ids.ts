import * as fs from 'fs';
import * as path from 'path';

function run() {
    const dataPath = path.resolve(__dirname, '../data/urspring25_inertia_api.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const prog = data.props.program;
    
    const ids = new Set<number>();
    
    if (prog.conferences) {
        Object.keys(prog.conferences).forEach(dayKey => {
            const conf = prog.conferences[dayKey];
            Object.keys(conf).forEach(roomId => {
                const room = conf[roomId];
                if (room && room.event_sessions && Array.isArray(room.event_sessions)) {
                    room.event_sessions.forEach((s: any) => {
                        if (s && s.id) {
                            ids.add(s.id);
                        }
                    });
                }
            });
        });
    }

    const idsArray = Array.from(ids);
    console.log('✅ Найдено настоящих ID сессий программы:', idsArray.length);
    if (idsArray.length > 0) {
        console.log('📄 Пример ID:', idsArray.slice(0, 5).join(', '));
        const outPath = path.resolve(__dirname, '../data/true_session_ids.json');
        
        const dataDir = path.resolve(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
             fs.mkdirSync(dataDir);
        }
        
        fs.writeFileSync(outPath, JSON.stringify(idsArray, null, 2));
        console.log(`💾 ID успешно сохранены в ${outPath}`);
    } else {
        console.log('⚠️ Сессии не найдены в структуре conferences -> room -> event_sessions');
    }
}

run();
