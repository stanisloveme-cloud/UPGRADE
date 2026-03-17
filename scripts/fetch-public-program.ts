import * as https from 'https';
import * as cheerio from 'cheerio';
import * as fs from 'fs';

https.get('https://spring.upgrade.st/program', (res) => {
    let rawHtml = '';
    res.on('data', (chunk) => { rawHtml += chunk; });
    res.on('end', () => {
        const $ = cheerio.load(rawHtml);
        
        let sessions = [];
        // Tilda's schedule block structure usually has .t-schedule__item
        // Let's try to find elements with time
        // Actually, Tilda uses .t-name, .t-title, or .t-descr inside the schedule
        // Let's print out text that looks like a time range: HH:MM - HH:MM
        
        console.log('--- Analyzing Public Program HTML ---');
        
        const timeRegex = /(?:^|\s)(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})(?:\s|$)/;
        
        $('*').each((i, el) => {
           const $el = $(el);
           // Only look at elements that are direct containers of text, to avoid parent containers
           if ($el.children().length > 3) return; 
           
           const text = $el.text().trim();
           const match = text.match(timeRegex);
           
           if (match) {
               // We found a time block!
               // Usually in Tilda, the title is either in the same element, a sibling, or a parent's sibling.
               // Let's print the parent's full text to see what it contains.
               let parentText = $el.parent().text().replace(/\s+/g, ' ').trim();
               if (parentText.length < 500) {
                   console.log(`TIME MATCH: ${match[1]} - ${match[2]}`);
                   console.log(`TEXT: ${parentText}\n`);
               }
           }
        });
        
        // Save to inspect
        fs.writeFileSync('data/public_program.html', rawHtml);
    });
});
