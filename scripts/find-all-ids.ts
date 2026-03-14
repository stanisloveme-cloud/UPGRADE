import * as fs from 'fs';
import * as path from 'path';

function run() {
    const dataPath = path.resolve(__dirname, '../data/urspring25_inertia_api.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    const ids = new Set<number>();
    
    function deepSearch(obj: any) {
        if (!obj) return;
        
        if (Array.isArray(obj)) {
            for (const item of obj) {
                deepSearch(item);
            }
        } else if (typeof obj === 'object') {
            // Если объект похож на EventSession
            if (obj.id && obj.start_time && obj.end_time && obj.title) {
                 ids.add(obj.id);
            }
            
            for (const key in obj) {
                // Избегаем бесконечной рекурсии и слишком глубоких системных объектов
                if (key !== 'program' && key !== 'eventApiData') deepSearch(obj[key]);
            }
        }
    }
    
    // В Inertia API все нужные данные лежат в props
    if (data.props) {
        deepSearch(data.props);
    }
    
    const idsArray = Array.from(ids);
    console.log('✅ Найдено настоящих уникальных ID сессий программы:', idsArray.length);
    
    if (idsArray.length > 0) {
        console.log('📄 Пример ID:', idsArray.slice(0, 10).join(', '));
        const outPath = path.resolve(__dirname, '../data/true_session_ids.json');
        
        const dataDir = path.resolve(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
             fs.mkdirSync(dataDir);
        }
        
        fs.writeFileSync(outPath, JSON.stringify(idsArray, null, 2));
        console.log(`💾 ID успешно сохранены в ${outPath}`);
    } else {
        console.log('⚠️ Сессии (с id, start_time, end_time, title) не найдены!');
    }
}

run();
