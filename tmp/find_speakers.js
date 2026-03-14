const fs = require('fs');

const data = JSON.parse(fs.readFileSync('tmp/legacy_event_16.json', 'utf8'));

let results = [];

function searchObj(obj, path, depth) {
    if (depth > 6) return;
    if (!obj || typeof obj !== 'object') return;
    
    if (!Array.isArray(obj)) {
        if (
            (obj.name !== undefined && obj.last_name !== undefined) &&
            (obj.email !== undefined || obj.phone !== undefined || obj.position !== undefined || obj.company !== undefined)
        ) {
            results.push({path, id: obj.id, name: obj.name, email: obj.email});
            return; // don't go deeper into this object
        }
    }
    
    for (let k in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, k)) {
            searchObj(obj[k], `${path}.${k}`, depth + 1);
        }
    }
}

console.log("Searching properties...");
searchObj(data.props, 'props', 0);

console.log(`Found ${results.length} speaker-like objects.`);
if (results.length > 0) {
    console.log("Sample paths:", Array.from(new Set(results.slice(0, 10).map(r => r.path))));
    console.log("Sample obj keys:", results[0]);
} else {
    console.log("Could not find any objects matching speaker criteria.");
}
