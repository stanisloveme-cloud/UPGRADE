import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('data/legacy_program_main.html', 'utf8');
const $ = cheerio.load(html);

console.log('Searching for 11:00 - 12:30 text...');
// Find elements containing '11:00 - 12:30'
$('*:contains("11:00 - 12:30")').each((i, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (text.length < 500 && text.length > 50) {
        console.log(`Match ${i}: \n${text}\n`);
    }
});
