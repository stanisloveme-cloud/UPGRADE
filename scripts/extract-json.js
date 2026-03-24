const fs = require('fs');
const path = require('path');

const mdPath = 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\ca4f8900-27b8-4ff6-9e27-2403dc5cb334\\browser\\scratchpad_luhyo1oq.md';
const targetPath = 'd:\\UPGRADE\\scripts\\market_segments.json';

const md = fs.readFileSync(mdPath, 'utf8');
const match = md.match(/```json\n([\s\S]*?)```/);

if (match) {
    fs.writeFileSync(targetPath, match[1]);
    console.log('Saved JSON to', targetPath);
} else {
    console.log('No JSON found in scratchpad');
    process.exit(1);
}
