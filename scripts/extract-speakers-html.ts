import * as fs from 'fs';
import * as path from 'path';

function run() {
    const htmlPath = path.resolve(__dirname, '../data/session_content_speakers.html');
    if (!fs.existsSync(htmlPath)) {
        console.error('HTML file not found!');
        return;
    }
    const html = fs.readFileSync(htmlPath, 'utf8');
    
    // В Inertia.js данные лежат в <div id="app" data-page="{...}"></div>
    const match = html.match(/data-page="([^"]+)"/);
    if (match && match[1]) {
        try {
            // Декодируем HTML entities (Inertia эскейпит кавычки как &quot;)
            const jsonStr = match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
            const data = JSON.parse(jsonStr);
            
            const outPath = path.resolve(__dirname, '../data/session_content_speakers_extracted.json');
            fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
            console.log(`✅ Extracted data-page JSON to ${outPath}`);
            console.log('Props keys:', Object.keys(data.props || {}));
            
            if (data.props && data.props.speakers) {
                console.log(`🔥 FOUND ${data.props.speakers.length} SPEAKERS!`);
                if (data.props.speakers.length > 0) {
                     console.log('Sample speaker:', data.props.speakers[0].first_name, data.props.speakers[0].last_name);
                }
            } else {
                console.log('⚠️ No speakers array in props!');
            }
        } catch (e: any) {
            console.error('Failed to parse JSON:', e.message);
        }
    } else {
        console.log('Could not find data-page attribute in HTML.');
    }
}

run();
