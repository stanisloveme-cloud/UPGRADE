import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('C:/Users/PC/.gemini/antigravity/brain/183645cc-9f79-4bc4-bb6d-7e50046a7db6/sales_content.html', 'utf8');
const $ = cheerio.load(html);

console.log('--- Searching for schedule blocks ---');
// Let's guess standard Tilda class names or just look for times like '10:00 - 11:00'
let count = 0;
$('*').each((i, el) => {
    const text = $(el).text();
    if (text.match(/^\s*\d{2}:\d{2}\s*[-–]\s*\d{2}:\d{2}\s*$/)) {
        console.log(`Time block found: ${text.trim()}`);
        console.log(`  Classes: ${$(el).attr('class')}`);
        // Let's print the parent's generic structure or siblings to find titles
        let parent = $(el).parent();
        console.log(`  Parent Classes: ${parent.attr('class')}`);
        console.log(`  Parent Text: ${parent.text().replace(/\s+/g, ' ').substring(0, 100)}`);
        count++;
        if (count > 5) return false;
    }
});

// Since Upgrade CRM might be using a specific class for titles, let's also search for typical tilda 
const titles = $('.t-name, .t-title, .t-heading').slice(0, 10).map((i, el) => $(el).text().trim().substring(0, 50)).get();
console.log('Some title elements: ', titles);
