import * as fs from 'fs';
import * as path from 'path';

function run() {
    console.log('--- Inspecting Initial Inertia JSON ---');
    const dataPath = path.resolve(__dirname, '../data/urspring25_inertia_api.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const p = data.props.program;
    
    try {
        const day1 = Object.values(p.conferences)[0] as any;
        const room1 = Object.values(day1)[0] as any;
        const s1 = room1[Object.keys(room1)[0]];
        console.log('Session Sample Title:', s1.title);
        console.log('Session Keys:', Object.keys(s1));
        
        if (s1.users) {
            console.log('🔥 Session has users directly!', s1.users.length);
        } else if (s1.speakers) {
            console.log('🔥 Session has speakers directly!', s1.speakers.length);
        } else if (s1.session_speakers) {
            console.log('🔥 Session has session_speakers!', s1.session_speakers.length);
        } else {
            console.log('⚠️ No obvious direct users/speakers property on Session.');
        }

        console.log('\nGlobal Program Users array length:', p.users ? p.users.length : 0);
        if (p.users && p.users.length > 0) {
            const u = p.users[0];
            console.log('User sample keys:', Object.keys(u));
            console.log('User sample:', u.first_name, u.last_name, 'Company:', u.company, 'Roles:', u.roles ? u.roles.length : 0);
        }
        
        if (p.session_speakers) {
             console.log('\nGlobal session_speakers array length:', p.session_speakers.length);
        }
    } catch (e: any) {
        console.error('Error navigating object:', e.message);
    }
}

run();
