const fs = require('fs');

const data = JSON.parse(fs.readFileSync('tmp/legacy_event_16.json', 'utf8'));

let results = new Set();
// Collect 10 sample objects from anywhere deeper in the tree that have > 3 string keys
function collectObjects(obj, count) {
    if(!obj || typeof obj !== 'object') return count;
    
    // Check if it's an entity object (not an array)
    if (!Array.isArray(obj) && Object.keys(obj).length > 3) {
        let stringProps = Object.keys(obj).filter(k => typeof obj[k] === 'string');
        if(stringProps.length >= 3 && obj.id) {
            results.add(JSON.stringify(obj).substring(0, 150));
            count++;
        }
    }
    
    if (count > 20) return count;
    
    if (Array.isArray(obj)) {
        for(let i=0; i<Math.min(obj.length, 5); i++) {
            count = collectObjects(obj[i], count);
            if(count > 20) return count;
        }
    } else {
        for(let k in obj) {
            count = collectObjects(obj[k], count);
            if(count > 20) return count;
        }
    }
    return count;
}

collectObjects(data.props.program, 0);

console.log("Sample entities found in program:");
Array.from(results).slice(0, 15).forEach(r => console.log(r));
