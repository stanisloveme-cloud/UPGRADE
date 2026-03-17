import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('data/rendered_program.html', 'utf8');
const $ = cheerio.load(html);

console.log('Searching for 11:00 - 12:30 text...');
$('*:contains("11:00 - 12:30")').each((i, el) => {
    const t = $(el).text().replace(/\s+/g, ' ').trim();
    if(t.length < 500 && t.length > 50) console.log('Match time:', t);
});

console.log('Searching by name...');
$('*:contains("Ритейл стратегии")').each((i, el) => {
   const t = $(el).text().replace(/\s+/g, ' ').trim();
   if (t.length < 500 && t.length > 20) console.log('Match track:', t);
});
