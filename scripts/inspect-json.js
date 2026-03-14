const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data/urspring25_raw.json'));
const p = data.inertiaProps.program;

let count = 0;
function findSessions(obj, path) {
    if (!obj || typeof obj !== 'object') return;
    
    // Check if it's a session-like object
    if (obj.id && obj.title && obj.start_time && obj.end_time) {
        if(count < 5) console.log(`Found session like object at ${path}: ID ${obj.id}, Title: ${obj.title}`);
        count++;
    }

    Object.keys(obj).forEach(key => {
        findSessions(obj[key], `${path}.${key}`);
    });
}

findSessions(p, 'program');
console.log('Total found:', count);
